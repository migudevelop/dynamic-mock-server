import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { SearchIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Switch } from "@/components/shadcn/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { cn } from "@/helpers/shadcn/utils";
import type { RouteDto } from "@/types/route.types";

/** HTTP method → tailwind color class */
const METHOD_COLORS: Record<string, string> = {
  GET: "text-green-500",
  POST: "text-blue-500",
  PUT: "text-yellow-500",
  PATCH: "text-orange-500",
  DELETE: "text-red-500",
  OPTIONS: "text-purple-500",
  HEAD: "text-gray-500",
};

/** A route selected in the dialog with its chosen initial response */
export interface RouteSelection {
  /** Route identifier */
  routeId: string;
  /** Initial response ID to assign */
  responseId: string;
}

interface AddRoutesDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Suite identifier (shown in title) */
  suiteId: string;
  /** Routes available to add (already-assigned routes excluded by caller) */
  availableRoutes: RouteDto[];
  /**
   * Called when the user confirms. Receives the list of selections.
   * The parent is responsible for persisting the changes.
   */
  onAdd: (selections: RouteSelection[]) => void;
}

/**
 * Modal dialog for adding routes to a suite.
 *
 * Shows a searchable list of available (unassigned) routes with a Select All toggle.
 * Each row has a toggle, method badge, URL, and initial response selector.
 * The footer shows the selection count and a confirm button.
 */
export function AddRoutesDialog({
  open,
  onOpenChange,
  suiteId,
  availableRoutes,
  onAdd,
}: AddRoutesDialogProps) {
  const [search, setSearch] = React.useState("");
  /** routeId → chosen initial responseId */
  const [selected, setSelected] = React.useState<Map<string, string>>(
    new Map(),
  );

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setSearch("");
      setSelected(new Map());
    }
  }, [open]);

  const filtered = availableRoutes.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.url.toLowerCase().includes(q) ||
      r.method.toLowerCase().includes(q)
    );
  });

  /** True when every visible (filtered) route is selected */
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  /** True when at least one but not all filtered routes are selected (indeterminate) */
  const someFilteredSelected =
    !allFilteredSelected && filtered.some((r) => selected.has(r.id));

  /**
   * Toggles all currently-filtered routes on or off.
   * If all are selected → deselect all filtered.
   * Otherwise → select all filtered (using first response as default).
   */
  function handleSelectAll() {
    setSelected((prev) => {
      const next = new Map(prev);
      if (allFilteredSelected) {
        filtered.forEach((r) => next.delete(r.id));
      } else {
        filtered.forEach((r) => {
          if (!next.has(r.id)) {
            next.set(r.id, r.responses[0]?.id ?? "");
          }
        });
      }
      return next;
    });
  }

  function handleToggle(routeId: string, checked: boolean, route: RouteDto) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (checked) {
        const defaultResponse = route.responses[0]?.id ?? "";
        next.set(routeId, defaultResponse);
      } else {
        next.delete(routeId);
      }
      return next;
    });
  }

  function handleResponseChange(routeId: string, responseId: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(routeId, responseId);
      return next;
    });
  }

  function handleConfirm() {
    const selections: RouteSelection[] = Array.from(selected.entries())
      .filter(([, responseId]) => responseId !== "")
      .map(([routeId, responseId]) => ({ routeId, responseId }));
    onAdd(selections);
    onOpenChange(false);
  }

  const selectedCount = selected.size;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Dialog panel — centered */}
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-2xl min-h-120 max-h-[85vh] flex flex-col",
            "bg-background rounded-lg shadow-xl border border-border",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
            <div>
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                Add Routes to Suite
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground mt-0.5">
                Select routes to add to the{" "}
                <span className="font-medium text-foreground">{suiteId}</span>{" "}
                suite.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 -mt-1 -mr-2"
              >
                <XIcon className="size-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-border shrink-0">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by ID, URL or method…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Column headers with Select All toggle */}
          <div className="px-6 py-2 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
            <div className="w-10 shrink-0 flex items-center justify-center">
              <Switch
                checked={allFilteredSelected}
                data-state={someFilteredSelected ? "indeterminate" : undefined}
                onCheckedChange={handleSelectAll}
                disabled={filtered.length === 0}
                aria-label="Select all visible routes"
                className={cn(someFilteredSelected && "opacity-60")}
              />
            </div>
            <span className="flex-1">Method / Path</span>
            <span className="w-44 shrink-0">Initial variant</span>
          </div>

          {/* Route list — min-h ensures modal stays stable even with few results */}
          <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-60 max-h-60">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-60 text-muted-foreground">
                <p className="text-sm">No routes match your search.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map((route) => {
                  const isChecked = selected.has(route.id);
                  const methodColor =
                    METHOD_COLORS[route.method] ?? "text-foreground";

                  return (
                    <div
                      key={route.id}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                        isChecked
                          ? "bg-muted/50 border border-border"
                          : "border border-transparent hover:bg-muted/30",
                      )}
                    >
                      {/* Toggle */}
                      <Switch
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleToggle(route.id, checked, route)
                        }
                        aria-label={`Select ${route.id}`}
                        className="shrink-0"
                      />

                      {/* Method + URL + ID */}
                      <div className="flex flex-1 items-center gap-2 min-w-0">
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 font-mono text-[10px] font-bold px-1.5 py-0 border-current",
                            methodColor,
                          )}
                        >
                          {route.method}
                        </Badge>
                        <span className="font-mono text-sm truncate">
                          {route.url}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0 truncate">
                          ({route.id})
                        </span>
                      </div>

                      {/* Initial response selector */}
                      <div className="w-44 shrink-0">
                        <Select
                          value={selected.get(route.id) ?? ""}
                          disabled={!isChecked}
                          onValueChange={(v) =>
                            handleResponseChange(route.id, v)
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="— none —" />
                          </SelectTrigger>
                          <SelectContent>
                            {route.responses.map((resp) => (
                              <SelectItem
                                key={resp.id}
                                value={resp.id}
                                className="text-xs"
                              >
                                {resp.id}
                                {resp.status != null && (
                                  <span className="ml-1 text-muted-foreground">
                                    ({resp.status})
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0 bg-muted/20 rounded-b-lg">
            <span className="text-sm text-muted-foreground">
              {selectedCount > 0 ? (
                <>
                  <span className="font-semibold text-foreground">
                    {selectedCount}
                  </span>{" "}
                  route{selectedCount !== 1 ? "s" : ""} selected
                </>
              ) : (
                "No routes selected"
              )}
            </span>
            <div className="flex items-center gap-2">
              <DialogPrimitive.Close asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </DialogPrimitive.Close>
              <Button
                size="sm"
                disabled={selectedCount === 0}
                onClick={handleConfirm}
              >
                Add to Suite
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
