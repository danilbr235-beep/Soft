import type { LogEntry, QuickLogType } from "@pmhc/types";
import { hasSymptomRedFlag } from "@pmhc/safety";

export type TrackingSignalSummary = {
  type: QuickLogType;
  average: number | null;
  latest: number | null;
  count: number;
  trend: "up" | "down" | "flat" | "unknown";
};

export type TrackingSnapshot = {
  logsToday: number;
  logsThisWeek: number;
  latestLogAt: string | null;
  scoreSignals: TrackingSignalSummary[];
  hasSafetySignal: boolean;
};

const scoreSignalTypes: QuickLogType[] = ["sleep_quality", "energy", "confidence", "libido"];
const recentWindowDays = 7;
const msPerDay = 24 * 60 * 60 * 1000;

export function buildTrackingSnapshot(logs: LogEntry[], now = new Date()): TrackingSnapshot {
  const nowMs = now.getTime();
  const todayKey = now.toISOString().slice(0, 10);
  const recentLogs = logs.filter((log) => {
    const occurredAt = Date.parse(log.occurredAt);
    return Number.isFinite(occurredAt) && occurredAt <= nowMs && occurredAt >= nowMs - recentWindowDays * msPerDay;
  });
  const latestLogAt = latestByTime(logs)?.occurredAt ?? null;

  return {
    logsToday: recentLogs.filter((log) => log.occurredAt.slice(0, 10) === todayKey).length,
    logsThisWeek: recentLogs.length,
    latestLogAt,
    scoreSignals: scoreSignalTypes.map((type) => summarizeScoreSignal(recentLogs, type)),
    hasSafetySignal: recentLogs.some((log) => log.type === "symptom_checkin" && hasSymptomRedFlag(log.value)),
  };
}

function summarizeScoreSignal(logs: LogEntry[], type: QuickLogType): TrackingSignalSummary {
  const values = logs
    .filter((log) => log.type === type && typeof log.value === "number")
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .map((log) => Number(log.value));

  if (values.length === 0) {
    return {
      type,
      average: null,
      latest: null,
      count: 0,
      trend: "unknown",
    };
  }

  const latest = values[0] ?? null;
  const previous = values[1] ?? null;

  return {
    type,
    average: roundToTenth(values.reduce((sum, value) => sum + value, 0) / values.length),
    latest,
    count: values.length,
    trend: trendFor(latest, previous),
  };
}

function latestByTime(logs: LogEntry[]) {
  return logs
    .filter((log) => Number.isFinite(Date.parse(log.occurredAt)))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))[0];
}

function trendFor(latest: number | null, previous: number | null): TrackingSignalSummary["trend"] {
  if (latest == null || previous == null) {
    return "unknown";
  }

  const delta = latest - previous;

  if (delta > 0.5) {
    return "up";
  }

  if (delta < -0.5) {
    return "down";
  }

  return "flat";
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}
