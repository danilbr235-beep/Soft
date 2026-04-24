import { describe, expect, it } from "vitest";
import { buildMorningRoutineReview } from "./morningRoutineReview";

describe("buildMorningRoutineReview", () => {
  it("builds a steady read when the full loop holds across the week", () => {
    const review = buildMorningRoutineReview({
      date: "2026-04-22",
      language: "en",
      progressStore: {
        "2026-04-19": {
          completedStepIds: ["anchor", "checkin", "guide"],
          updatedAt: "2026-04-19T07:00:00.000Z",
        },
        "2026-04-20": {
          completedStepIds: ["anchor", "checkin", "guide"],
          updatedAt: "2026-04-20T07:00:00.000Z",
        },
        "2026-04-21": {
          completedStepIds: ["anchor", "checkin", "guide"],
          updatedAt: "2026-04-21T07:00:00.000Z",
        },
        "2026-04-22": {
          completedStepIds: ["anchor", "checkin", "guide"],
          updatedAt: "2026-04-22T07:00:00.000Z",
        },
      },
    });

    expect(review.toneId).toBe("steady");
    expect(review.nextStepId).toBe("keep_same_loop");
    expect(review.tone).toBe("Routine is holding");
    expect(review.pattern).toBe("Pattern: repeatable full mornings");
    expect(review.reason).toContain("landing often enough");
    expect(review.meta).toContain("Full mornings: 4/7");
    expect(review.stepLines).toEqual([
      "Anchor: 4/7 mornings",
      "Check-in: 4/7 mornings",
      "Guide: 4/7 mornings",
    ]);
  });

  it("points to the check-in gap when the anchor appears without full mornings", () => {
    const review = buildMorningRoutineReview({
      date: "2026-04-22",
      language: "en",
      progressStore: {
        "2026-04-20": {
          completedStepIds: ["anchor"],
          updatedAt: "2026-04-20T07:00:00.000Z",
        },
        "2026-04-21": {
          completedStepIds: ["anchor", "guide"],
          updatedAt: "2026-04-21T07:00:00.000Z",
        },
      },
    });

    expect(review.reasonId).toBe("checkin_gap");
    expect(review.nextStepId).toBe("pair_checkin");
    expect(review.tone).toBe("Tighten the loop");
    expect(review.pattern).toBe("Pattern: anchor appears before check-in");
    expect(review.reason).toContain("wake-and-light anchor");
    expect(review.nextStep).toContain("Pair the quick morning log");
    expect(review.stepLines[0]).toBe("Anchor: 2/7 mornings");
    expect(review.stepLines[1]).toBe("Check-in: 0/7 mornings");
  });
});
