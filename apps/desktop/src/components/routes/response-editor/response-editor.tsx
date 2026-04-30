import { useCallback, useState } from "react";
import Editor from "@monaco-editor/react";
import { CheckIcon, ClipboardIcon } from "lucide-react";

import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import type { RouteResponseDto } from "@/types/route.types";

interface ResponseEditorProps {
  /** The variant being edited */
  variant: RouteResponseDto;
  /** Called when the variant ID changes */
  onVariantIdChange: (newId: string) => void;
  /** Called when any field of the variant changes */
  onVariantChange: <K extends keyof RouteResponseDto>(
    field: K,
    value: RouteResponseDto[K],
  ) => void;
  /** Whether the editor is in read-only mode */
  disabled?: boolean;
}

/**
 * Main editor panel for a single response variant.
 *
 * Shows:
 * - Endpoint Enabled switch (route-level)
 * - Status Code and Delay inputs
 * - Monaco JSON editor for the response body
 */
export function ResponseEditor({
  variant,
  onVariantIdChange,
  onVariantChange,
  disabled = false,
}: ResponseEditorProps) {
  const [copied, setCopied] = useState(false);

  const bodyString =
    variant.body !== undefined ? JSON.stringify(variant.body, null, 2) : "";

  /** Formats the JSON in the editor */
  function handleFormatJson() {
    try {
      const parsed = JSON.parse(bodyString);
      onVariantChange("body", parsed);
    } catch {
      // already invalid JSON — do nothing
    }
  }

  /** Copies the response body to clipboard */
  async function handleCopy() {
    await navigator.clipboard.writeText(bodyString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /** Called by Monaco on every keystroke */
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return;
      try {
        const parsed = JSON.parse(value) as unknown;
        onVariantChange("body", parsed);
      } catch {
        // keep the string as-is until it becomes valid JSON
      }
    },
    [onVariantChange],
  );

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Variant ID */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Variant ID
        </Label>
        <Input
          value={variant.id}
          onChange={(e) => onVariantIdChange(e.target.value)}
          disabled={disabled}
          className="font-mono text-sm"
          placeholder="variant-id"
        />
      </div>

      {/* Status Code + Delay */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Status Code
          </Label>
          <div className="flex">
            <Input
              type="number"
              min={100}
              max={599}
              value={variant.status ?? ""}
              onChange={(e) =>
                onVariantChange(
                  "status",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              disabled={disabled}
              className="rounded-r-none"
              placeholder="200"
            />
            <span className="inline-flex items-center px-2.5 rounded-r-md border border-l-0 border-border bg-muted text-xs text-muted-foreground font-mono shrink-0">
              HTTP
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Simulated Delay (ms)
          </Label>
          <div className="flex">
            <Input
              type="number"
              min={0}
              value={variant.delay ?? ""}
              onChange={(e) =>
                onVariantChange(
                  "delay",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              disabled={disabled}
              className="rounded-r-none"
              placeholder="0"
            />
            <span className="inline-flex items-center px-2.5 rounded-r-md border border-l-0 border-border bg-muted text-xs text-muted-foreground font-mono shrink-0">
              MS
            </span>
          </div>
        </div>
      </div>

      {/* Response Body */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Response Body (JSON)
          </Label>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-primary px-2"
              onClick={handleFormatJson}
              disabled={disabled}
            >
              Format JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-primary px-2"
              onClick={() => void handleCopy()}
              disabled={disabled}
            >
              {copied ? (
                <>
                  <CheckIcon className="size-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardIcon className="size-3 mr-1" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Monaco editor wrapper */}
        <div className="rounded-md border border-border overflow-hidden flex-1 min-h-80">
          {/* Fake mac-style dots header */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 border-b border-border">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-yellow-400" />
            <span className="size-2.5 rounded-full bg-green-400" />
            <span className="ml-2 text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
              Editor
            </span>
          </div>
          <Editor
            height="320px"
            defaultLanguage="json"
            value={bodyString}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
              formatOnPaste: true,
              readOnly: disabled,
              automaticLayout: true,
            }}
            theme="vs"
          />
        </div>
      </div>
    </div>
  );
}
