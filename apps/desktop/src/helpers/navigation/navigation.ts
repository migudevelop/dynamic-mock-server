export const ROUTES = {
  HOME: "/",
  SUITE: "/suite/:id",
  ROUTE: "/route/:id",
  SETTINGS: "settings",
};

/**
 * Normalize a path for comparison: removes a trailing slash except for root.
 * @param path - Path to normalize
 * @returns Normalized path
 */
function normalizePath(path: string) {
  if (!path) return path;
  return path === "/" ? "/" : path.replace(/\/+$/g, "");
}

/**
 * Determines whether the current pathname matches the given route exactly.
 * Normalizes trailing slashes so `/foo` and `/foo/` are considered equal,
 * but `/` remains the root.
 *
 * @param currentPath - Current pathname (from next/navigation `usePathname()`)
 * @param route - Route to compare against (one of `ROUTES`)
 * @returns `true` when the paths match exactly after normalization
 *
 * @example
 * isRouteActive('/personal-records', '/personal-records') // true
 * isRouteActive('/personal-records/', '/personal-records') // true
 * isRouteActive('/personal-records/123', '/personal-records') // false
 */
export function isRouteActive(
  currentPath: string | undefined | null,
  route: string,
) {
  if (!currentPath) return false;
  return normalizePath(currentPath) === normalizePath(route);
}

/**
 * Builds the absolute path for a suite detail page.
 *
 * @param suiteId - The suite's unique identifier
 * @returns Route path like `/suite/base`
 */
export function buildSuiteRoute(suiteId: string): string {
  return `/suite/${encodeURIComponent(suiteId)}`;
}

/**
 * Builds the absolute path for a route detail page.
 *
 * @param routeId - The route's unique identifier
 * @returns Route path like `/route/get-users`
 */
export function buildRouteRoute(routeId: string): string {
  return `/route/${encodeURIComponent(routeId)}`;
}
