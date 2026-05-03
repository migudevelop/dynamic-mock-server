use std::path::Path;

/// Checks whether the dynamic-mock-server CLI binary exists in the given project's node_modules.
///
/// # Arguments
/// * `project_path` - Absolute path to the user's project root directory
///
/// # Returns
/// `true` if the CLI binary is found, `false` otherwise
#[tauri::command]
pub async fn detect_cli(project_path: String) -> Result<bool, String> {
    let base = Path::new(&project_path).join("node_modules").join(".bin");
    // On Unix the binary has no extension; on Windows it has .cmd
    let unix_bin = base.join("dynamic-mock-server");
    let win_bin = base.join("dynamic-mock-server.cmd");
    Ok(unix_bin.exists() || win_bin.exists())
}

/// Evaluates the project's dynamicMockServer config file by spawning a Node.js process
/// and returns the resolved configuration as a JSON string.
///
/// Supports .js, .cjs, .mjs config files. Falls back to `npx tsx` for .ts files.
///
/// # Arguments
/// * `project_path` - Absolute path to the user's project root directory
///
/// # Returns
/// JSON string of the resolved configuration
#[tauri::command]
pub async fn read_config(project_path: String) -> Result<String, String> {
    // Node.js one-liner: search for the config file and output it as JSON
    let script = r#"
(async function() {
  const path = require('path');
  const fs = require('fs');
  const exts = ['.js', '.cjs', '.mjs'];
  const base = path.join(process.cwd(), 'dynamicMockServer.config');
  let configPath = null;
  for (const ext of exts) {
    if (fs.existsSync(base + ext)) { configPath = base + ext; break; }
  }
  if (!configPath) {
    try {
      const jsonPath = base + '.json';
      if (fs.existsSync(jsonPath)) {
        console.log(fs.readFileSync(jsonPath, 'utf8'));
        process.exit(0);
      }
    } catch(_) {}
    console.error('Config file not found');
    process.exit(1);
  }
  let mod;
  try {
    mod = require(configPath);
  } catch (e) {
    if (e.code === 'ERR_REQUIRE_ESM' || e.name === 'SyntaxError') {
      const { pathToFileURL } = require('url');
      try {
        mod = await import(pathToFileURL(configPath).href);
      } catch (e2) {
        if (e2.name === 'SyntaxError') {
          // ESM syntax in a non-module package (.js without "type":"module").
          // Use a data: URL so Node.js parses the content as ESM regardless of package.json.
          const content = fs.readFileSync(configPath, 'utf8');
          const b64 = Buffer.from(content).toString('base64');
          mod = await import('data:text/javascript;base64,' + b64);
        } else {
          throw e2;
        }
      }
    } else {
      throw e;
    }
  }
  const resolved = mod.default !== undefined ? mod.default : mod;
  console.log(JSON.stringify(resolved));
})().catch(function(e) {
  console.error('Failed to load config: ' + e.message);
  process.exit(1);
});
"#;

    let output = tokio::process::Command::new("node")
        .args(["-e", script])
        .current_dir(&project_path)
        .output()
        .await
        .map_err(|e| format!("Failed to spawn node: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        // Validate it's valid JSON before returning
        serde_json::from_str::<serde_json::Value>(&stdout)
            .map_err(|e| format!("Config is not valid JSON: {}", e))?;
        return Ok(stdout);
    }

    // If node failed, try with tsx for .ts config files
    let ts_script = r#"
import path from 'path';
import fs from 'fs';
const base = path.join(process.cwd(), 'dynamicMockServer.config');
const tsPath = base + '.ts';
if (!fs.existsSync(tsPath)) { console.error('Config file not found'); process.exit(1); }
const mod = await import(tsPath);
const resolved = mod.default !== undefined ? mod.default : mod;
console.log(JSON.stringify(resolved));
"#;

    let tsx_output = tokio::process::Command::new("npx")
        .args(["tsx", "-e", ts_script])
        .current_dir(&project_path)
        .output()
        .await
        .map_err(|e| format!("Failed to spawn npx tsx: {}", e))?;

    if tsx_output.status.success() {
        let stdout = String::from_utf8_lossy(&tsx_output.stdout).trim().to_string();
        serde_json::from_str::<serde_json::Value>(&stdout)
            .map_err(|e| format!("Config is not valid JSON: {}", e))?;
        return Ok(stdout);
    }

    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    Err(format!("Failed to read config: {}", stderr))
}

/// Evaluates a JavaScript/CommonJS file in the project and returns its export as a JSON string.
///
/// Uses Node.js to `require()` the file and serializes the result with `JSON.stringify`.
/// This is used to read route and suite definition files without running the full server.
///
/// # Arguments
/// * `file_path` - Absolute path to the JS file to evaluate
/// * `project_path` - Absolute path to the project root (used for path validation and CWD)
///
/// # Returns
/// JSON string of the module export
#[tauri::command]
pub async fn evaluate_js_file(
    file_path: String,
    project_path: String,
) -> Result<String, String> {
    // Security: validate that the file is inside the project directory
    let project = std::path::Path::new(&project_path)
        .canonicalize()
        .map_err(|e| format!("Invalid project path: {}", e))?;
    let file = std::path::Path::new(&file_path)
        .canonicalize()
        .map_err(|e| format!("File not found or inaccessible: {}", e))?;
    if !file.starts_with(&project) {
        return Err("Access denied: file is outside the project directory".into());
    }

    // Use forward slashes for Node.js compatibility on Windows.
    // canonicalize() on Windows produces \\\\ UNC extended paths; strip that prefix first.
    let file_str = {
        let raw = file.to_string_lossy();
        let clean = raw.strip_prefix(r"\\?\").unwrap_or(&raw);
        clean.replace('\\', "/")
    };

    let script = format!(
        "try {{ \
            const m = require({:?}); \
            const r = (m && m.default !== undefined) ? m.default : m; \
            process.stdout.write(JSON.stringify(r)); \
        }} catch(e) {{ \
            process.stderr.write(e.message); \
            process.exit(1); \
        }}",
        file_str
    );

    let output = tokio::process::Command::new("node")
        .args(["-e", &script])
        .current_dir(&project_path)
        .output()
        .await
        .map_err(|e| format!("Failed to spawn node: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Failed to evaluate file: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    serde_json::from_str::<serde_json::Value>(&stdout)
        .map_err(|e| format!("File did not produce valid JSON: {}", e))?;

    Ok(stdout)
}
