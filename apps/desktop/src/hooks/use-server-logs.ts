import { useEffect } from "react";

import { listen } from "@tauri-apps/api/event";

import { useServerStore } from "@/stores/server-store";
import type { ServerLogEntry } from "@/types/server.types";

/**
 * Subscribes to the "server-log" event emitted by the Rust backend
 * and pushes each entry into the server store's log buffer.
 *
 * Must be mounted while the server may be running. Safe to mount app-wide.
 * Handles the case where the component unmounts before the listener resolves.
 */
export function useServerLogs(): void {
  const addLog = useServerStore((s) => s.addLog);

  useEffect(() => {
    let cancelled = false;
    let unlisten: (() => void) | undefined;

    listen<ServerLogEntry>("server-log", (event) => {
      addLog(event.payload);
    })
      .then((fn) => {
        if (cancelled) {
          fn(); // Immediately unlisten if the component already unmounted
        } else {
          unlisten = fn;
        }
      })
      .catch((err) => {
        console.error("Failed to subscribe to server-log events:", err);
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [addLog]);
}
