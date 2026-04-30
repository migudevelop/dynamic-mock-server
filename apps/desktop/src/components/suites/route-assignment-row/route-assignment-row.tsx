import { Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/shadcn/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { buildRouteRoute } from "@/helpers/navigation/navigation";
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

interface RouteAssignmentRowProps {
  /** Route to display */
  route: RouteDto;
  /**
   * The response ID assigned to this route in the suite,
   * or `undefined` / `null` if the route is not in the suite.
   */
  assignedResponseId: string | null | undefined;
  /**
   * Whether the row interactions are disabled
   * (e.g. offline / server is changing state)
   */
  disabled?: boolean;
  /**
   * Called when the user changes the assigned response.
   * `responseId = null` means "remove route from suite".
   */
  onChange: (routeId: string, responseId: string | null) => void;
}

/**
 * A single row in the suite routes editor.
 * Clicking the row navigates to the route detail page.
 * Shows a trash button to remove the route from the suite, method badge,
 * URL, and response selector.
 */
export function RouteAssignmentRow({
  route,
  assignedResponseId,
  disabled = false,
  onChange,
}: RouteAssignmentRowProps) {
  const navigate = useNavigate();
  const isAssigned = assignedResponseId != null && assignedResponseId !== "";
  const methodColor = METHOD_COLORS[route.method] ?? "text-foreground";

  function handleRowClick() {
    if (!disabled) {
      const base = buildRouteRoute(route.id);
      const href = assignedResponseId
        ? `${base}?variant=${encodeURIComponent(assignedResponseId)}`
        : base;
      void navigate(href);
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleRowClick();
      }}
      className={[
        "flex items-center gap-3 rounded-md border px-3 py-2 transition-colors",
        "cursor-pointer hover:bg-muted/60",
        isAssigned ? "bg-muted/40 border-border" : "border-transparent",
        disabled ? "opacity-60 cursor-default" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Remove from suite */}
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 text-muted-foreground hover:text-destructive"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onChange(route.id, null);
        }}
        aria-label={`Remove ${route.id} from suite`}
      >
        <Trash2Icon className="size-3.5" />
      </Button>

      {/* Method + URL */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <span className={`font-mono text-xs font-bold shrink-0 ${methodColor}`}>
          {route.method}
        </span>
        <span className="font-mono text-sm truncate text-foreground">
          {route.url}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          ({route.id})
        </span>
      </div>

      {/* Response selector */}
      <div
        className="shrink-0 w-40"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Select
          value={isAssigned ? (assignedResponseId ?? "") : ""}
          disabled={!isAssigned || disabled}
          onValueChange={(value) => onChange(route.id, value)}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="— none —" />
          </SelectTrigger>
          <SelectContent>
            {route.responses.map((resp) => (
              <SelectItem key={resp.id} value={resp.id} className="text-xs">
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
}
