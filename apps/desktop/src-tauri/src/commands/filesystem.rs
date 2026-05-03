use std::path::{Path, PathBuf};
use tokio::fs;

/// Metadata for a directory entry
#[derive(serde::Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    /// File or directory name (not full path)
    pub name: String,
    /// Whether the entry is a directory
    pub is_directory: bool,
    /// Full absolute path to the entry
    pub path: String,
}

/// Validates that the resolved path is strictly inside the allowed root directory.
/// This prevents path traversal attacks.
fn validate_path(path: &str, allowed_root: &str) -> Result<PathBuf, String> {
    let canonical_path = Path::new(path)
        .canonicalize()
        .map_err(|e| format!("Cannot resolve path '{}': {}", path, e))?;
    let canonical_root = Path::new(allowed_root)
        .canonicalize()
        .map_err(|e| format!("Cannot resolve root '{}': {}", allowed_root, e))?;
    if !canonical_path.starts_with(&canonical_root) {
        return Err(format!(
            "Access denied: path '{}' is outside the project directory",
            path
        ));
    }
    Ok(canonical_path)
}

/// Reads the text content of a file within the project directory.
///
/// # Arguments
/// * `path` - Absolute path to the file to read
/// * `project_path` - Absolute path to the project root (used for path validation)
///
/// # Returns
/// File content as a UTF-8 string
#[tauri::command]
pub async fn read_file_content(path: String, project_path: String) -> Result<String, String> {
    let safe_path = validate_path(&path, &project_path)?;
    fs::read_to_string(&safe_path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))
}

/// Writes text content to a file within the project directory.
///
/// Creates the file if it does not exist. Creates parent directories if needed.
/// On success, all running hot-reload watchers (chokidar) will detect the change.
///
/// # Arguments
/// * `path` - Absolute path to the file to write
/// * `content` - Text content to write
/// * `project_path` - Absolute path to the project root (used for path validation)
#[tauri::command]
pub async fn write_file_content(
    path: String,
    content: String,
    project_path: String,
) -> Result<(), String> {
    // For writes, the file may not exist yet so we can't canonicalize it.
    // Instead, canonicalize the parent directory.
    let target = Path::new(&path);
    let parent = target
        .parent()
        .ok_or_else(|| format!("Cannot determine parent directory for '{}'", path))?;

    // Create parent directories if they don't exist
    fs::create_dir_all(parent)
        .await
        .map_err(|e| format!("Failed to create directories: {}", e))?;

    // Now validate after creating the parents
    let canonical_root = Path::new(&project_path)
        .canonicalize()
        .map_err(|e| format!("Cannot resolve root: {}", e))?;
    let canonical_parent = parent
        .canonicalize()
        .map_err(|e| format!("Cannot resolve parent path: {}", e))?;

    if !canonical_parent.starts_with(&canonical_root) {
        return Err("Access denied: path is outside the project directory".into());
    }

    fs::write(&path, content)
        .await
        .map_err(|e| format!("Failed to write file: {}", e))
}

/// Lists the entries (files and directories) in a directory within the project.
///
/// # Arguments
/// * `path` - Absolute path to the directory to list
/// * `project_path` - Absolute path to the project root (used for path validation)
///
/// # Returns
/// Vector of file/directory entries with name, type, and full path
#[tauri::command]
pub async fn list_directory(path: String, project_path: String) -> Result<Vec<FileEntry>, String> {
    let safe_path = validate_path(&path, &project_path)?;

    let mut dir = fs::read_dir(&safe_path)
        .await
        .map_err(|e| format!("Failed to read directory '{}': {}", path, e))?;

    let mut entries = Vec::new();
    while let Some(entry) = dir
        .next_entry()
        .await
        .map_err(|e| format!("Failed to read directory entry: {}", e))?
    {
        let metadata = entry
            .metadata()
            .await
            .map_err(|e| format!("Failed to read metadata: {}", e))?;
        entries.push(FileEntry {
            name: entry.file_name().to_string_lossy().into_owned(),
            is_directory: metadata.is_dir(),
            path: entry.path().to_string_lossy().into_owned(),
        });
    }

    // Sort: directories first, then files, both alphabetically
    entries.sort_by(|a, b| match (a.is_directory, b.is_directory) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.cmp(&b.name),
    });

    Ok(entries)
}

/// Deletes a file within the project directory.
///
/// # Arguments
/// * `path` - Absolute path to the file to delete
/// * `project_path` - Absolute path to the project root (used for path validation)
#[tauri::command]
pub async fn delete_file(path: String, project_path: String) -> Result<(), String> {
    let safe_path = validate_path(&path, &project_path)?;
    if safe_path.is_dir() {
        return Err("Cannot delete a directory with delete_file".into());
    }
    fs::remove_file(&safe_path)
        .await
        .map_err(|e| format!("Failed to delete file: {}", e))
}
