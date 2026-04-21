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
try {
  const mod = require(configPath);
  const resolved = mod.default !== undefined ? mod.default : mod;
  console.log(JSON.stringify(resolved));
} catch (e) {
  console.error('Failed to load config: ' + e.message);
  process.exit(1);
}
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
