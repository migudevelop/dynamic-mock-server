import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { tauriCommands } from "@/helpers/tauri-commands";

import type { SavedProject } from "@/types/project.types";

interface ProjectState {
  /** All saved projects */
  projects: SavedProject[];
  /** ID of the currently selected project */
  activeProjectId: string | null;
}

interface ProjectActions {
  /**
   * Adds a new project to the list by its directory path.
   * Detects CLI, extracts label, and persists.
   *
   * @param path - Absolute path to the project root
   * @returns The newly added SavedProject
   */
  addProject: (path: string) => Promise<SavedProject>;
  /**
   * Removes a saved project by ID.
   *
   * @param id - Project ID to remove
   */
  removeProject: (id: string) => void;
  /**
   * Sets the active project, updating its lastOpened timestamp.
   *
   * @param id - Project ID to activate
   */
  setActiveProject: (id: string) => void;
  /**
   * Returns the currently active project, or null.
   */
  getActiveProject: () => SavedProject | null;
  /**
   * Updates fields on a saved project.
   *
   * @param id - Project ID to update
   * @param updates - Partial fields to merge
   */
  updateProject: (
    id: string,
    updates: Partial<Omit<SavedProject, "id">>,
  ) => void;
}

type ProjectStore = ProjectState & ProjectActions;

/**
 * Extracts the last directory name from an absolute path.
 *
 * @param path - Absolute or relative path string
 * @returns The last path segment, falling back to the full path
 */
function extractLabel(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

/**
 * Persisted store that manages the list of saved mock-server projects.
 * Persisted to localStorage under the key "dynamic-mock-server:projects".
 */
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      addProject: async (path) => {
        // Return existing project if the path is already registered
        const existing = get().projects.find((p) => p.path === path);
        if (existing) {
          get().setActiveProject(existing.id);
          return existing;
        }

        let cliDetected = false;
        try {
          cliDetected = await tauriCommands.detectCli(path);
        } catch {
          cliDetected = false;
        }

        const project: SavedProject = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          path,
          label: extractLabel(path),
          cliDetected,
          lastOpened: new Date().toISOString(),
        };

        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: project.id,
        }));

        return project;
      },

      removeProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId:
            state.activeProjectId === id ? null : state.activeProjectId,
        }));
      },

      setActiveProject: (id) => {
        set((state) => ({
          activeProjectId: id,
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, lastOpened: new Date().toISOString() } : p,
          ),
        }));
      },

      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        return projects.find((p) => p.id === activeProjectId) ?? null;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        }));
      },
    }),
    {
      name: "dynamic-mock-server:projects",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
