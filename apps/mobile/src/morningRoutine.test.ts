import { describe, expect, it } from "vitest";
import type { ContentItem, TodayPayload } from "@pmhc/types";
import { buildMorningRoutine } from "./morningRoutine";

const today = {
  date: "2026-04-22",
  todayMode: "Light",
  syncStatus: "synced",
  activeProgram: null,
  currentPriority: {
    domain: "baseline",
    title: "Build your baseline",
    whyItMatters: "There is not enough stable data yet for strong recommendations.",
    recommendedAction: "Start with two calm scores before anything more ambitious.",
    confidence: "low",
  },
  dailyState: [],
  alerts: [],
  actionCards: [],
  quickLogs: [
    { type: "sleep_quality", label: "Sleep", input: "score" },
    { type: "confidence", label: "Confidence", input: "score" },
  ],
  liveUpdates: [],
  insights: [],
} satisfies TodayPayload;

const content = [
  {
    id: "morning-routine-reset",
    type: "guide",
    title: "Morning reset: light, signal, move",
    summary: "A short evidence-backed morning routine.",
    durationMinutes: 5,
    trustLevel: "reviewed_source",
    tags: ["sleep", "tracking", "confidence"],
    sourceName: "Morning routine brief",
    language: "en",
    saved: false,
    completed: false,
  },
] satisfies ContentItem[];

describe("buildMorningRoutine", () => {
  it("builds a three-step routine with metrics and a reusable guide/log flow", () => {
    const routine = buildMorningRoutine({
      content,
      language: "en",
      progressEntry: {
        completedStepIds: ["anchor"],
        updatedAt: "2026-04-22T07:00:00.000Z",
      },
      progressStore: {
        "2026-04-21": {
          completedStepIds: ["anchor", "checkin", "guide"],
          updatedAt: "2026-04-21T08:00:00.000Z",
        },
        "2026-04-22": {
          completedStepIds: ["anchor"],
          updatedAt: "2026-04-22T07:00:00.000Z",
        },
      },
      today,
    });

    expect(routine.guideItemId).toBe("morning-routine-reset");
    expect(routine.logDefinition?.type).toBe("sleep_quality");
    expect(routine.metrics.map((metric) => `${metric.label}:${metric.value}`)).toEqual([
      "Today:1 of 3",
      "Streak:1 day",
      "7-day adherence:1/7",
    ]);
    expect(routine.steps.map((step) => `${step.id}:${step.statusLabel}`)).toEqual([
      "anchor:Done",
      "checkin:Ready",
      "guide:Ready",
    ]);
    expect(routine.steps[0]?.ctaKind).toBe("complete");
    expect(routine.steps[1]?.ctaKind).toBe("log");
    expect(routine.steps[2]?.sourceLabels.length).toBe(3);
  });
});
