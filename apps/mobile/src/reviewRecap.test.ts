import { describe, expect, it } from "vitest";
import { getCopy } from "@pmhc/i18n";
import type { ProgramReviewSummary } from "@pmhc/programs";
import type { TrackingPeriodReviewSummary, TrackingReviewDigest, TrackingWeeklyReviewSummary } from "@pmhc/tracking";
import type { DaySimplificationReview } from "./daySimplificationReview";
import type { MorningNudgeReview } from "./morningNudgeReview";
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
  toneId: "building",
  reasonId: "first_full_day",
  nextStepId: "repeat_full_loop",
  title: "Morning routine review",
  body: "A short 7-day read of whether the morning loop is staying repeatable.",
  tone: "Building consistency",
  pattern: "Pattern: first full morning landed",
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

const morningNudgeReview: MorningNudgeReview = {
  title: "Morning nudge review",
  body: "A short read of the current local reminder setup for the morning loop.",
  pattern: "Pattern: recent changes are still settling",
  stateTitle: "State",
  stateLabel: "On",
  timingTitle: "Timing",
  timingLabel: "Daily - 09:00",
  styleTitle: "Style",
  styleLabel: "Supportive",
  focusTitle: "Current focus",
  focusLabel: "Repeat full loop",
  previewTitle: "Preview",
  previewBody: "Repeat the same three-step morning once more before changing it.",
  historyTitle: "Recent changes",
  historyLabel: "Last changed Apr 23, 09:00 - 2 adjustments in the last 30 days",
  guidanceState: "hold",
  guidanceTitle: "Today nudge check",
  guidanceTone: "Hold steady",
  guidanceBody: "The reminder changed recently. Leave timing and tone alone for a few mornings so the loop can settle.",
  guidanceMeta: "2 adjustments in the last 30 days",
};

const daySimplificationReview: DaySimplificationReview = {
  title: "Lighter day review",
  body: "A short 7-day read of how often the app kept the day in the lighter preset.",
  toneId: "targeted",
  reasonId: "mixed_sources",
  nextStepId: "watch_repeat",
  tone: "Used as support",
  pattern: "Pattern: multi-source compression",
  reason: "The lighter preset came from both Today and Programs, which usually means the scope needed trimming from more than one angle.",
  nextStepTitle: "Lighter-day next step",
  nextStep: "Watch whether the same compression shows up again before adding more ambition.",
  meta: "Lighter days: 2/7 - Current streak: 1 day",
  todayLine: "Active today from Today.",
  sourceLine: "Today: 1 - Programs: 1",
  activeDays: 2,
  streak: 1,
  todayActive: true,
  sourceCounts: {
    today: 1,
    programs: 1,
  },
};

describe("buildReviewRecap", () => {
  it("builds an overview recap from the digest", () => {
    const result = buildReviewRecap({
      copy: getCopy("en"),
      daySimplificationReview,
      format: "snapshot",
      morningNudgeReview,
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
      daySimplificationReview,
      format: "snapshot",
      morningNudgeReview,
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
      daySimplificationReview,
      format: "plan",
      morningNudgeReview,
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
      daySimplificationReview,
      format: "coach",
      morningNudgeReview,
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
      daySimplificationReview,
      format: "packet",
      morningNudgeReview,
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
      "Morning routine",
      "Lighter day review",
      "Morning nudge",
      "History snapshot",
    ]);
    expect(result.blocks[0]?.lines.join(" ")).toContain("30-day review");
    expect(result.blocks[3]?.lines.join(" ")).toContain("Pattern: first full morning landed");
    expect(result.blocks[3]?.lines.join(" ")).toContain("Morning next step:");
    expect(result.blocks[4]?.lines.join(" ")).toContain("Pattern: multi-source compression");
    expect(result.blocks[4]?.lines.join(" ")).toContain("Today: 1 - Programs: 1");
    expect(result.blocks[5]?.lines.join(" ")).toContain("Pattern: recent changes are still settling");
    expect(result.blocks[5]?.lines.join(" ")).toContain("Today nudge check: Hold steady");
    expect(result.blocks[5]?.lines.join(" ")).toContain("Daily - 09:00");
    expect(result.blocks[6]?.lines.join(" ")).toContain("Latest 30-day cycle context");
  });

  it("carries morning routine review context into an overview packet", () => {
    const result = buildReviewRecap({
      copy: getCopy("en"),
      daySimplificationReview,
      format: "packet",
      morningNudgeReview,
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

    expect(result.blocks[2]?.lines.join(" ")).not.toContain("Full mornings: 1/7");
    expect(result.blocks[3]?.lines.join(" ")).toContain("Full mornings: 1/7");
    expect(result.blocks[3]?.lines.join(" ")).toContain("Pattern: first full morning landed");
    expect(result.blocks[4]?.lines.join(" ")).toContain("Pattern: multi-source compression");
    expect(result.blocks[4]?.lines.join(" ")).toContain("Used as support");
    expect(result.blocks[5]?.lines.join(" ")).toContain("Pattern: recent changes are still settling");
    expect(result.blocks[5]?.lines.join(" ")).toContain("Today nudge check: Hold steady");
    expect(result.blocks[6]?.lines.join(" ")).not.toContain("Morning routine review: Building consistency");
  });

  it("can omit the dedicated morning block from a packet", () => {
    const result = buildReviewRecap({
      copy: getCopy("en"),
      daySimplificationReview,
      format: "packet",
      morningNudgeReview,
      morningRoutineReview,
      monthlyReview,
      packetOptions: {
        includeMorningRoutine: false,
      },
      programReview,
      reviewDigest,
      section: "overview",
      weeklyReview,
    });

    expect(result.kind).toBe("packet");

    if (result.kind !== "packet") {
      return;
    }

    expect(result.blocks.map((block) => block.title)).toEqual([
      "Summary",
      "Next step",
      "Signals",
      "Lighter day review",
      "Morning nudge",
      "History snapshot",
    ]);
  });
});
