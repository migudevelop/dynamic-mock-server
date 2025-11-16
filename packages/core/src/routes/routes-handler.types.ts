export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export interface RouteDefinition {
  method: HttpMethod;
  path: string; // exact path match (e.g. /api/users)
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
  // optional custom handler; if provided it is used instead of static body
  handler?: (request: any, reply: any) => Promise<unknown> | unknown;
}
