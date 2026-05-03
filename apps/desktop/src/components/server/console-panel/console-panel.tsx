import { useEffect, useRef } from "react";

import { Button } from "@/components/shadcn/ui/button";
import { useServerStore } from "@/stores/server-store";

/**
 * Scrollable console panel that displays real-time server process logs.
 *
 * - Auto-scrolls to the bottom when new log entries arrive.
 * - Color-codes stderr lines in the destructive (red) theme color.
 * - Provides "Copy all" and "Clear" actions.
 */
export default function ConsolePanel() {
  const logs = useServerStore((s) => s.logs);
  const clearLogs = useServerStore((s) => s.clearLogs);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  async function handleCopyAll() {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.stream}] ${l.message}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="flex flex-col h-full border-t overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Server Logs
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleCopyAll()}
          >
            Copy all
          </Button>
          <Button variant="ghost" size="sm" onClick={clearLogs}>
            Clear
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs bg-background space-y-0.5">
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No logs yet</p>
        ) : (
          logs.map((entry, i) => (
            <div
              key={i}
              className={
                entry.stream === "stderr"
                  ? "text-destructive"
                  : "text-foreground"
              }
            >
              <span className="text-muted-foreground mr-2">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              {entry.message}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
