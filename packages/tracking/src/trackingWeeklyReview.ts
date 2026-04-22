import { buildProgramReview } from "@pmhc/programs";
import { hasSymptomRedFlag } from "@pmhc/safety";
import type { LogEntry, ProgramHistoryEntry, QuickLogType } from "@pmhc/types";

export type TrackingWeeklyReviewTone = "baseline_building" | "steady" | "recovery";
export type TrackingWeeklyReviewReason =
  | "low_data"
  | "signals_steadying"
  | "sleep_dip"
  | "symptom_caution"
  | "program_stability"
  | "program_rebuild";
export type TrackingWeeklyReviewNextStep =
  | "log_two_scores"
  | "keep_consistency"
  | "protect_recovery"
  | "repeat_small_loop";

export type TrackingWeeklyReviewSummary = {
  tone: TrackingWeeklyReviewTone;
  reason: TrackingWeeklyReviewReason;
  nextStep: TrackingWeeklyReviewNextStep;
  logsInWeek: number;
  scoreLogsInWeek: number;
  symptomLogsInWeek: number;
  latestProgramId: string | null;
};

const scoreSignalTypes: QuickLogType[] = ["sleep_quality", "energy", "confidence", "libido"];
const recentWindowDays = 7;
const msPerDay = 24 * 60 * 60 * 1000;
type ScoreTrend = "up" | "down" | "flat" | "unknown";

export function buildTrackingWeeklyReview(
  logs: LogEntry[],
  programHistory: ProgramHistoryEntry[],
  now = new Date(),
): TrackingWeeklyReviewSummary {
  const recentLogs = recentLogsFor(logs, now);
  const scoreLogsInWeek = recentLogs.filter(
    (log) => scoreSignalTypes.includes(log.type) && typeof log.value === "number",
  ).length;
  const symptomLogsInWeek = recentLogs.filter((log) => log.type === "symptom_checkin").length;
  const sleep = summarizeScoreSignal(recentLogs, "sleep_quality");
  const energy = summarizeScoreSignal(recentLogs, "energy");
  const confidence = summarizeScoreSignal(recentLogs, "confidence");
  const hasSymptomCaution = recentLogs.some(
    (log) => log.type === "symptom_checkin" && hasSymptomRedFlag(log.value),
  );
  const hasRecoveryDip = isRecoveryDip(sleep.latest, sleep.trend) || isRecoveryDip(energy.latest, energy.trend);
  const hasSteadierSignals =
    confidence.trend === "up" ||
    (scoreLogsInWeek >= 4 && [sleep.latest, energy.latest, confidence.latest].every((value) => value == null || value >= 5));
  const programReview = buildProgramReview(programHistory);
  const latestProgramId = programReview?.latestProgramId ?? null;

  if (hasSymptomCaution) {
    return {
      tone: "recovery",
      reason: "symptom_caution",
      nextStep: "protect_recovery",
      logsInWeek: recentLogs.length,
      scoreLogsInWeek,
      symptomLogsInWeek,
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
      logsInWeek: recentLogs.length,
      scoreLogsInWeek,
      symptomLogsInWeek,
      latestProgramId,
    };
  }

  if (scoreLogsInWeek < 3 && programReview == null) {
    return {
      tone: "baseline_building",
      reason: "low_data",
      nextStep: "log_two_scores",
      logsInWeek: recentLogs.length,
      scoreLogsInWeek,
      symptomLogsInWeek,
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
      logsInWeek: recentLogs.length,
      scoreLogsInWeek,
      symptomLogsInWeek,
      latestProgramId,
    };
  }

  if (hasSteadierSignals) {
    return {
      tone: "steady",
      reason: "signals_steadying",
      nextStep: "keep_consistency",
      logsInWeek: recentLogs.length,
      scoreLogsInWeek,
      symptomLogsInWeek,
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
      logsInWeek: recentLogs.length,
      scoreLogsInWeek,
      symptomLogsInWeek,
      latestProgramId,
    };
  }

  return {
    tone: "baseline_building",
    reason: "signals_steadying",
    nextStep: "repeat_small_loop",
    logsInWeek: recentLogs.length,
    scoreLogsInWeek,
    symptomLogsInWeek,
    latestProgramId,
  };
}

function recentLogsFor(logs: LogEntry[], now: Date) {
  const nowMs = now.getTime();

  return logs.filter((log) => {
    const occurredAt = Date.parse(log.occurredAt);
    return Number.isFinite(occurredAt) && occurredAt <= nowMs && occurredAt >= nowMs - recentWindowDays * msPerDay;
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
