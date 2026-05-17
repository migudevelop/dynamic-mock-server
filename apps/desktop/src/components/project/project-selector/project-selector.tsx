import { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { open } from "@tauri-apps/plugin-dialog";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/shadcn/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";

import type { SavedProject } from "@/types/project.types";

/**
 * Dropdown that lists all saved projects and lets the user switch between them
 * or add a new project by opening a system folder-picker dialog.
 *
 * On project switch, the server store is reset and the project config is reloaded.
 * Includes a delete button to remove the active project from the list.
 */
export default function ProjectSelector() {
  const [projectToDelete, setProjectToDelete] = useState<SavedProject | null>(
    null,
  );

  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const addProject = useProjectStore((s) => s.addProject);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const removeProject = useProjectStore((s) => s.removeProject);

  const status = useServerStore((s) => s.status);
  const loadConfig = useServerStore((s) => s.loadConfig);
  const reset = useServerStore((s) => s.reset);
  const stopServer = useServerStore((s) => s.stopServer);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  async function handleValueChange(value: string) {
    if (value === "__add__") {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select project folder",
      });
      if (selected && typeof selected === "string") {
        const project = await addProject(selected);
        reset();
        await loadConfig(project.path);
      }
      return;
    }

    const project = projects.find((p) => p.id === value);
    if (project) {
      setActiveProject(project.id);
      reset();
      await loadConfig(project.path);
    }
  }

  async function handleConfirmDelete() {
    if (!projectToDelete) return;

    const isActive = projectToDelete.id === activeProjectId;

    if (isActive && status === "running") {
      await stopServer();
    }

    if (isActive) {
      reset();
    }

    removeProject(projectToDelete.id);
    setProjectToDelete(null);
  }

  return (
    <>
      <div className="flex flex-1 items-center gap-2">
        <Select
          value={activeProjectId ?? ""}
          onValueChange={(v) => void handleValueChange(v)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a project...">
              {activeProject && (
                <span className="flex items-center gap-1">
                  {!activeProject.cliDetected && (
                    <span
                      className="text-yellow-500 text-xs"
                      aria-label="CLI not detected"
                    >
                      ⚠
                    </span>
                  )}
                  {activeProject.label}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <span className="flex items-center gap-1">
                  {!p.cliDetected && (
                    <span
                      className="text-yellow-500 text-xs"
                      aria-label="CLI not detected"
                    >
                      ⚠
                    </span>
                  )}
                  {p.label}
                </span>
              </SelectItem>
            ))}
            <SelectItem value="__add__">
              <span className="text-primary">+ Add project...</span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          disabled={!activeProjectId}
          className="shrink-0 text-destructive hover:text-destructive"
          onClick={() => setProjectToDelete(activeProject ?? null)}
          aria-label="Remove current project"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Dialog.Root
        open={projectToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setProjectToDelete(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg">
            <Dialog.Title className="text-base font-semibold">
              Remove project
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to remove{" "}
              <strong>{projectToDelete?.label}</strong> from the list? This will
              not delete any files.
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setProjectToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleConfirmDelete()}
              >
                Remove
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
