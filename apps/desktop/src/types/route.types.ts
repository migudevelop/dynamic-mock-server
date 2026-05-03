/** Supported HTTP methods for mock routes */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

/** A route response as returned by the admin API */
export interface RouteResponseDto {
  /** Unique response identifier within its route */
  id: string;
  /** HTTP status code to return */
  status?: number;
  /** Custom response headers */
  headers?: Record<string, string>;
  /** Response body (any JSON-serializable value) */
  body?: unknown;
  /** True if the response uses a dynamic handler function (read-only in UI) */
  hasHandler?: boolean;
  /** Artificial response delay in milliseconds */
  delay?: number;
}

/** A route as returned by the admin API */
export interface RouteDto {
  /** Unique route identifier */
  id: string;
  /** URL path pattern (e.g. "/api/users/:id") */
  url: string;
  /** HTTP method this route handles */
  method: HttpMethod;
  /** Whether this endpoint is enabled; disabled routes return 404 */
  enabled?: boolean;
  /** Available responses for this route */
  responses: RouteResponseDto[];
  /** Currently selected response ID, or null if using default */
  selectedResponse?: string | null;
}

/** Payload to add or update a route via admin API */
export interface UpsertRoutePayload {
  /** Unique route identifier */
  id: string;
  /** URL path pattern */
  url: string;
  /** HTTP method */
  method: HttpMethod;
  /** Whether this endpoint is enabled; disabled routes return 404 */
  enabled?: boolean;
  /** Available responses */
  responses: RouteResponseDto[];
}

/** A file entry in a directory listing */
export interface FileEntry {
  /** File or directory name */
  name: string;
  /** Whether this entry is a directory */
  isDirectory: boolean;
  /** Full absolute path */
  path: string;
}
