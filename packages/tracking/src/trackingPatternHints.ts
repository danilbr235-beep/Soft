import type { LogEntry, QuickLogType } from "@pmhc/types";

export type TrackingPatternHintId = "sleep_energy" | "sleep_confidence" | "confidence_libido" | "low_data";
export type TrackingPatternDirection = "together" | "opposite" | "unknown";
export type TrackingPatternConfidence = "low" | "medium";
export type TrackingPatternStatus = "observed" | "low_data";

export type TrackingPatternHint = {
  id: TrackingPatternHintId;
  status: TrackingPatternStatus;
  primaryType: QuickLogType | null;
  comparisonType: QuickLogType | null;
  direction: TrackingPatternDirection;
  overlappingDays: number;
  confidence: TrackingPatternConfidence;
};

type PatternCandidate = {
  id: Exclude<TrackingPatternHintId, "low_data">;
  primaryType: QuickLogType;
  comparisonType: QuickLogType;
};

const recentWindowDays = 7;
const msPerDay = 24 * 60 * 60 * 1000;
const minOverlappingDays = 3;
const candidates: PatternCandidate[] = [
  { id: "sleep_energy", primaryType: "sleep_quality", comparisonType: "energy" },
  { id: "sleep_confidence", primaryType: "sleep_quality", comparisonType: "confidence" },
  { id: "confidence_libido", primaryType: "confidence", comparisonType: "libido" },
];

export function buildTrackingPatternHints(logs: LogEntry[], now = new Date()): TrackingPatternHint[] {
  const recentLogs = recentLogsFor(logs, now);
  const observed = candidates
    .map((candidate) => hintForCandidate(recentLogs, candidate))
    .filter((hint): hint is TrackingPatternHint => hint != null);

  return observed.length > 0 ? observed.slice(0, 2) : [lowDataHint()];
}

function hintForCandidate(logs: LogEntry[], candidate: PatternCandidate): TrackingPatternHint | null {
  const pairs = pairedDailyScores(logs, candidate.primaryType, candidate.comparisonType);

  if (pairs.length < minOverlappingDays) {
    return null;
  }

  const first = pairs[0];
  const last = pairs[pairs.length - 1];

  if (!first || !last) {
    return null;
  }

  const primaryDelta = last.primary - first.primary;
  const comparisonDelta = last.comparison - first.comparison;
  const primaryDirection = directionForDelta(primaryDelta);
  const comparisonDirection = directionForDelta(comparisonDelta);

  if (primaryDirection === "unknown" || comparisonDirection === "unknown") {
    return null;
  }

  return {
    id: candidate.id,
    status: "observed",
    primaryType: candidate.primaryType,
    comparisonType: candidate.comparisonType,
    direction: primaryDirection === comparisonDirection ? "together" : "opposite",
    overlappingDays: pairs.length,
    confidence: pairs.length >= 4 || (Math.abs(primaryDelta) >= 2 && Math.abs(comparisonDelta) >= 2) ? "medium" : "low",
  };
}

function pairedDailyScores(logs: LogEntry[], primaryType: QuickLogType, comparisonType: QuickLogType) {
  const daily = new Map<string, Partial<Record<QuickLogType, number>>>();

  for (const log of logs) {
    if (log.type !== primaryType && log.type !== comparisonType) {
      continue;
    }

    if (typeof log.value !== "number") {
      continue;
    }

    const day = log.occurredAt.slice(0, 10);
    const current = daily.get(day) ?? {};
    current[log.type] = log.value;
    daily.set(day, current);
  }

  return [...daily.entries()]
    .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
    .flatMap(([, values]) => {
      const primary = values[primaryType];
      const comparison = values[comparisonType];

      return typeof primary === "number" && typeof comparison === "number" ? [{ primary, comparison }] : [];
    });
}

function recentLogsFor(logs: LogEntry[], now: Date) {
  const nowMs = now.getTime();
  return logs.filter((log) => {
    const occurredAt = Date.parse(log.occurredAt);
    return Number.isFinite(occurredAt) && occurredAt <= nowMs && occurredAt >= nowMs - recentWindowDays * msPerDay;
  });
}

function directionForDelta(delta: number) {
  if (delta > 0.5) {
    return "up";
  }

  if (delta < -0.5) {
    return "down";
  }

  return "unknown";
}

function lowDataHint(): TrackingPatternHint {
  return {
    id: "low_data",
    status: "low_data",
    primaryType: null,
    comparisonType: null,
    direction: "unknown",
    overlappingDays: 0,
    confidence: "low",
  };
}
