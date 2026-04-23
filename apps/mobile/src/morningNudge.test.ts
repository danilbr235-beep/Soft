import { describe, expect, it } from "vitest";
import {
  appendMorningNudgeHistory,
  buildMorningNudgePlan,
  createMorningNudgeHistoryEntry,
  defaultMorningNudgePreferences,
  isMorningNudgePreferences,
} from "./morningNudge";
import type { MorningRoutineReview } from "./morningRoutineReview";

const review: MorningRoutineReview = {
  toneId: "building",
  reasonId: "checkin_gap",
  nextStepId: "pair_checkin",
  title: "Morning routine review",
  body: "A short 7-day read of whether the morning loop is staying repeatable.",
  tone: "Building consistency",
  reason: "The loop still breaks early.",
  nextStepTitle: "Morning next step",
  nextStep: "Pair the quick morning log right after the anchor instead of adding a new step.",
  meta: "Full mornings: 0/7 - Partial mornings: 2 - Streak: 0 days",
  stepLines: ["Anchor: 2/7 mornings", "Check-in: 0/7 mornings", "Guide: 0/7 mornings"],
  fullDays: 0,
  partialDays: 2,
  streak: 0,
};

describe("morningNudge", () => {
  it("builds a discreet weekday plan from the current morning review", () => {
    const plan = buildMorningNudgePlan({
      language: "en",
      preferences: defaultMorningNudgePreferences,
      progressEntry: {
        completedStepIds: ["anchor"],
        updatedAt: "2026-04-23T07:00:00.000Z",
      },
      review,
    });

    expect(plan.enabled).toBe(true);
    expect(plan.timingLabel).toBe("Weekdays - 08:00");
    expect(plan.styleLabel).toBe("Discreet");
    expect(plan.previewBody).toBe("Light first, then one quick check-in.");
  });

  it("switches preview copy when the loop is already done today", () => {
    const plan = buildMorningNudgePlan({
      language: "en",
      preferences: {
        ...defaultMorningNudgePreferences,
        tone: "supportive",
      },
      progressEntry: {
        completedStepIds: ["anchor", "checkin", "guide"],
        updatedAt: "2026-04-23T07:00:00.000Z",
      },
      review,
    });

    expect(plan.previewBody).toBe("Today already landed. Keep the same short morning again tomorrow.");
  });

  it("accepts only supported preference shapes", () => {
    expect(isMorningNudgePreferences(defaultMorningNudgePreferences)).toBe(true);
    expect(
      isMorningNudgePreferences({
        enabled: true,
        tone: "quiet",
        timePreset: "standard",
        weekdaysOnly: true,
      }),
    ).toBe(false);
  });

  it("deduplicates identical consecutive history entries", () => {
    const entry = createMorningNudgeHistoryEntry({
      changedAt: "2026-04-23T07:00:00.000Z",
      preferences: defaultMorningNudgePreferences,
    });

    const history = appendMorningNudgeHistory([entry], {
      ...entry,
      id: "newer",
      changedAt: "2026-04-23T08:00:00.000Z",
    });

    expect(history).toHaveLength(1);
  });
});
