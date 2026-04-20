/**
 * Represents a listener function for alerts changes
 */
export type ChangeListener = () => void;

/**
 * Function to unsubscribe from a listener
 */
export type UnsubscribeFunction = () => void;

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
