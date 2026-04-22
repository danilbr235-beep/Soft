import type { LanguageCopy } from "@pmhc/i18n";
import type { ProgramReviewSummary } from "@pmhc/programs";
import type { TrackingPeriodReviewSummary, TrackingReviewDigest, TrackingWeeklyReviewSummary } from "@pmhc/tracking";

export type ReviewSection = "overview" | "week" | "month" | "cycles";
export type ReviewRecapFormat = "snapshot" | "plan" | "coach";

type ReviewRecapInput = {
  copy: LanguageCopy;
  format: ReviewRecapFormat;
  monthlyReview: TrackingPeriodReviewSummary;
  programReview: ProgramReviewSummary | null;
  reviewDigest: TrackingReviewDigest;
  section: ReviewSection;
  weeklyReview: TrackingWeeklyReviewSummary;
};

export function buildReviewRecap({
  copy,
  format,
  monthlyReview,
  programReview,
  reviewDigest,
  section,
  weeklyReview,
}: ReviewRecapInput) {
  const parts = buildReviewRecapParts({
    copy,
    monthlyReview,
    programReview,
    reviewDigest,
    section,
    weeklyReview,
  });

  if (format === "plan") {
    return [
      parts.title,
      parts.tone ? copy.review.planFocus(parts.tone) : null,
      copy.review.planReason(parts.reason),
      parts.nextStep ? copy.review.planNext(parts.nextStep) : null,
      parts.meta ? copy.review.planWatch(parts.meta) : null,
      parts.context ? copy.review.planWatch(parts.context) : null,
    ]
      .filter((line): line is string => line != null)
      .join("\n");
  }

  if (format === "coach") {
    return [
      copy.review.coachLead(parts.title, parts.tone),
      copy.review.coachWhy(parts.reason),
      parts.nextStep ? copy.review.coachNext(parts.nextStep) : null,
      parts.context ? copy.review.coachWatch(parts.context) : parts.meta ? copy.review.coachWatch(parts.meta) : null,
    ]
      .filter((line): line is string => line != null)
      .join(" ");
  }

  return [
    parts.title,
    parts.tone,
    parts.reason,
    parts.nextStep,
    parts.meta,
    parts.context,
  ]
    .filter((line): line is string => line != null)
    .join("\n");
}

function buildReviewRecapParts({
  copy,
  monthlyReview,
  programReview,
  reviewDigest,
  section,
  weeklyReview,
}: Omit<ReviewRecapInput, "format">) {
  if (section === "week") {
    return {
      title: copy.track.weeklyReviewTitle,
      tone: copy.track.weeklyReviewTones[weeklyReview.tone],
      reason: copy.track.weeklyReviewReasons[weeklyReview.reason],
      nextStep: copy.track.weeklyReviewNextSteps[weeklyReview.nextStep],
      meta: copy.track.weeklyReviewMeta(
        weeklyReview.logsInWeek,
        weeklyReview.scoreLogsInWeek,
        weeklyReview.symptomLogsInWeek,
      ),
      context: weeklyReview.latestProgramId
        ? copy.track.weeklyReviewLatestProgram(
            copy.programs.programTitles[weeklyReview.latestProgramId] ?? weeklyReview.latestProgramId,
          )
        : null,
    };
  }

  if (section === "month") {
    return {
      title: copy.track.monthlyReviewTitle,
      tone: copy.track.monthlyReviewTones[monthlyReview.tone],
      reason: copy.track.monthlyReviewReasons[monthlyReview.reason],
      nextStep: copy.track.monthlyReviewNextSteps[monthlyReview.nextStep],
      meta: copy.track.monthlyReviewMeta(
        monthlyReview.logsInPeriod,
        monthlyReview.scoreLogsInPeriod,
        monthlyReview.symptomLogsInPeriod,
        monthlyReview.cycleCountInPeriod,
      ),
      context: monthlyReview.latestProgramId
        ? copy.track.monthlyReviewLatestProgram(
            copy.programs.programTitles[monthlyReview.latestProgramId] ?? monthlyReview.latestProgramId,
          )
        : null,
    };
  }

  if (section === "cycles") {
    if (!programReview) {
      return {
        title: copy.track.programReviewTitle,
        tone: null,
        reason: copy.review.noCycles,
        nextStep: null,
        meta: null,
        context: null,
      };
    }

    return {
      title: copy.track.programReviewTitle,
      tone: copy.programs.completionStates[programReview.leadingState],
      reason: copy.programs.reviewFocuses[programReview.focus],
      nextStep: null,
      meta: copy.programs.reviewTotals(
        programReview.cycleCount,
        programReview.totalCompletedDays,
        programReview.totalRestDays,
        programReview.totalSkippedDays,
      ),
      context: [
        copy.programs.reviewTrendLabels[programReview.trend],
        copy.programs.reviewLatest(
        copy.programs.programTitles[programReview.latestProgramId] ?? programReview.latestProgramId,
        ),
      ].join(" "),
    };
  }

  return {
    title: copy.track.reviewDigestTitle,
    tone: copy.track.reviewDigestTones[reviewDigest.tone],
    reason: copy.track.reviewDigestReasons[reviewDigest.reason],
    nextStep: copy.track.reviewDigestNextSteps[reviewDigest.nextStep],
    meta: copy.track.reviewDigestConfidenceLabels[reviewDigest.confidence],
    context: [
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
      .join(" "),
  };
}
