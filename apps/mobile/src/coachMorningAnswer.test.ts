import { describe, expect, it } from "vitest";
import { buildCoachMorningAnswer } from "./coachMorningAnswer";
import type { MorningRoutineReview } from "./morningRoutineReview";

const review: MorningRoutineReview = {
  toneId: "reset",
  reasonId: "checkin_gap",
  nextStepId: "pair_checkin",
  title: "Morning routine review",
  body: "A short 7-day read of whether the morning loop is staying repeatable.",
  tone: "Tighten the loop",
  pattern: "Pattern: anchor appears before check-in",
  reason: "The wake-and-light anchor shows up more often than the morning check-in, so the loop still breaks early.",
  nextStepTitle: "Morning next step",
  nextStep: "Pair the quick morning log right after the anchor instead of adding a new step.",
  meta: "Full mornings: 1/7 - Partial mornings: 2 - Streak: 1 day",
  stepLines: [],
  fullDays: 1,
  partialDays: 2,
  streak: 1,
};

describe("buildCoachMorningAnswer", () => {
  it("builds a focused morning answer for coach", () => {
    const answer = buildCoachMorningAnswer(review, "en");

    expect(answer.id).toBe("morning");
    expect(answer.title).toBe("What about the morning routine?");
    expect(answer.body).toContain("Tighten the loop");
    expect(answer.nextStep).toContain("Pair the quick morning log");
  });

  it("returns readable Russian copy", () => {
    const answer = buildCoachMorningAnswer(review, "ru");

    expect(answer.title).toBe("Что с утренней рутиной?");
  });
});
