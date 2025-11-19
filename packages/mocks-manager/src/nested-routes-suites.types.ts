import type { NestedRoutesSuites } from "./nested-routes-suites";

/**
 * Represents a listener function for routes-suites changes
 */
export type ChangeListener = () => void;

/**
 * Function to unsubscribe from a listener
 */
export type UnsubscribeFunction = () => void;

/**
 * Options for creating a nested collection (routes-suite)
 */
export interface NestedCollectionOptions {
  /** The parent routes-suite (if any) */
  parent?: NestedRoutesSuites;
}
