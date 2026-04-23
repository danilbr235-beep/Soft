import { describe, expect, it } from "vitest";
import { buildDaySimplificationReview } from "./daySimplificationReview";

describe("buildDaySimplificationReview", () => {
  it("builds a steady read when no lighter days were kept recently", () => {
    const review = buildDaySimplificationReview({
      date: "2026-04-23",
      language: "en",
      store: {},
    });

    expect(review.toneId).toBe("full");
    expect(review.reasonId).toBe("none_recent");
    expect(review.nextStepId).toBe("keep_optional");
    expect(review.meta).toBe("Lighter days: 0/7 - Current streak: 0 days");
    expect(review.todayLine).toBe("Not active today.");
    expect(review.sourceLine).toBeNull();
  });

  it("treats a single lighter day from programs as targeted support", () => {
    const review = buildDaySimplificationReview({
      date: "2026-04-23",
      language: "en",
      store: {
        "2026-04-23": {
          appliedAt: "2026-04-23T09:00:00.000Z",
          source: "programs",
        },
      },
    });

    expect(review.toneId).toBe("targeted");
    expect(review.reasonId).toBe("single_day");
    expect(review.nextStepId).toBe("return_when_quiet");
    expect(review.todayLine).toBe("Active today from Programs.");
    expect(review.sourceLine).toBe("Today: 0 - Programs: 1");
  });

  it("marks repeated lighter days as a stronger weekly pattern", () => {
    const review = buildDaySimplificationReview({
      date: "2026-04-23",
      language: "en",
      store: {
        "2026-04-20": {
          appliedAt: "2026-04-20T09:00:00.000Z",
          source: "today",
        },
        "2026-04-21": {
          appliedAt: "2026-04-21T09:00:00.000Z",
          source: "programs",
        },
        "2026-04-22": {
          appliedAt: "2026-04-22T09:00:00.000Z",
          source: "programs",
        },
        "2026-04-23": {
          appliedAt: "2026-04-23T09:00:00.000Z",
          source: "today",
        },
      },
    });

    expect(review.toneId).toBe("protective");
    expect(review.reasonId).toBe("active_streak");
    expect(review.streak).toBe(4);
    expect(review.sourceCounts).toEqual({
      today: 2,
      programs: 2,
    });
    expect(review.nextStep).toContain("Keep the next day or two small");
  });
});
