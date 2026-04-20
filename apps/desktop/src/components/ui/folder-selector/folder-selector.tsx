import { open } from "@tauri-apps/plugin-dialog";
import { X } from "lucide-react";
import { useCallback, useEffect } from "react";

import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { useAppStore } from "@/stores/app-store";

export function FolderSelector() {
  const projectPath = useAppStore((state) => state.projectPath);
  const setProjectPath = useAppStore((state) => state.setProjectPath);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);

  const handleSelectFolder = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected) {
        // Set the project path, which will trigger config loading and Core initialization
        await setProjectPath(selected);
      }
    } catch (error) {
      alert(`Error selecting folder: ${error}`);
    }
  }, [setProjectPath]);

  const removeFolder = useCallback(async () => {
    // Clear the project path and reset state
    await setProjectPath(null);
  }, [setProjectPath]);

  // Show error alert if there's an error loading config
  useEffect(() => {
    if (error) {
      alert(`Error loading configuration: ${error}`);
    }
  }, [error]);

  return (
    <div className="flex flex-row w-full">
      <div className="flex flex-row w-full" onClick={handleSelectFolder}>
        <Button className="rounded-r-none" disabled={isLoading}>
          {isLoading ? "Loading..." : "Select folder"}
        </Button>
        <Input
          className="rounded-none hover:cursor-default"
          disabled
          placeholder="Select project folder..."
          value={projectPath ?? ""}
        />
      </div>
      <Button
        variant="outline"
        className="rounded-l-none"
        onClick={removeFolder}
        disabled={isLoading || !projectPath}
      >
        <X />
      </Button>
    </div>
  );
}
