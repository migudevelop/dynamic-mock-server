import { useState } from "react";
import { ArrowLeftIcon, PlusIcon, SaveIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  AddRoutesDialog,
  type RouteSelection,
} from "@/components/suites/add-routes-dialog";
import { RouteAssignmentRow } from "@/components/suites/route-assignment-row";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import { Switch } from "@/components/shadcn/ui/switch";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { ROUTES } from "@/helpers/navigation/navigation";
import { useSuiteDetail } from "@/hooks/use-suite-detail";
import { toast } from "sonner";

/**
 * Suite detail page.
 *
 * Shows only the routes assigned to this suite.
 * An "+ Add routes" button opens a modal to assign additional routes.
 * Works in both online (admin API) and offline (disk files) mode.
 */
export function SuiteDetail() {
  const { id: suiteId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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
  /** Routes not yet assigned — passed to the dialog */
  const unassignedRoutes = routes.filter((r) => !(r.id in assignments));

  const assignedCount = assignedRoutes.length;

  /**
   * Receives the selections from the dialog and marks them as assigned.
   * Shows a toast with the number of routes added.
   * The user can then click "Save changes" to persist.
   */
  function handleAddRoutes(selections: RouteSelection[]) {
    for (const { routeId, responseId } of selections) {
      setRouteResponse(routeId, responseId);
    }
    toast.success(
      `${selections.length} route${selections.length !== 1 ? "s" : ""} added. Click "Save changes" to persist.`,
    );
  }

  /** Saves the current assignments and shows a toast with the result. */
  async function handleSave() {
    try {
      await save();
      toast.success("Changes saved successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save changes.",
      );
    }
  }

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
                variant="outline"
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                disabled={isLoading || unassignedRoutes.length === 0}
              >
                <PlusIcon className="size-4" />
                Add routes
              </Button>
              <Button
                onClick={() => void handleSave()}
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
              <p className="text-sm">
                No routes assigned yet.{" "}
                {unassignedRoutes.length > 0 && (
                  <button
                    type="button"
                    className="underline hover:text-foreground transition-colors"
                    onClick={() => setAddDialogOpen(true)}
                  >
                    Add routes
                  </button>
                )}
              </p>
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

      {/* ── Add routes dialog ── */}
      <AddRoutesDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        suiteId={suiteId ?? ""}
        availableRoutes={unassignedRoutes}
        onAdd={handleAddRoutes}
      />
    </div>
  );
}
