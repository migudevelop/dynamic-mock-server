import { open } from "@tauri-apps/plugin-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";

/**
 * Dropdown that lists all saved projects and lets the user switch between them
 * or add a new project by opening a system folder-picker dialog.
 *
 * On project switch, the server store is reset and the project config is reloaded.
 */
export default function ProjectSelector() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const addProject = useProjectStore((s) => s.addProject);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const loadConfig = useServerStore((s) => s.loadConfig);
  const reset = useServerStore((s) => s.reset);

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

  return (
    <Select
      value={activeProjectId ?? ""}
      onValueChange={(v) => void handleValueChange(v)}
    >
      <SelectTrigger className="w-50">
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
  );
}
