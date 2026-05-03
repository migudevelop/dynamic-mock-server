import { Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router";

import { SuiteCardExtendsSection } from "./suite-card-extends-section";
import { SuiteCardRoutesList } from "./suite-card-routes-list";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Switch } from "@/components/shadcn/ui/switch";
import { buildSuiteRoute } from "@/helpers/navigation/navigation";
import type { SuiteDto } from "@/types/suite.types";

interface SuiteCardProps {
  /** The suite data to display */
  suite: SuiteDto;
  /** Whether this suite is the currently active one */
  isActive: boolean;
  /** Called when the user toggles the active switch */
  onToggleActive: () => void;
  /** Called when the user clicks the delete button */
  onDelete?: () => void;
}

/**
 * Displays a single routes suite with its route assignments.
 * The active suite can be switched via the toggle control.
 */
export function SuiteCard({
  suite,
  isActive,
  onToggleActive,
  onDelete,
}: SuiteCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={isActive ? "ring-2 ring-primary/30" : undefined}
      onClick={() => void navigate(buildSuiteRoute(suite.id))}
      style={{ cursor: "pointer" }}
    >
      <CardHeader>
        <div className="flex items-center gap-2 min-w-0">
          <CardTitle className="truncate">{suite.id}</CardTitle>
          {isActive && (
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] px-1.5 py-0 border-primary/40 text-primary"
            >
              ACTIVE
            </Badge>
          )}
        </div>
        <CardAction
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label={`Delete suite ${suite.id}`}
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          )}
          <Switch
            checked={isActive}
            onCheckedChange={onToggleActive}
            aria-label={`Set ${suite.id} as active suite`}
          />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <SuiteCardExtendsSection label={suite.extends} />
        <SuiteCardRoutesList routes={suite.routes} />
      </CardContent>
    </Card>
  );
}
