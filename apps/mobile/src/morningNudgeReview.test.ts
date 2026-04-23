import { describe, expect, it, vi } from "vitest";
import { buildMorningNudgeReview } from "./morningNudgeReview";
import type { MorningNudgeHistoryEntry, MorningNudgePlan } from "./morningNudge";

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
    });

    expect(review.title).toBe("Morning nudge review");
    expect(review.historyLabel).toContain("Last changed");
    expect(review.historyLabel).toContain("2 adjustments in the last 30 days");

    vi.useRealTimers();
  });

  it("falls back when no nudge changes have been recorded yet", () => {
    const review = buildMorningNudgeReview({
      history: [],
      language: "en",
      plan,
    });

    expect(review.historyLabel).toBe("No recent morning nudge changes yet.");
  });
});
