import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { ConfigType } from "@/types/config.types";

/**
 * Application state interface
 */
interface AppState {
  /** The selected project folder path */
  projectPath: string | null;
  /** The loaded configuration */
  config: ConfigType | null;
  /** Whether the configuration is loading */
  isLoading: boolean;
  /** Any error that occurred during configuration loading */
  error: string | null;
}

/**
 * Application actions interface
 */
interface AppActions {
  /**
   * Set the project path
   * @param path - The path to the project folder
   */
  setProjectPath: (path: string | null) => Promise<void>;

  /**
   * Reload the configuration from the project path
   */
  reloadConfig: () => Promise<void>;

  /**
   * Clear all state and reset to initial values
   */
  clearState: () => void;
}

/**
 * Global application store
 *
 * Note: Core and Config instances are NOT managed here because they run on the
 * Tauri backend (Rust side), not in the browser. This store only manages the
 * project path and configuration data.
 *
 * TODO: Integrate with Tauri commands to communicate with the backend Core instance.
 */
export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // Initial state
      projectPath: null,
      config: null,
      isLoading: false,
      error: null,

      // Actions
      setProjectPath: async (path: string | null) => {
        try {
          set({ isLoading: true, error: null });

          if (!path) {
            // Clear everything if no path is provided
            // TODO: Call Tauri command to stop the server and clear config
            set({
              projectPath: null,
              config: null,
              isLoading: false,
              error: null,
            });
            return;
          }

          // TODO: Call Tauri command to load config from the given path
          // For now, we just store the path
          // Example:
          // const config = await invoke<ConfigType>("load_config", { path });

          set({
            projectPath: path,
            config: null, // Will be loaded from Tauri backend
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          set({
            error: errorMessage,
            isLoading: false,
          });
          console.error("Error setting project path:", error);
        }
      },

      reloadConfig: async () => {
        const { projectPath } = get();
        if (!projectPath) {
          return;
        }

        try {
          set({ isLoading: true, error: null });

          // TODO: Call Tauri command to reload config
          // const config = await invoke<ConfigType>("reload_config");

          set({
            config: null, // Will be loaded from Tauri backend
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          set({
            error: errorMessage,
            isLoading: false,
          });
          console.error("Error reloading config:", error);
        }
      },

      clearState: () => {
        // TODO: Call Tauri command to stop the server
        set({
          projectPath: null,
          config: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "app-storage", // nombre en localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistir el projectPath
      partialize: (state) => ({ projectPath: state.projectPath }),
      // Callback después de hidratar el estado desde localStorage
      onRehydrateStorage: () => {
        return async (state, error) => {
          if (error) {
            console.error("Error rehydrating state:", error);
            return;
          }

          // Si hay un projectPath guardado, cargar la configuración desde Tauri
          if (state?.projectPath) {
            try {
              // TODO: Call Tauri command to initialize config and core
              const config = await invoke<ConfigType>("load_config", {
                path: state.projectPath,
              });
              state.config = config;
              console.log("config loaded on rehydration:", config);
            } catch (error) {
              console.error("Error initializing on rehydration:", error);
              const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
              state.error = errorMessage;
            }
          }
        };
      },
    },
  ),
);
