export type Status = keyof typeof statuses;

const statuses = {
  configuration: "Configuration",
  active: "Active",
  draft: "Draft",
  deprecated: "Deprecated",
  obsolete: "Obsolete",
  experimental: "Experimental",
  retired: "Retired",
  recalled: "Recalled",
} as const;

export function formatStatus(key: Status): string {
  return statuses[key];
}
