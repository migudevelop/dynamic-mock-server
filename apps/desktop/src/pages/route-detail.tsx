import { ArrowLeftIcon, CopyIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";

import { ResponseEditor } from "@/components/routes/response-editor";
import { VariantSidebar } from "@/components/routes/variant-sidebar";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { Separator } from "@/components/shadcn/ui/separator";
import { Switch } from "@/components/shadcn/ui/switch";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { cn } from "@/helpers/shadcn/utils";
import { ROUTES } from "@/helpers/navigation/navigation";
import { useRouteDetail } from "@/hooks/use-route-detail";
import type { HttpMethod } from "@/types/route.types";

const METHOD_BG_COLORS: Record<string, string> = {
  GET: "bg-green-50 text-green-700 border-green-200",
  POST: "bg-sky-50 text-sky-700 border-sky-200",
  PUT: "bg-amber-50 text-amber-700 border-amber-200",
  PATCH: "bg-orange-50 text-orange-700 border-orange-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
  OPTIONS: "bg-purple-50 text-purple-700 border-purple-200",
  HEAD: "bg-slate-50 text-slate-700 border-slate-200",
};

const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
];

/**
 * Route detail page.
 *
 * Shows route metadata and allows editing each response variant
 * using a Monaco JSON editor. Works in both online and offline modes.
 */
export function RouteDetail() {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialVariantId = searchParams.get("variant");

  const {
    route,
    selectedVariantId,
    isDirty,
    isLoading,
    error,
    isDiskMode,
    setSelectedVariant,
    setRouteField,
    setVariantField,
    addVariant,
    duplicateVariant,
    removeVariant,
    renameVariant,
    save,
    deleteRoute,
  } = useRouteDetail(routeId ?? "", initialVariantId);

  const selectedVariant =
    route?.responses.find((r) => r.id === selectedVariantId) ?? null;

  /** Saves and shows a toast */
  async function handleSave() {
    try {
      await save();
      toast.success("Route saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save route.");
    }
  }

  /** Deletes the route, shows a toast and navigates back */
  async function handleDelete() {
    try {
      await deleteRoute();
      toast.success("Route deleted.");
      void navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete route.",
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
          onClick={() => void navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <PageHeader
          title={
            route ? (
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-mono text-xs font-bold px-2 py-0.5 rounded border shrink-0",
                    METHOD_BG_COLORS[route.method] ??
                      "bg-muted text-foreground border-border",
                  )}
                >
                  {route.method}
                </span>
                <span className="font-mono font-semibold">{route.url}</span>
              </span>
            ) : (
              (routeId ?? "Route")
            )
          }
          description={
            route
              ? `Editing variant: ${selectedVariant?.id ?? "—"}`
              : "Loading…"
          }
          actions={
            <div className="flex items-center gap-2">
              {selectedVariant && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateVariant(selectedVariant.id)}
                  disabled={isLoading}
                >
                  <CopyIcon className="size-4" />
                  Duplicate
                </Button>
              )}

              <Button
                size="sm"
                onClick={() => void handleSave()}
                disabled={!isDirty || isLoading}
              >
                <SaveIcon className="size-4" />
                Save Changes
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

      {/* ── Not found ── */}
      {!isLoading && !route && (
        <div className="flex items-center justify-center py-16 text-muted-foreground border border-dashed rounded-md">
          <p className="text-sm">Route &quot;{routeId}&quot; not found.</p>
        </div>
      )}

      {/* ── Route Metadata ── */}
      {!isLoading && route && (
        <div className="rounded-lg border border-border bg-muted/20 p-4 flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Route ID
              </Label>
              <Input
                value={route.id}
                onChange={(e) => setRouteField("id", e.target.value)}
                disabled={isLoading}
                className="font-mono text-sm"
                placeholder="route-id"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Method
              </Label>
              <Select
                value={route.method}
                onValueChange={(v) => setRouteField("method", v as HttpMethod)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 flex-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                URL
              </Label>
              <Input
                value={route.url}
                onChange={(e) => setRouteField("url", e.target.value)}
                disabled={isLoading}
                className="font-mono text-sm"
                placeholder="/api/resource"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 bg-background">
            <div>
              <p className="text-sm font-medium text-foreground">
                Endpoint Enabled
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                When disabled, the server returns 404 for this route regardless
                of the variant.
              </p>
            </div>
            <Switch
              checked={route.enabled !== false}
              onCheckedChange={(enabled) => setRouteField("enabled", enabled)}
              disabled={isLoading}
              aria-label="Toggle endpoint enabled"
            />
          </div>
        </div>
      )}

      {/* ── Main editor layout ── */}
      {!isLoading && route && (
        <div className="flex gap-6 items-stretch min-h-100">
          {/* Left: variants sidebar */}
          <VariantSidebar
            variants={route.responses}
            selectedVariantId={selectedVariantId}
            onSelect={setSelectedVariant}
            onAdd={addVariant}
            onRemove={(variantId) => {
              if (route.responses.length === 1) {
                toast.error("A route must have at least one variant.");
                return;
              }
              removeVariant(variantId);
            }}
            canRemove={route.responses.length > 1}
          />

          <Separator orientation="vertical" className="self-stretch" />

          {/* Right: response editor */}
          {selectedVariant ? (
            <ResponseEditor
              variant={selectedVariant}
              onVariantIdChange={(newId) =>
                renameVariant(selectedVariant.id, newId)
              }
              onVariantChange={(field, value) =>
                setVariantField(selectedVariant.id, field, value)
              }
              disabled={isLoading}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center py-16 text-muted-foreground">
              <p className="text-sm">Select a variant to edit.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete route button (bottom, destructive zone) — online only */}
      {!isLoading && route && !isDiskMode && (
        <div className="flex justify-end pt-4 border-t border-border mt-4">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => void handleDelete()}
            disabled={isLoading}
          >
            <Trash2Icon className="size-4" />
            Delete Route
          </Button>
        </div>
      )}
    </div>
  );
}
