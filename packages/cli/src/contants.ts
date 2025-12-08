export const INTERACTIVE_OPTIONS_VALUES_MAP = {
  STATUS: "status",
  CONFIG: "config",
  SUITE: "suite",
  ROUTES: "routes",
  RESPONSE: "response",
  RESTART: "restart",
  ALERTS: "alerts",
  EXIT: "exit",
} as const;

export const INTERACTIVE_OPTIONS = [
  { value: INTERACTIVE_OPTIONS_VALUES_MAP.STATUS, label: "Show server status" },
  {
    value: INTERACTIVE_OPTIONS_VALUES_MAP.CONFIG,
    label: "Show server configuration",
  },
  { value: INTERACTIVE_OPTIONS_VALUES_MAP.SUITE, label: "Change routes suite" },
  { value: INTERACTIVE_OPTIONS_VALUES_MAP.ROUTES, label: "View routes" },
  {
    value: INTERACTIVE_OPTIONS_VALUES_MAP.RESPONSE,
    label: "Override route response",
  },
  { value: INTERACTIVE_OPTIONS_VALUES_MAP.RESTART, label: "Restart server" },
  { value: INTERACTIVE_OPTIONS_VALUES_MAP.ALERTS, label: "View alerts" },
  { value: INTERACTIVE_OPTIONS_VALUES_MAP.EXIT, label: "Exit" },
];
