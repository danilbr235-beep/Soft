import { buildProgramReview } from "@pmhc/programs";
import { hasSymptomRedFlag } from "@pmhc/safety";
import type { LogEntry, ProgramHistoryEntry, QuickLogType } from "@pmhc/types";

export type TrackingPeriodReviewTone = "baseline_building" | "steady" | "recovery";
export type TrackingPeriodReviewReason =
  | "low_data"
  | "signals_steadying"
  | "sleep_dip"
  | "symptom_caution"
  | "program_stability"
  | "program_rebuild";
export type TrackingPeriodReviewNextStep =
  | "log_two_scores"
  | "keep_consistency"
  | "protect_recovery"
  | "repeat_small_loop";

export type TrackingPeriodReviewSummary = {
  tone: TrackingPeriodReviewTone;
  reason: TrackingPeriodReviewReason;
  nextStep: TrackingPeriodReviewNextStep;
  logsInPeriod: number;
  scoreLogsInPeriod: number;
  symptomLogsInPeriod: number;
  cycleCountInPeriod: number;
  latestProgramId: string | null;
};

const scoreSignalTypes: QuickLogType[] = ["sleep_quality", "energy", "confidence", "libido"];
const msPerDay = 24 * 60 * 60 * 1000;
type ScoreTrend = "up" | "down" | "flat" | "unknown";

export function buildTrackingPeriodReview(
  logs: LogEntry[],
  programHistory: ProgramHistoryEntry[],
  windowDays: number,
  now = new Date(),
): TrackingPeriodReviewSummary {
  const recentLogs = recentLogsFor(logs, now, windowDays);
  const recentHistory = recentProgramHistoryFor(programHistory, now, windowDays);
  const scoreLogsInPeriod = recentLogs.filter(
    (log) => scoreSignalTypes.includes(log.type) && typeof log.value === "number",
  ).length;
  const symptomLogsInPeriod = recentLogs.filter((log) => log.type === "symptom_checkin").length;
  const sleep = summarizeScoreSignal(recentLogs, "sleep_quality");
  const energy = summarizeScoreSignal(recentLogs, "energy");
  const confidence = summarizeScoreSignal(recentLogs, "confidence");
  const hasSymptomCaution = recentLogs.some(
    (log) => log.type === "symptom_checkin" && hasSymptomRedFlag(log.value),
  );
  const hasRecoveryDip = isRecoveryDip(sleep.latest, sleep.trend) || isRecoveryDip(energy.latest, energy.trend);
  const hasSteadierSignals =
    confidence.trend === "up" ||
    (scoreLogsInPeriod >= minimumScoreLogs(windowDays) + 1 &&
      [sleep.latest, energy.latest, confidence.latest].every((value) => value == null || value >= 5));
  const programReview = buildProgramReview(recentHistory);
  const latestProgramId = recentHistory[0]?.programId ?? null;

  if (hasSymptomCaution) {
    return {
      tone: "recovery",
      reason: "symptom_caution",
      nextStep: "protect_recovery",
      logsInPeriod: recentLogs.length,
      scoreLogsInPeriod,
      symptomLogsInPeriod,
      cycleCountInPeriod: recentHistory.length,
      latestProgramId,
    };
  }

  if (
    hasRecoveryDip ||
    programReview?.leadingState === "recovery_finish" ||
    programReview?.trend === "toward_recovery"
  ) {
    return {
      tone: "recovery",
      reason: hasRecoveryDip ? "sleep_dip" : "program_rebuild",
      nextStep: "protect_recovery",
      logsInPeriod: recentLogs.length,
      scoreLogsInPeriod,
      symptomLogsInPeriod,
      cycleCountInPeriod: recentHistory.length,
      latestProgramId,
    };
  }

  if (scoreLogsInPeriod < minimumScoreLogs(windowDays) && recentHistory.length === 0) {
    return {
      tone: "baseline_building",
      reason: "low_data",
      nextStep: "log_two_scores",
      logsInPeriod: recentLogs.length,
      scoreLogsInPeriod,
      symptomLogsInPeriod,
      cycleCountInPeriod: recentHistory.length,
      latestProgramId,
    };
  }

  if (
    programReview?.leadingState === "steady_finish" ||
    programReview?.trend === "toward_stability"
  ) {
    return {
      tone: "steady",
      reason: "program_stability",
      nextStep: "keep_consistency",
      logsInPeriod: recentLogs.length,
      scoreLogsInPeriod,
      symptomLogsInPeriod,
      cycleCountInPeriod: recentHistory.length,
      latestProgramId,
    };
  }

  if (hasSteadierSignals) {
    return {
      tone: "steady",
      reason: "signals_steadying",
      nextStep: "keep_consistency",
      logsInPeriod: recentLogs.length,
      scoreLogsInPeriod,
      symptomLogsInPeriod,
      cycleCountInPeriod: recentHistory.length,
      latestProgramId,
    };
  }

  if (
    programReview?.leadingState === "mixed_finish" ||
    programReview?.trend === "holding_pattern"
  ) {
    return {
      tone: "baseline_building",
      reason: "program_rebuild",
      nextStep: "repeat_small_loop",
      logsInPeriod: recentLogs.length,
      scoreLogsInPeriod,
      symptomLogsInPeriod,
      cycleCountInPeriod: recentHistory.length,
      latestProgramId,
    };
  }

  return {
    tone: "baseline_building",
    reason: "signals_steadying",
    nextStep: "repeat_small_loop",
    logsInPeriod: recentLogs.length,
    scoreLogsInPeriod,
    symptomLogsInPeriod,
    cycleCountInPeriod: recentHistory.length,
    latestProgramId,
  };
}

function minimumScoreLogs(windowDays: number) {
  return windowDays <= 7 ? 3 : 6;
}

function recentLogsFor(logs: LogEntry[], now: Date, windowDays: number) {
  const nowMs = now.getTime();

  return logs.filter((log) => {
    const occurredAt = Date.parse(log.occurredAt);
    return Number.isFinite(occurredAt) && occurredAt <= nowMs && occurredAt >= nowMs - windowDays * msPerDay;
  });
}

function recentProgramHistoryFor(history: ProgramHistoryEntry[], now: Date, windowDays: number) {
  const nowMs = now.getTime();

  return history.filter((entry) => {
    const completedAt = Date.parse(entry.completedAt);
    return Number.isFinite(completedAt) && completedAt <= nowMs && completedAt >= nowMs - windowDays * msPerDay;
  });
}

function summarizeScoreSignal(logs: LogEntry[], type: QuickLogType) {
  const values = logs
    .filter((log) => log.type === type && typeof log.value === "number")
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .map((log) => Number(log.value));

  const latest = values[0] ?? null;
  const previous = values[1] ?? null;

  return {
    latest,
    trend: trendFor(latest, previous),
  };
}

function trendFor(latest: number | null, previous: number | null): ScoreTrend {
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

function isRecoveryDip(latest: number | null, trend: ScoreTrend) {
  return latest != null && (latest <= 4 || (latest <= 5 && trend === "down"));
}
