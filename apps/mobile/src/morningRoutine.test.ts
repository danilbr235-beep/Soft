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
  it("builds a three-step routine with a guide and quick log", () => {
    const routine = buildMorningRoutine({
      content,
      language: "en",
      today,
    });

    expect(routine.guideItemId).toBe("morning-routine-reset");
    expect(routine.logDefinition?.type).toBe("sleep_quality");
    expect(routine.steps.map((step) => step.id)).toEqual(["anchor", "checkin", "guide"]);
    expect(routine.steps[2]?.sourceLabels.length).toBe(3);
  });
});
