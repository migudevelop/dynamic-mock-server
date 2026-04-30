use crate::state::{LogEntry, ManagedServerState, ServerProcess, ServerState};
use std::path::Path;
use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, BufReader};

/// Start result returned to the frontend
#[derive(serde::Serialize)]
pub struct StartServerResult {
    /// Whether the server was started successfully
    pub success: bool,
    /// The OS process ID
    pub pid: Option<u32>,
}

/// Starts the dynamic-mock-server in the given project directory.
///
/// Spawns the CLI as a child process, captures stdout/stderr, and emits
/// "server-log" events to the frontend window.
///
/// # Arguments
/// * `project_path` - Absolute path to the user's project directory
/// * `state` - Tauri managed server state
/// * `app` - Tauri app handle for event emission
///
/// # Returns
/// `StartServerResult` with success flag and PID
#[tauri::command]
pub async fn start_server(
    project_path: String,
    host: Option<String>,
    port: Option<u16>,
    state: tauri::State<'_, ManagedServerState>,
    app: tauri::AppHandle,
) -> Result<StartServerResult, String> {
    let mut locked = state.lock().await;

    // Reject if a server is already running
    if locked.process.is_some() {
        return Err("A server is already running. Stop it first.".into());
    }

    // Resolve the CLI binary path for the current OS
    let bin_path = {
        let base = Path::new(&project_path)
            .join("node_modules")
            .join(".bin");
        let win = base.join("dynamic-mock-server.cmd");
        let unix = base.join("dynamic-mock-server");
        if win.exists() {
            win
        } else if unix.exists() {
            unix
        } else {
            return Err(format!(
                "dynamic-mock-server CLI not found in {}",
                base.display()
            ));
        }
    };

    // Spawn the process with piped stdio.
    // On Windows, .cmd files are batch scripts and must be invoked via `cmd /c`.
    let mut child = {
        let bin_str = bin_path
            .to_str()
            .ok_or_else(|| "Binary path contains invalid UTF-8".to_string())?;

        let mut cmd = if cfg!(target_os = "windows") {
            let mut c = tokio::process::Command::new("cmd");
            c.args(["/c", bin_str, "start"]);
            c
        } else {
            let mut c = tokio::process::Command::new(bin_str);
            c.arg("start");
            c
        };

        cmd.current_dir(&project_path)
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .kill_on_drop(true)
            .spawn()
            .map_err(|e| format!("Failed to start server process: {}", e))?
    };

    let pid = child.id();

    // Capture stdout asynchronously.
    // Also auto-detects the actual listening address from the startup log so that
    // server_status polls the correct host:port even when the CLI config differs
    // from what the frontend config parser extracted.
    if let Some(stdout) = child.stdout.take() {
        let state_clone = state.inner().clone();
        let app_clone = app.clone();
        tokio::spawn(async move {
            let mut lines = BufReader::new(stdout).lines();
            while let Ok(Some(line)) = lines.next_line().await {
                // Detect "Server listening at http://host:port" in the startup log.
                // The line may contain ANSI colour codes, e.g.:
                //   "INFO: \x1b[36mServer listening at http://127.0.0.1:3000\x1b[0m"
                // We parse everything after "http://" up to the first non-URL character.
                let detected_addr = if line.contains("listening at") {
                    line.find("http://").and_then(|idx| {
                        let after = &line[idx + 7..];
                        let end = after
                            .find(|c: char| {
                                !c.is_alphanumeric()
                                    && c != '.'
                                    && c != ':'
                                    && c != '-'
                                    && c != '_'
                            })
                            .unwrap_or(after.len());
                        let host_port = &after[..end];
                        host_port.rfind(':').and_then(|colon| {
                            host_port[colon + 1..].parse::<u16>().ok().map(|p| {
                                (host_port[..colon].to_string(), p)
                            })
                        })
                    })
                } else {
                    None
                };

                let entry = LogEntry {
                    timestamp: chrono::Utc::now().to_rfc3339(),
                    stream: "stdout".into(),
                    message: line.clone(),
                };
                let _ = app_clone.emit("server-log", &entry);
                let mut s = state_clone.lock().await;
                // Apply the detected address update and log push in a single lock hold.
                if let Some((new_host, new_port)) = detected_addr {
                    if let Some(proc) = s.process.as_mut() {
                        proc.host = new_host;
                        proc.port = new_port;
                    }
                }
                s.push_log(entry);
            }
        });
    }

    // Capture stderr asynchronously
    if let Some(stderr) = child.stderr.take() {
        let state_clone = state.inner().clone();
        let app_clone = app.clone();
        tokio::spawn(async move {
            let mut lines = BufReader::new(stderr).lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let entry = LogEntry {
                    timestamp: chrono::Utc::now().to_rfc3339(),
                    stream: "stderr".into(),
                    message: line.clone(),
                };
                let _ = app_clone.emit("server-log", &entry);
                let mut s = state_clone.lock().await;
                s.push_log(entry);
            }
        });
    }

    locked.process = Some(ServerProcess {
        child,
        host: host.unwrap_or_else(|| "127.0.0.1".into()),
        port: port.unwrap_or(3000),
        project_path,
    });

    Ok(StartServerResult {
        success: true,
        pid,
    })
}

/// Stops the running mock server process.
///
/// Sends a kill signal to the child process and waits for it to exit.
/// Clears the process from managed state.
///
/// # Arguments
/// * `state` - Tauri managed server state
#[tauri::command]
pub async fn stop_server(state: tauri::State<'_, ManagedServerState>) -> Result<(), String> {
    let mut locked = state.lock().await;

    match locked.process.take() {
        None => Err("No server is currently running.".into()),
        Some(mut proc) => {
            proc.child
                .kill()
                .await
                .map_err(|e| format!("Failed to kill server process: {}", e))?;
            // Wait for the process to exit cleanly (ignore errors)
            let _ = proc.child.wait().await;
            Ok(())
        }
    }
}

/// Status response from the mock server admin API
#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ServerStatusResponse {
    /// Whether the server process is tracked in state
    pub running: bool,
    /// Total number of registered routes (when running)
    pub total_routes: Option<u32>,
    /// Total number of responses across all routes (when running)
    pub total_responses: Option<u32>,
    /// Total number of suites (when running)
    pub total_suites: Option<u32>,
    /// Currently active suite name (when running)
    pub active_suite: Option<String>,
    /// Host the server is bound to
    pub host: Option<String>,
    /// Port the server is listening on
    pub port: Option<u16>,
}

/// Checks the server status by calling the /__admin/status endpoint.
///
/// Returns running=false if no process is tracked or if the HTTP call fails.
///
/// # Arguments
/// * `state` - Tauri managed server state
#[tauri::command]
pub async fn server_status(
    state: tauri::State<'_, ManagedServerState>,
) -> Result<ServerStatusResponse, String> {
    let locked = state.lock().await;

    let (host, port) = match &locked.process {
        None => {
            return Ok(ServerStatusResponse {
                running: false,
                total_routes: None,
                total_responses: None,
                total_suites: None,
                active_suite: None,
                host: None,
                port: None,
            })
        }
        Some(proc) => (proc.host.clone(), proc.port),
    };
    drop(locked); // release lock before HTTP call

    let url = format!("http://{}:{}/__admin/status", host, port);
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(2))
        .build()
        .map_err(|e| e.to_string())?;

    match client.get(&url).send().await {
        Err(_) => Ok(ServerStatusResponse {
            running: false,
            total_routes: None,
            total_responses: None,
            total_suites: None,
            active_suite: None,
            host: Some(host),
            port: Some(port),
        }),
        Ok(resp) => {
            #[derive(serde::Deserialize)]
            #[serde(rename_all = "camelCase")]
            struct AdminStatus {
                total_routes: Option<u32>,
                total_responses: Option<u32>,
                total_suites: Option<u32>,
                active_suite: Option<String>,
            }
            let body = resp.json::<AdminStatus>().await.map_err(|e| e.to_string())?;
            Ok(ServerStatusResponse {
                running: true,
                total_routes: body.total_routes,
                total_responses: body.total_responses,
                total_suites: body.total_suites,
                active_suite: body.active_suite,
                host: Some(host),
                port: Some(port),
            })
        }
    }
}

/// Returns the captured server log entries.
///
/// # Arguments
/// * `state` - Tauri managed server state
/// * `limit` - Optional maximum number of recent entries to return (default: 100)
///
/// # Returns
/// Vector of log entries from most recent to oldest
#[tauri::command]
pub async fn get_server_logs(
    state: tauri::State<'_, ManagedServerState>,
    limit: Option<usize>,
) -> Result<Vec<LogEntry>, String> {
    let locked = state.lock().await;
    let n = limit.unwrap_or(100).min(ServerState::MAX_LOGS);
    let logs = if locked.logs.len() <= n {
        locked.logs.clone()
    } else {
        locked.logs[locked.logs.len() - n..].to_vec()
    };
    Ok(logs)
}
