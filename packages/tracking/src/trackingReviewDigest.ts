import { buildProgramReview } from "@pmhc/programs";
import type { LogEntry, ProgramHistoryEntry } from "@pmhc/types";
import { buildTrackingPeriodReview, type TrackingPeriodReviewNextStep, type TrackingPeriodReviewTone } from "./trackingPeriodReview";
import { buildTrackingWeeklyReview } from "./trackingWeeklyReview";

export type TrackingReviewDigestReason =
  | "collect_more_signal"
  | "protect_recovery_now"
  | "stability_is_holding"
  | "short_rebuild_still_fits"
  | "recent_signals_mixed";
export type TrackingReviewDigestConfidence = "low" | "medium" | "high";

export type TrackingReviewDigest = {
  tone: TrackingPeriodReviewTone;
  reason: TrackingReviewDigestReason;
  confidence: TrackingReviewDigestConfidence;
  nextStep: TrackingPeriodReviewNextStep;
  weeklyTone: TrackingPeriodReviewTone;
  monthlyTone: TrackingPeriodReviewTone;
  latestProgramId: string | null;
};

export function buildTrackingReviewDigest(
  logs: LogEntry[],
  programHistory: ProgramHistoryEntry[],
  now = new Date(),
): TrackingReviewDigest {
  const weeklyReview = buildTrackingWeeklyReview(logs, programHistory, now);
  const monthlyReview = buildTrackingPeriodReview(logs, programHistory, 30, now);
  const programReview = buildProgramReview(programHistory);
  const latestProgramId =
    programReview?.latestProgramId ?? monthlyReview.latestProgramId ?? weeklyReview.latestProgramId ?? null;

  if (
    weeklyReview.reason === "symptom_caution" ||
    monthlyReview.reason === "symptom_caution" ||
    (weeklyReview.tone === "recovery" && monthlyReview.tone === "recovery")
  ) {
    return {
      tone: "recovery",
      reason: "protect_recovery_now",
      confidence: "high",
      nextStep: "protect_recovery",
      weeklyTone: weeklyReview.tone,
      monthlyTone: monthlyReview.tone,
      latestProgramId,
    };
  }

  if (
    weeklyReview.tone === "recovery" ||
    monthlyReview.tone === "recovery" ||
    programReview?.focus === "protect_recovery"
  ) {
    return {
      tone: "recovery",
      reason: "protect_recovery_now",
      confidence: "medium",
      nextStep: "protect_recovery",
      weeklyTone: weeklyReview.tone,
      monthlyTone: monthlyReview.tone,
      latestProgramId,
    };
  }

  if (
    weeklyReview.reason === "low_data" &&
    monthlyReview.reason === "low_data" &&
    programReview == null
  ) {
    return {
      tone: "baseline_building",
      reason: "collect_more_signal",
      confidence: "low",
      nextStep: "log_two_scores",
      weeklyTone: weeklyReview.tone,
      monthlyTone: monthlyReview.tone,
      latestProgramId,
    };
  }

  if (
    weeklyReview.tone === "steady" &&
    monthlyReview.tone === "steady" &&
    (programReview == null || programReview.focus === "build_on_stability")
  ) {
    return {
      tone: "steady",
      reason: "stability_is_holding",
      confidence: "high",
      nextStep: "keep_consistency",
      weeklyTone: weeklyReview.tone,
      monthlyTone: monthlyReview.tone,
      latestProgramId,
    };
  }

  if (
    programReview?.focus === "build_on_stability" ||
    weeklyReview.tone === "steady"
  ) {
    return {
      tone: "steady",
      reason: "stability_is_holding",
      confidence: "medium",
      nextStep: "keep_consistency",
      weeklyTone: weeklyReview.tone,
      monthlyTone: monthlyReview.tone,
      latestProgramId,
    };
  }

  if (
    programReview?.focus === "rebuild_with_short_cycles" ||
    monthlyReview.reason === "program_rebuild" ||
    (weeklyReview.tone === "baseline_building" && monthlyReview.tone === "baseline_building")
  ) {
    return {
      tone: "baseline_building",
      reason: "short_rebuild_still_fits",
      confidence: "medium",
      nextStep: "repeat_small_loop",
      weeklyTone: weeklyReview.tone,
      monthlyTone: monthlyReview.tone,
      latestProgramId,
    };
  }

  return {
    tone: "baseline_building",
    reason: "recent_signals_mixed",
    confidence: "medium",
    nextStep: weeklyReview.nextStep,
    weeklyTone: weeklyReview.tone,
    monthlyTone: monthlyReview.tone,
    latestProgramId,
  };
}
