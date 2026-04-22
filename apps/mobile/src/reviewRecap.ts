import type { LanguageCopy } from "@pmhc/i18n";
import type { ProgramReviewSummary } from "@pmhc/programs";
import type { TrackingPeriodReviewSummary, TrackingReviewDigest, TrackingWeeklyReviewSummary } from "@pmhc/tracking";

export type ReviewSection = "overview" | "week" | "month" | "cycles";
export type ReviewRecapFormat = "snapshot" | "plan" | "coach" | "packet";
export type ReviewPacketBlockId = "summary" | "next" | "signals" | "history";

export type ReviewPacketBlock = {
  id: ReviewPacketBlockId;
  title: string;
  lines: string[];
};

export type ReviewRecapResult =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "packet";
      title: string;
      blocks: ReviewPacketBlock[];
    };

type ReviewRecapInput = {
  copy: LanguageCopy;
  format: ReviewRecapFormat;
  monthlyReview: TrackingPeriodReviewSummary;
  programReview: ProgramReviewSummary | null;
  reviewDigest: TrackingReviewDigest;
  section: ReviewSection;
  weeklyReview: TrackingWeeklyReviewSummary;
};

type ReviewRecapParts = {
  title: string;
  tone: string | null;
  reason: string;
  nextStep: string | null;
  meta: string | null;
  context: string | null;
};

export function buildReviewRecap({
  copy,
  format,
  monthlyReview,
  programReview,
  reviewDigest,
  section,
  weeklyReview,
}: ReviewRecapInput): ReviewRecapResult {
  const parts = buildReviewRecapParts({
    copy,
    monthlyReview,
    programReview,
    reviewDigest,
    section,
    weeklyReview,
  });

  if (format === "packet") {
    return {
      kind: "packet",
      title: copy.review.packetTitle(copy.review.filterLabels[section]),
      blocks: buildReviewPacketBlocks(parts, copy),
    };
  }

  if (format === "plan") {
    return {
      kind: "text",
      text: compactLines([
        parts.title,
        parts.tone ? copy.review.planFocus(parts.tone) : null,
        copy.review.planReason(parts.reason),
        parts.nextStep ? copy.review.planNext(parts.nextStep) : null,
        parts.meta ? copy.review.planWatch(parts.meta) : null,
        parts.context ? copy.review.planWatch(parts.context) : null,
      ]).join("\n"),
    };
  }

  if (format === "coach") {
    return {
      kind: "text",
      text: compactLines([
        copy.review.coachLead(parts.title, parts.tone),
        copy.review.coachWhy(parts.reason),
        parts.nextStep ? copy.review.coachNext(parts.nextStep) : null,
        parts.context ? copy.review.coachWatch(parts.context) : parts.meta ? copy.review.coachWatch(parts.meta) : null,
      ]).join(" "),
    };
  }

  return {
    kind: "text",
    text: compactLines([
      parts.title,
      parts.tone,
      parts.reason,
      parts.nextStep,
      parts.meta,
      parts.context,
    ]).join("\n"),
  };
}

function buildReviewRecapParts({
  copy,
  monthlyReview,
  programReview,
  reviewDigest,
  section,
  weeklyReview,
}: Omit<ReviewRecapInput, "format">): ReviewRecapParts {
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
        ? [copy.track.weeklyReviewLatestProgram(
            copy.programs.programTitles[weeklyReview.latestProgramId] ?? weeklyReview.latestProgramId,
          )].join("\n")
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
        ? [copy.track.monthlyReviewLatestProgram(
            copy.programs.programTitles[monthlyReview.latestProgramId] ?? monthlyReview.latestProgramId,
          )].join("\n")
        : null,
    };
  }

  if (section === "cycles") {
    if (!programReview) {
      return {
        title: copy.track.programReviewTitle,
        tone: null,
        reason: copy.review.noCycles,
        nextStep: copy.track.reviewDigestNextSteps[reviewDigest.nextStep],
        meta: null,
        context: null,
      };
    }

    return {
      title: copy.track.programReviewTitle,
      tone: copy.programs.completionStates[programReview.leadingState],
      reason: copy.programs.reviewFocuses[programReview.focus],
      nextStep: copy.track.reviewDigestNextSteps[reviewDigest.nextStep],
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
      ].join("\n"),
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
      .join("\n"),
  };
}

function buildReviewPacketBlocks(parts: ReviewRecapParts, copy: LanguageCopy): ReviewPacketBlock[] {
  return [
    {
      id: "summary",
      title: copy.review.packetBlockTitles.summary,
      lines: compactLines([parts.title, parts.tone, parts.reason]),
    },
    {
      id: "next",
      title: copy.review.packetBlockTitles.next,
      lines: splitPreviewLines(parts.nextStep, copy.review.packetNoNext),
    },
    {
      id: "signals",
      title: copy.review.packetBlockTitles.signals,
      lines: splitPreviewLines(parts.meta, copy.review.packetNoSignals),
    },
    {
      id: "history",
      title: copy.review.packetBlockTitles.history,
      lines: splitPreviewLines(parts.context, copy.review.packetNoHistory),
    },
  ];
}

function compactLines(lines: Array<string | null>) {
  return lines.filter((line): line is string => line != null && line.length > 0);
}

function splitPreviewLines(value: string | null, fallback: string) {
  if (!value) {
    return [fallback];
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
