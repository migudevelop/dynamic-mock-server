import { useCallback, useEffect, useState } from "react";
import { ChevronDownIcon, ArrowRightIcon } from "lucide-react";
import { useNavigate } from "react-router";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { cn } from "@/helpers/shadcn/utils";
import { buildRouteRoute } from "@/helpers/navigation/navigation";
import { tauriCommands } from "@/helpers/tauri-commands";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";
import type { RouteDto, RouteResponseDto } from "@/types/route.types";
import { isNullish } from "types-guards";

/** Background colors for method badges */
const METHOD_BG: Record<string, string> = {
  GET: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  POST: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  PUT: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  PATCH:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  DELETE:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  OPTIONS:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  HEAD: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
};

/** Returns a label for the response body type */
function getBodyType(response: RouteResponseDto): string {
  if (!isNullish(response.body)) return "JSON";
  if (response.hasHandler) return "HANDLER";
  return "STATUS";
}

/** Raw disk format for a route file */
interface DiskRoute {
  id: string;
  url: string;
  method: string;
  enabled?: boolean;
  responses?: Array<{
    id: string;
    status?: number;
    body?: unknown;
    hasHandler?: boolean;
    delay?: number;
  }>;
}

/**
 * Routes list page.
 *
 * Shows all routes as an accordion. Each route expands to reveal its variants.
 * A search field filters by route ID or URL.
 * Works in both online (admin API) and offline (disk files) mode.
 */
export function RoutesListPage() {
  const navigate = useNavigate();
  const status = useServerStore((s) => s.status);
  const serverConfig = useServerStore((s) => s.config);
  const activeProject = useProjectStore(
    (s) => s.projects.find((p) => p.id === s.activeProjectId) ?? null,
  );

  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [methodFilter, setMethodFilter] = useState<string>("ALL");

  const adminApi = useAdminApi();
  const mocksPath = serverConfig?.files?.path ?? "mocks";

  const loadFromApi = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getRoutes();
      setRoutes(data);
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromDisk = useCallback(
    async (projectPath: string) => {
      setIsLoading(true);
      setError(null);
      const diskRoutes: RouteDto[] = [];
      try {
        const entries = await tauriCommands.listDirectory(
          `${projectPath}/${mocksPath}/routes`,
          projectPath,
        );
        const jsFiles = entries.filter(
          (e) => !e.isDirectory && /\.(js|cjs|mjs)$/.test(e.name),
        );
        const results = await Promise.allSettled(
          jsFiles.map((f) => tauriCommands.evaluateJsFile(f.path, projectPath)),
        );
        for (const result of results) {
          if (result.status === "rejected") continue;
          const raw = JSON.parse(result.value) as DiskRoute | DiskRoute[];
          const routeArr = Array.isArray(raw) ? raw : [raw];
          for (const disk of routeArr) {
            if (!disk.id || !disk.url || !disk.method) continue;
            diskRoutes.push({
              id: disk.id,
              url: disk.url,
              method: disk.method as RouteDto["method"],
              enabled: disk.enabled,
              responses: (disk.responses ?? []).map((r) => ({
                id: r.id,
                status: r.status,
                body: r.body,
                hasHandler: r.hasHandler,
                delay: r.delay,
              })),
              selectedResponse: null,
            });
          }
        }
        const unique = Array.from(
          new Map(diskRoutes.map((r) => [r.id, r])).values(),
        );
        setRoutes(unique);
      } catch (err: unknown) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [mocksPath],
  );

  useEffect(() => {
    if (status === "running") {
      void loadFromApi();
    } else if (activeProject?.path) {
      void loadFromDisk(activeProject.path);
    } else {
      setRoutes([]);
    }
  }, [status, activeProject?.path, loadFromApi, loadFromDisk]);

  function toggleExpand(routeId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
      }
      return next;
    });
  }

  const query = search.toLowerCase().trim();
  const filtered = routes.filter((r) => {
    const matchesQuery =
      !query ||
      r.id.toLowerCase().includes(query) ||
      r.url.toLowerCase().includes(query);
    const matchesMethod = methodFilter === "ALL" || r.method === methodFilter;
    return matchesQuery && matchesMethod;
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Routes"
        description="Browse all mock routes and their response variants."
      />

      {/* Search + method filter */}
      <div className="flex items-center gap-2 max-w-lg">
        <Input
          placeholder="Search by route ID or URL…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-28 shrink-0">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="OPTIONS">OPTIONS</SelectItem>
            <SelectItem value="HEAD">HEAD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          {error}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">Loading…</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="flex items-center justify-center py-16 text-muted-foreground border border-dashed rounded-md">
          <p className="text-sm">
            {routes.length === 0
              ? "No routes found."
              : "No routes match your search."}
          </p>
        </div>
      )}

      {/* Route accordion list */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col gap-1">
          {filtered.map((route) => {
            const isExpanded = expandedIds.has(route.id);
            return (
              <div
                key={route.id}
                className="rounded-md border border-border bg-card overflow-hidden"
              >
                {/* Route header row — clicking anywhere expands/collapses */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-muted/40 transition-colors"
                  onClick={() => toggleExpand(route.id)}
                  role="button"
                  aria-expanded={isExpanded}
                >
                  {/* Chevron indicator */}
                  <ChevronDownIcon
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isExpanded ? "rotate-0" : "-rotate-90",
                    )}
                  />

                  {/* Method badge */}
                  <span
                    className={cn(
                      "font-mono text-[11px] font-bold px-2 py-0.5 rounded border shrink-0",
                      METHOD_BG[route.method] ??
                        "bg-muted text-foreground border-border",
                    )}
                  >
                    {route.method}
                  </span>

                  {/* ID + URL */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider leading-none">
                      ID: {route.id}
                    </span>
                    <span className="font-mono text-sm text-foreground truncate">
                      {route.url}
                    </span>
                  </div>

                  {/* Variant count badge */}
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[12px] px-1.5 py-0 text-muted-foreground"
                  >
                    {route.responses.length}{" "}
                    {route.responses.length === 1 ? "variant" : "variants"}
                  </Badge>

                  {/* Navigate button — stopPropagation to avoid toggling accordion */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      void navigate(buildRouteRoute(route.id));
                    }}
                    aria-label={`Edit route ${route.id}`}
                  >
                    <ArrowRightIcon className="size-4" />
                  </Button>
                </div>

                {/* Variants list (accordion content) */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/30">
                    <div className="px-4 py-2">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-2">
                        Responses
                      </p>
                      <div className="flex flex-col gap-1">
                        {route.responses.map((resp) => {
                          const bodyType = getBodyType(resp);
                          return (
                            <div
                              key={resp.id}
                              className="flex items-center gap-3 px-3 py-2 rounded-sm bg-background border border-border/50"
                            >
                              {/* Variant name */}
                              <span className="text-sm font-medium text-foreground min-w-0 flex-1 truncate">
                                {resp.id}
                              </span>

                              {/* Body type badge */}
                              <Badge
                                variant="outline"
                                className={cn(
                                  "shrink-0 text-[10px] px-1.5 py-0 font-mono",
                                  bodyType === "JSON" &&
                                    "border-sky-300 text-sky-600 dark:border-sky-700 dark:text-sky-400",
                                  bodyType === "HANDLER" &&
                                    "border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400",
                                  bodyType === "STATUS" &&
                                    "border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400",
                                )}
                              >
                                {bodyType}
                              </Badge>

                              {/* Status code */}
                              <span className="text-sm text-muted-foreground shrink-0 font-mono">
                                {resp.status ?? 200}
                              </span>

                              {/* ID label */}
                              <span className="text-[11px] text-muted-foreground/60 font-mono shrink-0 hidden sm:block">
                                ID: {resp.id}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
