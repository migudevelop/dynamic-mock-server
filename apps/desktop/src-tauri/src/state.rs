use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::process::Child;

/// A log entry captured from the server process stdout/stderr
#[derive(Debug, Clone, serde::Serialize)]
pub struct LogEntry {
    /// ISO 8601 timestamp when the log was captured
    pub timestamp: String,
    /// Stream source: "stdout" or "stderr"
    pub stream: String,
    /// The log line content
    pub message: String,
}

/// Represents the running mock server process and its metadata
pub struct ServerProcess {
    /// The spawned child process handle
    pub child: Child,
    /// Host the server is bound to (e.g. "127.0.0.1")
    pub host: String,
    /// Port the server is listening on
    pub port: u16,
    /// Absolute path to the user's project directory — stored for future use
    #[allow(dead_code)]
    pub project_path: String,
}

/// Shared mutable state for the running server
pub struct ServerState {
    /// Current running server process, if any
    pub process: Option<ServerProcess>,
    /// Captured log lines (capped at MAX_LOGS)
    pub logs: Vec<LogEntry>,
}

impl ServerState {
    /// Maximum number of log lines to keep in memory
    pub const MAX_LOGS: usize = 1000;

    /// Creates a new empty ServerState
    pub fn new() -> Self {
        Self {
            process: None,
            logs: Vec::new(),
        }
    }

    /// Appends a log entry, evicting the oldest if over capacity
    pub fn push_log(&mut self, entry: LogEntry) {
        if self.logs.len() >= Self::MAX_LOGS {
            self.logs.remove(0);
        }
        self.logs.push(entry);
    }
}

impl Default for ServerState {
    fn default() -> Self {
        Self::new()
    }
}

/// Thread-safe wrapper for ServerState managed by Tauri
pub type ManagedServerState = Arc<Mutex<ServerState>>;
