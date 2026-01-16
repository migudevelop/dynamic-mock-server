import { SaveIcon, SlidersHorizontal, FolderCog, Server } from "lucide-react";
import { useCallback } from "react";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";

import InputFormField from "@/components/form/input-form-field";
import { SelectFormField } from "@/components/form/select-form-field/select-form-field";
import SwitchFormField from "@/components/form/switch-form-field";
import SettingSection from "@/components/settings/setting-section";
import { Button } from "@/components/shadcn/ui/button";
import { Form } from "@/components/shadcn/ui/form";
import PageHeader from "@/components/ui/page-header";

const LOG_LEVELS_OPTIONS = [
  { value: "fatal", label: "Fatal" },
  { value: "error", label: "Error" },
  { value: "warn", label: "Warn" },
  { value: "info", label: "Info" },
  { value: "debug", label: "Debug" },
  { value: "trace", label: "Trace" },
  { value: "silent", label: "Silent" },
];

const DEFAULT_CONFIG = {
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

export function Setting() {
  const form = useForm({
    defaultValues: DEFAULT_CONFIG,
  });

  // Submit handler
  const onSubmit = useCallback<(data: FieldValues) => void>((data) => {
    console.log("Form submitted:", data);
    // ...handle submit (save settings)...
  }, []);

  const onReset = useCallback(() => {
    form.reset();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Global Settings"
        actions={
          <>
            <Button variant="secondary" onClick={onReset}>
              Reset Defaults
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)}>
              <SaveIcon /> Save Changes
            </Button>
          </>
        }
      />
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
