import { useEffect, useRef } from "react";

import { Button } from "@/components/shadcn/ui/button";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { useServerStore } from "@/stores/server-store";

/**
 * Server logs page.
 *
 * Displays real-time captured stdout/stderr from the running mock server process.
 * Auto-scrolls to the bottom when new entries arrive.
 * Provides Copy all and Clear actions.
 */
export function ServerLogsPage() {
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
    <div className="flex flex-col gap-5 h-full">
      <PageHeader
        title="Server Logs"
        description="Real-time stdout and stderr output from the mock server process."
        flexAll={false}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleCopyAll()}
              disabled={logs.length === 0}
            >
              Copy all
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              disabled={logs.length === 0}
            >
              Clear
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto rounded-md border border-border bg-muted/20 p-3 font-mono text-xs space-y-0.5 min-h-0">
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No logs yet. Start the server to see output here.
          </p>
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
              <span className="text-muted-foreground mr-2 select-none">
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
