import { isString } from "@migudevelop/types-utils";
import type {
  ChangeListener,
  UnsubscribeFunction,
  NestedCollectionOptions,
} from "./nested-routes-suites.types.js";

/**
 * NestedRoutesSuites provides a hierarchical routes-suites system with namespaces.
 * Each routes-suite can have child routes-suites and notifies parent on changes.
 * Used for managing alerts, logs, and other nested data structures.
 */
export class NestedRoutesSuites {
  private _items = new Map<string, unknown>();
  private _routesSuites = new Map<string, NestedRoutesSuites>();
  private _listeners = new Set<ChangeListener>();
  private _parent?: NestedRoutesSuites;

  constructor(options?: NestedCollectionOptions) {
    this._parent = options?.parent;
  }

  /**
   * Set an item in the routes-suite
   */
  set(id: string, value: unknown): void {
    this._items.set(id, value);
    this._emitChange();
  }

  /**
   * Get an item from the routes-suite
   */
  get(id: string): unknown {
    return this._items.get(id);
  }

  /**
   * Check if an item exists in the routes-suite
   */
  has(id: string): boolean {
    return this._items.has(id);
  }

  /**
   * Remove an item from the routes-suite
   */
  remove(id: string): boolean {
    const deleted = this._items.delete(id);
    if (deleted) {
      this._emitChange();
    }
    return deleted;
  }

  /**
   * Clear all items from the routes-suite
   */
  clean(): void {
    this._items.clear();
    this._emitChange();
  }

  /**
   * Get or create a child routes-suite (namespace)
   */
  collection(namespace: string): NestedRoutesSuites {
    if (!isString(namespace) || namespace.trim() === "") {
      throw new Error("Namespace must be a non-empty string");
    }

    let child = this._routesSuites.get(namespace);
    if (!child) {
      child = new NestedRoutesSuites({ parent: this });
      this._routesSuites.set(namespace, child);
    }
    return child;
  }

  /**
   * Get all items as a flat array (includes child routes-suites recursively)
   */
  get flat(): unknown[] {
    const result: unknown[] = [];

    // Add items from this routes-suite
    for (const item of this._items.values()) {
      result.push(item);
    }

    // Add items from child routes-suites
    for (const child of this._routesSuites.values()) {
      result.push(...child.flat);
    }

    return result;
  }

  /**
   * Get all items from this routes-suite only (not including children)
   */
  get values(): unknown[] {
    return Array.from(this._items.values());
  }

  /**
   * Get all keys from this routes-suite only
   */
  get keys(): string[] {
    return Array.from(this._items.keys());
  }

  /**
   * Get the size of this routes-suite (not including children)
   */
  get size(): number {
    return this._items.size;
  }

  /**
   * Subscribe to changes in this routes-suite or any child routes-suite
   */
  onChange(listener: ChangeListener): UnsubscribeFunction {
    if (typeof listener !== "function") {
      throw new Error("Listener must be a function");
    }

    this._listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Emit change event to all listeners and propagate to parent
   */
  private _emitChange(): void {
    // Notify local listeners
    for (const listener of this._listeners) {
      try {
        listener();
      } catch (error) {
        // Prevent listener errors from breaking the chain
        console.error("Error in NestedRoutesSuites listener:", error);
      }
    }

    // Propagate to parent
    if (this._parent) {
      this._parent._emitChange();
    }
  }

  /**
   * Get all child routes-suite names
   */
  get childRoutesSuites(): string[] {
    return Array.from(this._routesSuites.keys());
  }

  /**
   * Remove all items and child routes-suites
   */
  clear(): void {
    this._items.clear();
    this._routesSuites.clear();
    this._emitChange();
  }
}

export default NestedRoutesSuites;
