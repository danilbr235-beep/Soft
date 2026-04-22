import type { LogEntry, ProgramHistoryEntry } from "@pmhc/types";
import {
  buildTrackingPeriodReview,
  type TrackingPeriodReviewNextStep,
  type TrackingPeriodReviewReason,
  type TrackingPeriodReviewSummary,
  type TrackingPeriodReviewTone,
} from "./trackingPeriodReview";

export type TrackingWeeklyReviewTone = TrackingPeriodReviewTone;
export type TrackingWeeklyReviewReason = TrackingPeriodReviewReason;
export type TrackingWeeklyReviewNextStep = TrackingPeriodReviewNextStep;
export type TrackingWeeklyReviewSummary = TrackingPeriodReviewSummary & {
  logsInWeek: number;
  scoreLogsInWeek: number;
  symptomLogsInWeek: number;
};

export function buildTrackingWeeklyReview(
  logs: LogEntry[],
  programHistory: ProgramHistoryEntry[],
  now = new Date(),
): TrackingWeeklyReviewSummary {
  const review = buildTrackingPeriodReview(logs, programHistory, 7, now);

  return {
    ...review,
    logsInWeek: review.logsInPeriod,
    scoreLogsInWeek: review.scoreLogsInPeriod,
    symptomLogsInWeek: review.symptomLogsInPeriod,
  };
}
