import { useEffect, useRef } from "react";

import { useServerStore } from "@/stores/server-store";

/** Default polling interval in milliseconds */
const DEFAULT_INTERVAL_MS = 5_000;

/**
 * Polls the server status at a regular interval.
 *
 * Auto-starts polling when the server is in "running" state and
 * pauses automatically when the server is "stopped" or "error".
 *
 * @param intervalMs - Polling interval in milliseconds (default: 5000)
 */
export function useServerPolling(intervalMs = DEFAULT_INTERVAL_MS): void {
  const status = useServerStore((s) => s.status);
  const checkStatus = useServerStore((s) => s.checkStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const shouldPoll = status === "running";

    if (shouldPoll) {
      intervalRef.current = setInterval(() => {
        void checkStatus();
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, checkStatus, intervalMs]);
}
