import { SaveIcon, SlidersHorizontal, FolderCog, Server } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";

import InputFormField from "@/components/form/input-form-field";
import { SelectFormField } from "@/components/form/select-form-field/select-form-field";
import SwitchFormField from "@/components/form/switch-form-field";
import SettingSection from "@/components/settings/setting-section";
import { Button } from "@/components/shadcn/ui/button";
import { Form } from "@/components/shadcn/ui/form";
import PageHeader from "@/components/ui/page-header";
import { tauriCommands } from "@/helpers/tauri-commands";
import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";

const LOG_LEVELS_OPTIONS = [
  { value: "fatal", label: "Fatal" },
  { value: "error", label: "Error" },
  { value: "warn", label: "Warn" },
  { value: "info", label: "Info" },
  { value: "debug", label: "Debug" },
  { value: "trace", label: "Trace" },
  { value: "silent", label: "Silent" },
];

/** Shape of the settings form */
interface ConfigFormValues {
  /** Logging verbosity */
  logLevel: string;
  /** Server binding settings */
  server: {
    /** TCP port */
    port: number;
    /** Hostname */
    host: string;
  };
  /** File loader settings */
  files: {
    /** Whether file loading is enabled */
    enabled: boolean;
    /** Whether hot-reload watching is enabled */
    watch: boolean;
    /** Base directory for mocks relative to the project root */
    path: string;
  };
}

const DEFAULT_CONFIG: ConfigFormValues = {
  logLevel: "trace",
  server: {
    port: 3000,
    host: "127.0.0.1",
  },
  files: {
    enabled: true,
    watch: true,
    path: "mocks",
  },
};

/**
 * Settings page for configuring the mock server project.
 * Loads current config from the server store as default form values and
 * writes changes back to the project config file on submit.
 */
export function Setting() {
  const config = useServerStore((s) => s.config);
  const loadConfig = useServerStore((s) => s.loadConfig);
  const getActiveProject = useProjectStore((s) => s.getActiveProject);

  const form = useForm<ConfigFormValues>({
    defaultValues: DEFAULT_CONFIG,
  });

  // Sync form values whenever the store config changes (e.g. after project switch)
  useEffect(() => {
    if (!config) return;

    form.reset({
      logLevel: config.logLevel ?? DEFAULT_CONFIG.logLevel,
      server: {
        port: config.server?.port ?? DEFAULT_CONFIG.server.port,
        host: config.server?.host ?? DEFAULT_CONFIG.server.host,
      },
      files: {
        enabled: config.files?.enabled ?? DEFAULT_CONFIG.files.enabled,
        watch: config.files?.watch ?? DEFAULT_CONFIG.files.watch,
        path: config.files?.path ?? DEFAULT_CONFIG.files.path,
      },
    });
  }, [config, form]);

  const onSubmit = useCallback(
    async (values: ConfigFormValues) => {
      const activeProject = getActiveProject();
      if (!activeProject) return;

      const configContent = `module.exports = ${JSON.stringify(values, null, 2)};\n`;
      const configPath = `${activeProject.path}/dynamicMockServer.config.js`;

      await tauriCommands.writeFileContent(
        configPath,
        configContent,
        activeProject.path,
      );
      await loadConfig(activeProject.path);
    },
    [getActiveProject, loadConfig],
  );

  const onReset = useCallback(() => {
    if (config) {
      form.reset({
        logLevel: config.logLevel ?? DEFAULT_CONFIG.logLevel,
        server: {
          port: config.server?.port ?? DEFAULT_CONFIG.server.port,
          host: config.server?.host ?? DEFAULT_CONFIG.server.host,
        },
        files: {
          enabled: config.files?.enabled ?? DEFAULT_CONFIG.files.enabled,
          watch: config.files?.watch ?? DEFAULT_CONFIG.files.watch,
          path: config.files?.path ?? DEFAULT_CONFIG.files.path,
        },
      });
    } else {
      form.reset(DEFAULT_CONFIG);
    }
  }, [config, form]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Global Settings"
        actions={
          <>
            <Button variant="secondary" onClick={onReset}>
              Reset Defaults
            </Button>
            <Button onClick={() => void form.handleSubmit(onSubmit)()}>
              <SaveIcon /> Save Changes
            </Button>
          </>
        }
      />
      <div
        role="status"
        className="flex items-start gap-3 p-3 rounded-md bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700/50 text-sky-800 dark:text-sky-200 text-sm"
      >
        <div className="flex-1">
          <span className="font-semibold">Note:</span> Changing these settings requires restarting the mock server for the changes to take effect.
        </div>
      </div>
      <Form {...form}>
        <SettingSection title="General Settings" icon={<SlidersHorizontal />}>
          <SelectFormField
            name="logLevel"
            label="Log Level"
            placeholder="Select a level"
            options={LOG_LEVELS_OPTIONS}
          />
        </SettingSection>
        <SettingSection title="Server Configuration" icon={<Server />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputFormField name="server.port" label="Port" />
            <InputFormField name="server.host" label="Host" />
          </div>
        </SettingSection>
        <SettingSection title="File System" icon={<FolderCog />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Enabled
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Load mocks from disk
                </span>
              </div>
              <SwitchFormField name="files.enabled" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Watch
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Hot reload on changes
                </span>
              </div>
              <SwitchFormField name="files.watch" />
            </div>
          </div>
          <InputFormField name="files.path" label="Mocks Directory Path" />
        </SettingSection>
      </Form>
    </div>
  );
}
