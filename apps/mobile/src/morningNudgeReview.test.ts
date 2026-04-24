import { describe, expect, it, vi } from "vitest";
import { buildMorningNudgeReview } from "./morningNudgeReview";
import type { MorningNudgeHistoryEntry, MorningNudgePlan } from "./morningNudge";
import type { MorningRoutineReview } from "./morningRoutineReview";

const plan: MorningNudgePlan = {
  enabled: true,
  title: "Morning nudge",
  body: "A discreet local reminder plan tied to the current 7-day morning read.",
  stateLabel: "On",
  timingTitle: "Timing",
  timingLabel: "Daily - 09:00",
  styleTitle: "Style",
  styleLabel: "Supportive",
  focusTitle: "Current focus",
  focusLabel: "Repeat full loop",
  previewTitle: "Preview",
  previewBody: "Repeat the same three-step morning once more before changing it.",
};

const repeatReview: MorningRoutineReview = {
  toneId: "building",
  reasonId: "first_full_day",
  nextStepId: "repeat_full_loop",
  title: "Morning routine review",
  body: "A short 7-day read of whether the morning loop is staying repeatable.",
  tone: "Building consistency",
  pattern: "Pattern: first full morning landed",
  reason: "At least one full morning is already in place.",
  nextStepTitle: "Morning next step",
  nextStep: "Repeat the same three-step morning tomorrow before changing the routine.",
  meta: "Full mornings: 1/7 - Partial mornings: 0 - Streak: 1 day",
  stepLines: ["Anchor: 1/7 mornings", "Check-in: 1/7 mornings", "Guide: 1/7 mornings"],
  fullDays: 1,
  partialDays: 0,
  streak: 1,
};

const anchorReview: MorningRoutineReview = {
  ...repeatReview,
  reasonId: "no_signal",
  nextStepId: "protect_anchor",
  pattern: "Pattern: morning loop has barely started",
  reason: "There is still very little morning routine signal.",
  nextStep: "Land the wake-and-light anchor first.",
};

describe("morningNudgeReview", () => {
  it("builds a review with recent change metadata", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-23T12:00:00.000Z"));

    const history: MorningNudgeHistoryEntry[] = [
      {
        id: "nudge-1",
        changedAt: "2026-04-23T09:00:00.000Z",
        enabled: true,
        tone: "supportive",
        timePreset: "late",
        weekdaysOnly: false,
      },
      {
        id: "nudge-2",
        changedAt: "2026-04-10T09:00:00.000Z",
        enabled: true,
        tone: "discreet",
        timePreset: "standard",
        weekdaysOnly: true,
      },
    ];

    const review = buildMorningNudgeReview({
      history,
      language: "en",
      plan,
      routineReview: repeatReview,
    });

    expect(review.title).toBe("Morning nudge review");
    expect(review.pattern).toBe("Pattern: recent changes are still settling");
    expect(review.historyLabel).toContain("Last changed");
    expect(review.historyLabel).toContain("2 adjustments in the last 30 days");
    expect(review.guidanceState).toBe("hold");
    expect(review.guidanceTone).toBe("Hold steady");
    expect(review.guidanceBody).toContain("The reminder changed recently.");

    vi.useRealTimers();
  });

  it("falls back when no nudge changes have been recorded yet", () => {
    const review = buildMorningNudgeReview({
      history: [],
      language: "en",
      plan,
      routineReview: anchorReview,
    });

    expect(review.historyLabel).toBe("No recent morning nudge changes yet.");
    expect(review.guidanceState).toBe("simplify");
    expect(review.pattern).toBe("Pattern: one calmer cue fits best");
    expect(review.guidanceTone).toBe("Keep one calm cue");
    expect(review.guidanceMeta).toBe("No reminder changes in the last 30 days.");
  });
});
