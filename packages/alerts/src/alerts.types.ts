import type {
  ChangeListener,
  UnsubscribeFunction,
} from "@dynamic-mock-server/mocks-manager";

/**
 * Represents an alert in the system
 */
export interface Alert {
  /** Unique identifier for the alert */
  id: string;
  /** Alert message */
  message: string;
  /** Optional error details */
  error?: {
    /** Error name */
    name: string;
    /** Error message */
    message: string;
    /** Error stack trace */
    stack: string;
  };
}

export type { ChangeListener, UnsubscribeFunction };
