import { Label } from "@/components/shadcn/ui/label";
import { Switch } from "@/components/shadcn/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
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
   * Called when the user toggles the route or changes the response.
   * `responseId = null` means "remove route from suite".
   */
  onChange: (routeId: string, responseId: string | null) => void;
}

/**
 * A single row in the suite routes editor.
 * Shows a toggle (is route in suite?), method badge, URL, and response selector.
 */
export function RouteAssignmentRow({
  route,
  assignedResponseId,
  disabled = false,
  onChange,
}: RouteAssignmentRowProps) {
  const isAssigned = assignedResponseId != null && assignedResponseId !== "";
  const methodColor = METHOD_COLORS[route.method] ?? "text-foreground";
  const switchId = `route-${route.id}`;

  function handleToggle(checked: boolean) {
    if (checked) {
      const firstResponse = route.responses[0]?.id ?? null;
      onChange(route.id, firstResponse);
    } else {
      onChange(route.id, null);
    }
  }

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-md border px-3 py-2 transition-colors",
        isAssigned ? "bg-muted/40 border-border" : "border-transparent",
        disabled ? "opacity-60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Toggle */}
      <Switch
        id={switchId}
        checked={isAssigned}
        disabled={disabled}
        onCheckedChange={handleToggle}
        aria-label={`Include ${route.id} in suite`}
      />

      {/* Method + URL */}
      <Label
        htmlFor={switchId}
        className="flex flex-1 items-center gap-2 cursor-pointer min-w-0"
      >
        <span className={`font-mono text-xs font-bold shrink-0 ${methodColor}`}>
          {route.method}
        </span>
        <span className="font-mono text-sm truncate text-foreground">
          {route.url}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          ({route.id})
        </span>
      </Label>

      {/* Response selector */}
      <div className="shrink-0 w-40">
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
