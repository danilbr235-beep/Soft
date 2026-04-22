import type { LanguageCopy } from "@pmhc/i18n";
import type { ProgramReviewSummary } from "@pmhc/programs";
import type { TrackingPeriodReviewSummary, TrackingReviewDigest, TrackingWeeklyReviewSummary } from "@pmhc/tracking";

export type ReviewSection = "overview" | "week" | "month" | "cycles";

type ReviewRecapInput = {
  copy: LanguageCopy;
  monthlyReview: TrackingPeriodReviewSummary;
  programReview: ProgramReviewSummary | null;
  reviewDigest: TrackingReviewDigest;
  section: ReviewSection;
  weeklyReview: TrackingWeeklyReviewSummary;
};

export function buildReviewRecap({
  copy,
  monthlyReview,
  programReview,
  reviewDigest,
  section,
  weeklyReview,
}: ReviewRecapInput) {
  if (section === "week") {
    return [
      copy.track.weeklyReviewTitle,
      copy.track.weeklyReviewTones[weeklyReview.tone],
      copy.track.weeklyReviewReasons[weeklyReview.reason],
      copy.track.weeklyReviewNextSteps[weeklyReview.nextStep],
      copy.track.weeklyReviewMeta(
        weeklyReview.logsInWeek,
        weeklyReview.scoreLogsInWeek,
        weeklyReview.symptomLogsInWeek,
      ),
      weeklyReview.latestProgramId
        ? copy.track.weeklyReviewLatestProgram(
            copy.programs.programTitles[weeklyReview.latestProgramId] ?? weeklyReview.latestProgramId,
          )
        : null,
    ]
      .filter((line): line is string => line != null)
      .join("\n");
  }

  if (section === "month") {
    return [
      copy.track.monthlyReviewTitle,
      copy.track.monthlyReviewTones[monthlyReview.tone],
      copy.track.monthlyReviewReasons[monthlyReview.reason],
      copy.track.monthlyReviewNextSteps[monthlyReview.nextStep],
      copy.track.monthlyReviewMeta(
        monthlyReview.logsInPeriod,
        monthlyReview.scoreLogsInPeriod,
        monthlyReview.symptomLogsInPeriod,
        monthlyReview.cycleCountInPeriod,
      ),
      monthlyReview.latestProgramId
        ? copy.track.monthlyReviewLatestProgram(
            copy.programs.programTitles[monthlyReview.latestProgramId] ?? monthlyReview.latestProgramId,
          )
        : null,
    ]
      .filter((line): line is string => line != null)
      .join("\n");
  }

  if (section === "cycles") {
    if (!programReview) {
      return [copy.track.programReviewTitle, copy.review.noCycles].join("\n");
    }

    return [
      copy.track.programReviewTitle,
      copy.programs.completionStates[programReview.leadingState],
      copy.programs.reviewFocuses[programReview.focus],
      copy.programs.reviewTrendLabels[programReview.trend],
      copy.programs.reviewTotals(
        programReview.cycleCount,
        programReview.totalCompletedDays,
        programReview.totalRestDays,
        programReview.totalSkippedDays,
      ),
      copy.programs.reviewLatest(
        copy.programs.programTitles[programReview.latestProgramId] ?? programReview.latestProgramId,
      ),
    ].join("\n");
  }

  return [
    copy.track.reviewDigestTitle,
    copy.track.reviewDigestTones[reviewDigest.tone],
    copy.track.reviewDigestReasons[reviewDigest.reason],
    copy.track.reviewDigestConfidenceLabels[reviewDigest.confidence],
    copy.track.reviewDigestNextSteps[reviewDigest.nextStep],
    copy.track.reviewDigestWindows(
      copy.track.weeklyReviewTones[reviewDigest.weeklyTone],
      copy.track.monthlyReviewTones[reviewDigest.monthlyTone],
    ),
    reviewDigest.latestProgramId
      ? copy.track.reviewDigestLatestProgram(
          copy.programs.programTitles[reviewDigest.latestProgramId] ?? reviewDigest.latestProgramId,
        )
      : null,
  ]
    .filter((line): line is string => line != null)
    .join("\n");
}
