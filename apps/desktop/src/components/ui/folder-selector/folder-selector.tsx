import { open } from "@tauri-apps/plugin-dialog";
import { X } from "lucide-react";
import { useCallback, useEffect } from "react";

import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";

export function FolderSelector() {
  const projectPath = useProjectStore(
    (state) =>
      state.projects.find((p) => p.id === state.activeProjectId)?.path ?? null,
  );
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const addProject = useProjectStore((state) => state.addProject);
  const removeProject = useProjectStore((state) => state.removeProject);

  const isLoading = useServerStore(
    (state) => state.status === "starting" || state.status === "stopping",
  );
  const error = useServerStore((state) => state.error);

  const handleSelectFolder = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected) {
        await addProject(selected);
      }
    } catch (err) {
      alert(`Error selecting folder: ${err}`);
    }
  }, [addProject]);

  const removeFolder = useCallback(() => {
    if (activeProjectId) {
      removeProject(activeProjectId);
    }
  }, [activeProjectId, removeProject]);

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
