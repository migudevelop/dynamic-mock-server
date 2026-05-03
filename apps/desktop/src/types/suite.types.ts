/** A suite as returned by the admin API */
export interface SuiteDto {
  /** Unique suite identifier */
  id: string;
  /** Route-response assignments in "routeId:responseId" format */
  routes: string[];
  /** ID of the suite this suite extends, if any */
  extends?: string;
}

/** Payload to add or update a suite via admin API */
export interface UpsertSuitePayload {
  /** Unique suite identifier */
  id: string;
  /** Route-response assignments in "routeId:responseId" format */
  routes: string[];
  /** ID of the suite this suite extends, if any */
  extends?: string;
}

/** Response from GET /__admin/suites */
export interface SuitesListResponse {
  /** All registered suites */
  suites: SuiteDto[];
  /** Name of the currently active suite, or null */
  activeSuite: string | null;
}

/** Helper type: suite routes in the disk file format (Record) */
export type SuiteRoutesRecord = Record<string, string>;

/**
 * Converts disk format (Record) to admin API format (string[])
 *
 * @param record - Suite routes as saved in disk files
 * @returns Array of "routeId:responseId" strings
 */
export function suiteRecordToArray(record: SuiteRoutesRecord): string[] {
  return Object.entries(record).map(
    ([routeId, responseId]) => `${routeId}:${responseId}`,
  );
}

/**
 * Converts admin API format (string[]) to disk format (Record)
 *
 * @param routes - Array of "routeId:responseId" strings
 * @returns Record mapping routeId to responseId
 */
export function suiteArrayToRecord(routes: string[]): SuiteRoutesRecord {
  return routes.reduce<SuiteRoutesRecord>((acc, entry) => {
    const colonIdx = entry.indexOf(":");
    if (colonIdx !== -1) {
      const routeId = entry.slice(0, colonIdx);
      const responseId = entry.slice(colonIdx + 1);
      acc[routeId] = responseId;
    }
    return acc;
  }, {});
}
