import { useState } from "react";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SaveIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { RouteAssignmentRow } from "@/components/suites/route-assignment-row";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import { Switch } from "@/components/shadcn/ui/switch";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { ROUTES } from "@/helpers/navigation/navigation";
import { useSuiteDetail } from "@/hooks/use-suite-detail";

/**
 * Suite detail page.
 *
 * Shows only the routes assigned to this suite.
 * An expandable section lets the user add additional routes.
 * Works in both online (admin API) and offline (disk files) mode.
 */
export function SuiteDetail() {
  const { id: suiteId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [addSectionOpen, setAddSectionOpen] = useState(false);

  const {
    routes,
    assignments,
    isLoading,
    error,
    isDirty,
    isDiskMode,
    isActiveSuite,
    setRouteResponse,
    save,
    toggleActive,
  } = useSuiteDetail(suiteId ?? "");

  /** Routes currently assigned to this suite */
  const assignedRoutes = routes.filter((r) => r.id in assignments);
  /** Routes not yet assigned */
  const unassignedRoutes = routes.filter((r) => !(r.id in assignments));

  const assignedCount = assignedRoutes.length;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void navigate(ROUTES.HOME)}
          aria-label="Back to suites"
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <PageHeader
          title={suiteId ?? "Suite"}
          description={`${assignedCount} route${assignedCount !== 1 ? "s" : ""} assigned`}
          actions={
            <div className="flex items-center gap-3">
              {isDiskMode && (
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-muted-foreground/30 text-xs"
                >
                  OFFLINE
                </Badge>
              )}
              {isActiveSuite && !isDiskMode && (
                <Badge
                  variant="outline"
                  className="text-primary border-primary/40 text-xs"
                >
                  ACTIVE
                </Badge>
              )}
              {!isDiskMode && (
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="active-switch"
                    className="text-sm text-muted-foreground"
                  >
                    Active
                  </Label>
                  <Switch
                    id="active-switch"
                    checked={isActiveSuite}
                    onCheckedChange={() => void toggleActive()}
                    aria-label={`Set ${suiteId} as active suite`}
                  />
                </div>
              )}
              <Button
                onClick={() => void save()}
                disabled={!isDirty || isLoading}
                size="sm"
              >
                <SaveIcon className="size-4" />
                Save changes
              </Button>
            </div>
          }
        />
      </div>

      {/* ── Error ── */}
      {error && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          {error}
        </p>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">Loading…</p>
        </div>
      )}

      {/* ── Assigned routes ── */}
      {!isLoading && (
        <section className="flex flex-col gap-2">
          {assignedRoutes.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground border border-dashed rounded-md">
              <p className="text-sm">No routes assigned yet. Add one below.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {assignedRoutes.map((route) => (
                <RouteAssignmentRow
                  key={route.id}
                  route={route}
                  assignedResponseId={assignments[route.id] ?? null}
                  onChange={setRouteResponse}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Add routes (collapsible) ── */}
      {!isLoading && unassignedRoutes.length > 0 && (
        <section className="flex flex-col gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
            onClick={() => setAddSectionOpen((v) => !v)}
            aria-expanded={addSectionOpen}
          >
            {addSectionOpen ? (
              <ChevronDownIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            )}
            Add routes ({unassignedRoutes.length} available)
          </button>

          {addSectionOpen && (
            <div className="flex flex-col gap-1">
              {unassignedRoutes.map((route) => (
                <RouteAssignmentRow
                  key={route.id}
                  route={route}
                  assignedResponseId={null}
                  onChange={setRouteResponse}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
