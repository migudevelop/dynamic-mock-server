import { isString } from "types-guards";

import type {
  Alert,
  ChangeListener,
  UnsubscribeFunction,
} from "./alerts.types.js";
import { NestedRoutesSuites } from "./nested-routes-suites.js";

/**
 * Alerts system extends NestedRoutesSuites to provide structured alert management.
 * Alerts can be organized by namespace and include error details.
 */
export class Alerts extends NestedRoutesSuites {
  /**
   * Set an alert with optional error details
   */
  set(id: string, message: string, error?: Error): void {
    if (!isString(id) || id.trim() === "") {
      throw new Error("Alert id must be a non-empty string");
    }

    if (!isString(message) || message.trim() === "") {
      throw new Error("Alert message must be a non-empty string");
    }

    const alert: Alert = {
      id,
      message,
    };

    if (error instanceof Error) {
      alert.error = {
        name: error.name,
        message: error.message,
        stack: error.stack || "",
      };
    }

    super.set(id, alert);
  }

  /**
   * Get an alert by id
   */
  get(id: string): Alert | undefined {
    return super.get(id) as Alert | undefined;
  }

  /**
   * Create or get a namespaced alert collection
   */
  collection(namespace: string): Alerts {
    const child = super.collection(namespace);
    // Convert to Alerts instance if it's a plain NestedRoutesSuites
    if (!(child instanceof Alerts)) {
      // Convert prototype in-place so the returned collection behaves as `Alerts`.
      // We mutate the existing nested collection rather than creating a new
      // Alerts instance to preserve internal data stored on `child`.
      Object.setPrototypeOf(child, Alerts.prototype);
    }
    return child as Alerts;
  }

  /**
   * Get all alerts as a flat array
   */
  get flat(): Alert[] {
    return super.flat as Alert[];
  }

  /**
   * Get alerts from this collection only
   */
  get values(): Alert[] {
    return super.values as Alert[];
  }

  /**
   * Subscribe to alert changes
   */
  onChange(listener: ChangeListener): UnsubscribeFunction {
    return super.onChange(listener);
  }
}

export default Alerts;
