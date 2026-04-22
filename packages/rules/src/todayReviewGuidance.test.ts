import { describe, expect, it } from "vitest";
import type { TodayPayload } from "@pmhc/types";
import { applyReviewDigestToToday } from "./todayReviewGuidance";

const baseToday = {
  date: "2026-04-22",
  todayMode: "Light",
  syncStatus: "synced",
  activeProgram: null,
  currentPriority: {
    domain: "baseline",
    title: "Build your baseline",
    whyItMatters: "There is not enough stable data yet for strong recommendations.",
    recommendedAction: "Log three quick signals today: morning, libido, and confidence.",
    confidence: "low",
  },
  dailyState: [],
  alerts: [],
  actionCards: [
    { id: "practice", kind: "Practice", title: "Short practice", description: "A contained action that supports the current priority.", cta: "Start" },
    { id: "check-in", kind: "Check-in", title: "One-minute check-in", description: "Capture the signal without turning the day into a dashboard.", cta: "Log" },
    { id: "learn", kind: "Learn", title: "Relevant explainer", description: "Read the short context behind today's recommendation.", cta: "Read" },
    { id: "reflect", kind: "Reflect", title: "Evening note", description: "Record what changed, what helped, and what to keep light.", cta: "Reflect" },
  ],
  quickLogs: [],
  liveUpdates: [],
  insights: [],
} satisfies TodayPayload;

describe("applyReviewDigestToToday", () => {
  it("turns a low-data day into a smaller baseline-first plan", () => {
    const guided = applyReviewDigestToToday(baseToday, {
      tone: "baseline_building",
      nextStep: "log_two_scores",
      language: "en",
    });

    expect(guided.currentPriority.recommendedAction).toBe("Start with two calm scores before anything more ambitious.");
    expect(guided.actionCards.map((card) => card.title)).toEqual([
      "Two-score reset",
      "What counts as enough signal",
      "Tiny supporting action",
      "Short note for later",
    ]);
  });

  it("pulls the Today plan back into recovery mode when the digest is cautious", () => {
    const guided = applyReviewDigestToToday(
      {
        ...baseToday,
        currentPriority: {
          ...baseToday.currentPriority,
          domain: "confidence",
          title: "Keep the plan steady",
          confidence: "medium",
          recommendedAction: "Complete one planned practice and one short reflection.",
        },
      },
      {
        tone: "recovery",
        nextStep: "protect_recovery",
        language: "en",
      },
    );

    expect(guided.currentPriority.recommendedAction).toBe("Keep today to one recovery-first action and one check-in.");
    expect(guided.currentPriority.avoidToday).toBe("Do not add extra intensity while the broader read is still recovery-first.");
    expect(guided.actionCards[0]?.title).toBe("Recovery reset");
    expect(guided.actionCards[1]?.title).toBe("Comfort check-in");
  });

  it("keeps the safety domain intact while still steering the action plan", () => {
    const guided = applyReviewDigestToToday(
      {
        ...baseToday,
        currentPriority: {
          domain: "safety",
          title: "Keep today conservative",
          whyItMatters: "Recent symptom signals mean the safest useful move is to reduce intensity and track clearly.",
          recommendedAction: "Log symptoms and choose only gentle recovery actions today.",
          avoidToday: "Avoid intense or aggressive protocols until the signal is clearer.",
          confidence: "medium",
        },
      },
      {
        tone: "recovery",
        nextStep: "protect_recovery",
        language: "en",
      },
    );

    expect(guided.currentPriority.domain).toBe("safety");
    expect(guided.currentPriority.title).toBe("Keep today conservative");
    expect(guided.currentPriority.recommendedAction).toBe("Log symptoms and keep the rest of today to one recovery-first action.");
    expect(guided.currentPriority.avoidToday).toBe("Avoid intense or aggressive protocols until the signal is clearer.");
    expect(guided.actionCards[0]?.title).toBe("Recovery reset");
  });
});
