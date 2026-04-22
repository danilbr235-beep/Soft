import { describe, expect, it } from "vitest";
import { getCopy } from "@pmhc/i18n";
import type { ProgramReviewSummary } from "@pmhc/programs";
import type { TrackingPeriodReviewSummary, TrackingReviewDigest, TrackingWeeklyReviewSummary } from "@pmhc/tracking";
import { buildReviewRecap } from "./reviewRecap";

const reviewDigest: TrackingReviewDigest = {
  tone: "recovery",
  reason: "protect_recovery_now",
  confidence: "high",
  nextStep: "protect_recovery",
  weeklyTone: "recovery",
  monthlyTone: "baseline_building",
  latestProgramId: "confidence-reset-14",
};

const weeklyReview: TrackingWeeklyReviewSummary = {
  tone: "recovery",
  reason: "symptom_caution",
  nextStep: "protect_recovery",
  logsInPeriod: 3,
  scoreLogsInPeriod: 2,
  symptomLogsInPeriod: 1,
  cycleCountInPeriod: 1,
  logsInWeek: 3,
  scoreLogsInWeek: 2,
  symptomLogsInWeek: 1,
  latestProgramId: "confidence-reset-14",
};

const monthlyReview: TrackingPeriodReviewSummary = {
  tone: "baseline_building",
  reason: "program_rebuild",
  nextStep: "repeat_small_loop",
  logsInPeriod: 7,
  scoreLogsInPeriod: 5,
  symptomLogsInPeriod: 1,
  cycleCountInPeriod: 1,
  latestProgramId: "clarity-baseline-7",
};

const programReview: ProgramReviewSummary = {
  cycleCount: 2,
  totalCompletedDays: 11,
  totalRestDays: 2,
  totalSkippedDays: 1,
  leadingState: "mixed_finish",
  focus: "rebuild_with_short_cycles",
  latestProgramId: "confidence-reset-14",
  trend: "holding_pattern",
};

describe("buildReviewRecap", () => {
  it("builds an overview recap from the digest", () => {
    const text = buildReviewRecap({
      copy: getCopy("en"),
      format: "snapshot",
      monthlyReview,
      programReview,
      reviewDigest,
      section: "overview",
      weeklyReview,
    });

    expect(text).toContain("Review digest");
    expect(text).toContain("Recovery-first read");
    expect(text).toContain("High confidence");
    expect(text).toContain("Recent cycle context: 14-day confidence reset");
  });

  it("builds a cycle fallback recap when no finished cycles exist", () => {
    const text = buildReviewRecap({
      copy: getCopy("en"),
      format: "snapshot",
      monthlyReview,
      programReview: null,
      reviewDigest,
      section: "cycles",
      weeklyReview,
    });

    expect(text).toContain("Program review");
    expect(text).toContain("No finished cycles yet.");
  });

  it("builds an action-plan recap", () => {
    const text = buildReviewRecap({
      copy: getCopy("en"),
      format: "plan",
      monthlyReview,
      programReview,
      reviewDigest,
      section: "month",
      weeklyReview,
    });

    expect(text).toContain("Focus:");
    expect(text).toContain("Do next:");
    expect(text).toContain("Keep in view:");
  });

  it("builds a coach-note recap", () => {
    const text = buildReviewRecap({
      copy: getCopy("en"),
      format: "coach",
      monthlyReview,
      programReview,
      reviewDigest,
      section: "cycles",
      weeklyReview,
    });

    expect(text).toContain("Program review reads");
    expect(text).toContain("Why:");
    expect(text).toContain("Context:");
  });
});
