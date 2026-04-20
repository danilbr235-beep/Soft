import type { LogEntry, QuickLogType } from "@pmhc/types";

export type TrackingLogFilter = "all" | "scores" | "symptoms" | "routines";

export type TrackingExportPayload = {
  version: 1;
  generatedAt: string;
  filter: TrackingLogFilter;
  totalLogs: number;
  logs: LogEntry[];
};

const scoreLogTypes = new Set<QuickLogType>(["sleep_quality", "energy", "confidence", "libido"]);
const routineLogTypes = new Set<QuickLogType>(["morning_erection", "pelvic_floor_done", "pump_done", "sex_happened"]);

export function filterTrackingLogs(logs: LogEntry[], filter: TrackingLogFilter): LogEntry[] {
  return [...logs]
    .filter((log) => matchesFilter(log, filter))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export function updateTrackingLogValue(logs: LogEntry[], logId: string, value: unknown): LogEntry[] {
  return logs.map((log) => (log.id === logId ? { ...log, value } : log));
}

export function deleteTrackingLog(logs: LogEntry[], logId: string): LogEntry[] {
  return logs.filter((log) => log.id !== logId);
}

export function buildTrackingExport(
  logs: LogEntry[],
  generatedAt: string,
  filter: TrackingLogFilter,
): TrackingExportPayload {
  return {
    version: 1,
    generatedAt,
    filter,
    totalLogs: logs.length,
    logs,
  };
}

function matchesFilter(log: LogEntry, filter: TrackingLogFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "scores") {
    return scoreLogTypes.has(log.type);
  }

  if (filter === "symptoms") {
    return log.type === "symptom_checkin";
  }

  return routineLogTypes.has(log.type);
}
