import { describe, expect, it } from "vitest";
import { getCopy } from "@pmhc/i18n";
import type { ProgramReviewSummary } from "@pmhc/programs";
import type { TrackingPeriodReviewSummary, TrackingReviewDigest, TrackingWeeklyReviewSummary } from "@pmhc/tracking";
import type { MorningRoutineReview } from "./morningRoutineReview";
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

const morningRoutineReview: MorningRoutineReview = {
  title: "Morning routine review",
  body: "A short 7-day read of whether the morning loop is staying repeatable.",
  tone: "Building consistency",
  reason: "At least one full morning is already in place. Repeat the same short loop before adding more.",
  nextStepTitle: "Morning next step",
  nextStep: "Repeat the same three-step morning tomorrow before changing the routine.",
  meta: "Full mornings: 1/7 - Partial mornings: 2 - Streak: 1 day",
  stepLines: [
    "Anchor: 3/7 mornings",
    "Check-in: 1/7 mornings",
    "Guide: 1/7 mornings",
  ],
  fullDays: 1,
  partialDays: 2,
  streak: 1,
};

describe("buildReviewRecap", () => {
  it("builds an overview recap from the digest", () => {
    const result = buildReviewRecap({
      copy: getCopy("en"),
      format: "snapshot",
      morningRoutineReview,
      monthlyReview,
      programReview,
      reviewDigest,
      section: "overview",
      weeklyReview,
    });

    expect(result.kind).toBe("text");
    const text = result.kind === "text" ? result.text : "";
    expect(text).toContain("Review digest");
    expect(text).toContain("Recovery-first read");
    expect(text).toContain("High confidence");
    expect(text).toContain("Recent cycle context: 14-day confidence reset");
  });

  it("builds a cycle fallback recap when no finished cycles exist", () => {
    const result = buildReviewRecap({
      copy: getCopy("en"),
      format: "snapshot",
      morningRoutineReview,
      monthlyReview,
      programReview: null,
      reviewDigest,
      section: "cycles",
      weeklyReview,
    });

    expect(result.kind).toBe("text");
    const text = result.kind === "text" ? result.text : "";
    expect(text).toContain("Program review");
    expect(text).toContain("No finished cycles yet.");
  });

  it("builds an action-plan recap", () => {
    const result = buildReviewRecap({
      copy: getCopy("en"),
      format: "plan",
      morningRoutineReview,
      monthlyReview,
      programReview,
      reviewDigest,
      section: "month",
      weeklyReview,
    });

    expect(result.kind).toBe("text");
    const text = result.kind === "text" ? result.text : "";
    expect(text).toContain("Focus:");
    expect(text).toContain("Do next:");
    expect(text).toContain("Keep in view:");
  });

  it("builds a coach-note recap", () => {
    const result = buildReviewRecap({
      copy: getCopy("en"),
      format: "coach",
      morningRoutineReview,
      monthlyReview,
      programReview,
      reviewDigest,
      section: "cycles",
      weeklyReview,
    });

    expect(result.kind).toBe("text");
    const text = result.kind === "text" ? result.text : "";
    expect(text).toContain("Program review reads");
    expect(text).toContain("Why:");
    expect(text).toContain("Context:");
  });

  it("builds a structured packet recap", () => {
    const result = buildReviewRecap({
      copy: getCopy("en"),
      format: "packet",
      morningRoutineReview,
      monthlyReview,
      programReview,
      reviewDigest,
      section: "month",
      weeklyReview,
    });

    expect(result.kind).toBe("packet");

    if (result.kind !== "packet") {
      return;
    }

    expect(result.title).toBe("30 days packet");
    expect(result.blocks.map((block) => block.title)).toEqual([
      "Summary",
      "Next step",
      "Signals",
      "History snapshot",
    ]);
    expect(result.blocks[0]?.lines.join(" ")).toContain("30-day review");
    expect(result.blocks[3]?.lines.join(" ")).toContain("Latest 30-day cycle context");
  });

  it("carries morning routine review context into an overview packet", () => {
    const result = buildReviewRecap({
      copy: getCopy("en"),
      format: "packet",
      morningRoutineReview,
      monthlyReview,
      programReview,
      reviewDigest,
      section: "overview",
      weeklyReview,
    });

    expect(result.kind).toBe("packet");

    if (result.kind !== "packet") {
      return;
    }

    expect(result.blocks[2]?.lines.join(" ")).toContain("Full mornings: 1/7");
    expect(result.blocks[3]?.lines.join(" ")).toContain("Morning routine review: Building consistency");
  });
});
