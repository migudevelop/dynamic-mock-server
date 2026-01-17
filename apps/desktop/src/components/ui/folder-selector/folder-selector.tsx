import { open } from "@tauri-apps/plugin-dialog";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";

export function FolderSelector() {
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const handleSelectFolder = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected) {
        setSelectedFolder(selected ?? "");
      }
    } catch (error) {
      alert(`Error selecting folder ${error}`);
    }
  }, []);

  const removeFolder = useCallback(async () => {
    setSelectedFolder("");
  }, []);

  return (
    <div className="flex flex-row w-full">
      <div className="flex flex-row w-full" onClick={handleSelectFolder}>
        <Button className="rounded-r-none">Select folder</Button>
        <Input
          className="rounded-none hover:cursor-default"
          disabled
          placeholder="Select project folder..."
          value={selectedFolder}
        />
      </div>
      <Button
        variant="outline"
        className="rounded-l-none"
        onClick={removeFolder}
      >
        <X />
      </Button>
    </div>
  );
}
