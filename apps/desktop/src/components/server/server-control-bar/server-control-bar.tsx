import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";
import type { ServerStatus } from "@/types/server.types";

/** Maps each server status to a user-facing label */
const STATUS_LABELS: Record<ServerStatus, string> = {
  stopped: "Stopped",
  starting: "Starting...",
  running: "Running",
  stopping: "Stopping...",
  error: "Error",
};

/** Maps each server status to the appropriate Badge variant */
const STATUS_VARIANTS: Record<
  ServerStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  stopped: "secondary",
  starting: "outline",
  running: "default",
  stopping: "outline",
  error: "destructive",
};

/**
 * Inline control bar displaying the mock server status badge, runtime stats,
 * and Start / Stop / Restart action buttons.
 *
 * - Start is disabled when there is no active project or the CLI is not detected.
 * - Restart calls stopServer then startServer using the active project path.
 */
export default function ServerControlBar() {
  const status = useServerStore((s) => s.status);
  const statusDetails = useServerStore((s) => s.statusDetails);
  const startServer = useServerStore((s) => s.startServer);
  const stopServer = useServerStore((s) => s.stopServer);
  const error = useServerStore((s) => s.error);
  const activeProject = useProjectStore(
    (s) => s.projects.find((p) => p.id === s.activeProjectId) ?? null,
  );

  const canStart =
    status === "stopped" && activeProject !== null && activeProject.cliDetected;
  const canStop = status === "running";
  const isTransitioning = status === "starting" || status === "stopping";

  async function handleStart() {
    if (activeProject) {
      await startServer(activeProject.path);
    }
  }

  async function handleStop() {
    await stopServer();
  }

  async function handleRestart() {
    await stopServer();
    if (activeProject) {
      await startServer(activeProject.path);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>

      {status === "running" && statusDetails && (
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Port: {statusDetails.port}
          {statusDetails.activeSuite != null &&
            ` | Suite: ${statusDetails.activeSuite}`}
          {statusDetails.totalRoutes !== undefined &&
            ` | ${statusDetails.totalRoutes} routes`}
        </span>
      )}

      {status === "error" && error && (
        <span
          className="text-sm text-destructive truncate max-w-xs hidden sm:inline"
          title={error}
        >
          {error}
        </span>
      )}

      <div className="flex gap-2">
        {canStop && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRestart()}
            disabled={isTransitioning}
          >
            Restart
          </Button>
        )}
        <Button
          size="sm"
          onClick={canStop ? () => void handleStop() : () => void handleStart()}
          disabled={(!canStart && !canStop) || isTransitioning}
          variant={canStop ? "destructive" : "default"}
        >
          {canStop ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
}
