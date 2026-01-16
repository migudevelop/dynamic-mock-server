import { SaveIcon, SlidersHorizontal, FolderCog, Server } from "lucide-react";

import SettingSection from "@/components/settings/setting-section";
import { Button } from "@/components/shadcn/ui/button";
import PageHeader from "@/components/ui/page-header";

export function Setting() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Global Settings"
        actions={
          <>
            <Button variant="secondary">Reset Defaults</Button>
            <Button>
              <SaveIcon /> Save Changes
            </Button>
          </>
        }
      />
      <SettingSection
        title="General Settings"
        icon={<SlidersHorizontal />}
      ></SettingSection>
      <SettingSection
        title="Server Configuration"
        icon={<Server />}
      ></SettingSection>
      <SettingSection title="File System" icon={<FolderCog />}></SettingSection>
    </div>
  );
}
