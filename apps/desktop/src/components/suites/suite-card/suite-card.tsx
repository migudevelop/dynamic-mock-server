import { CodeIcon, EditIcon } from "lucide-react";

import { SuiteCardExtendsSection } from "./suite-card-extends-section";
import { SuiteCardRoutesList } from "./suite-card-routes-list";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Switch } from "@/components/shadcn/ui/switch";
import type { SuiteDto } from "@/types/suite.types";

interface SuiteCardProps {
  /** The suite data to display */
  suite: SuiteDto;
  /** Whether this suite is the currently active one */
  isActive: boolean;
  /**
   * Called when the user toggles the active switch.
   * If the suite is currently inactive, activates it.
   * If the suite is currently active, deactivates (passes null).
   */
  onToggleActive: () => void;
  /**
   * When true, the card is shown in offline mode (server not running).
   * The switch is disabled and the card is visually muted.
   */
  disabled?: boolean;
}

/**
 * Displays a single routes suite with its route assignments.
 * The active suite can be switched via the toggle control.
 * When `disabled` is true, the card is in read-only / offline mode.
 */
export function SuiteCard({
  suite,
  isActive,
  onToggleActive,
  disabled = false,
}: SuiteCardProps) {
  return (
    <Card
      className={
        [
          isActive && !disabled ? "ring-2 ring-primary/30" : "",
          disabled ? "opacity-60" : "",
        ]
          .filter(Boolean)
          .join(" ") || undefined
      }
    >
      <CardHeader>
        <div className="flex items-center gap-2 min-w-0">
          <CardTitle className="truncate">{suite.id}</CardTitle>
          {isActive && !disabled && (
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] px-1.5 py-0 border-primary/40 text-primary"
            >
              ACTIVE
            </Badge>
          )}
          {disabled && (
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] px-1.5 py-0 text-muted-foreground border-muted-foreground/30"
            >
              OFFLINE
            </Badge>
          )}
        </div>
        <CardAction>
          <Switch
            checked={isActive && !disabled}
            onCheckedChange={onToggleActive}
            disabled={disabled}
            aria-label={`Set ${suite.id} as active suite`}
          />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <SuiteCardExtendsSection />
        <SuiteCardRoutesList routes={suite.routes} />
      </CardContent>

      <CardFooter className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="View suite code"
          disabled
        >
          <CodeIcon className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit suite" disabled>
          <EditIcon className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
