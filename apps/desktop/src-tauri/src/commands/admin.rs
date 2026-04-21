use crate::state::ManagedServerState;

/// Payload for proxied admin API requests
#[derive(serde::Deserialize, Debug)]
pub struct AdminRequestPayload {
    /// HTTP method: GET, POST, PUT, DELETE
    pub method: String,
    /// Path relative to /__admin, must start with "/"
    pub path: String,
    /// Optional JSON body as string
    pub body: Option<String>,
}

/// Response from the admin API proxy
#[derive(serde::Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AdminResponse {
    /// HTTP status code from the mock server
    pub status_code: u16,
    /// Response body as string
    pub body: String,
}

/// Proxies an HTTP request to the running mock server's admin API.
///
/// All communication from the frontend to the mock server's /__admin/* endpoints
/// goes through this command to avoid CORS issues in the Tauri webview.
///
/// # Arguments
/// * `payload` - The request method, path, and optional body
/// * `state` - Tauri managed server state (provides host/port)
///
/// # Returns
/// The HTTP status code and response body from the mock server
#[tauri::command]
pub async fn admin_request(
    payload: AdminRequestPayload,
    state: tauri::State<'_, ManagedServerState>,
) -> Result<AdminResponse, String> {
    // Validate the path to prevent abuse
    if !payload.path.starts_with('/') {
        return Err("Path must start with '/'".into());
    }
    if payload.path.contains("..") {
        return Err("Path must not contain '..'".into());
    }
    // Only allow known HTTP methods
    let method = match payload.method.to_uppercase().as_str() {
        "GET" | "POST" | "PUT" | "DELETE" => payload.method.to_uppercase(),
        other => return Err(format!("Unsupported HTTP method: {}", other)),
    };

    // Get host/port from managed state — never accept from the caller (prevents SSRF)
    let (host, port) = {
        let locked = state.lock().await;
        match &locked.process {
            None => return Err("No server is currently running.".into()),
            Some(proc) => (proc.host.clone(), proc.port),
        }
    };

    let url = format!("http://{}:{}/__admin{}", host, port, payload.path);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let mut req = match method.as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        _ => unreachable!(),
    };

    if let Some(body) = payload.body {
        req = req
            .header("Content-Type", "application/json")
            .body(body);
    }

    let resp = req.send().await.map_err(|e| format!("Request failed: {}", e))?;
    let status_code = resp.status().as_u16();
    let body = resp.text().await.map_err(|e| e.to_string())?;

    Ok(AdminResponse { status_code, body })
}
