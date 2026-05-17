import { isString } from "types-guards";

import type {
  Alert,
  ChangeListener,
  UnsubscribeFunction,
} from "./alerts.types.js";
import { NestedRoutesSuites } from "@dynamic-mock-server/mocks-manager";

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
  override collection(namespace: string): Alerts {
    if (!isString(namespace) || namespace.trim() === "") {
      throw new Error("Namespace must be a non-empty string");
    }

    const existing = this._routesSuites.get(namespace);
    if (existing instanceof Alerts) {
      return existing;
    }

    const alertsChild = new Alerts({ parent: this });
    this._routesSuites.set(namespace, alertsChild);
    return alertsChild;
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
