import { describe, expect, it } from "vitest";
import type { ContentItem, LogEntry, ProgramProgress, TodayPayload } from "@pmhc/types";
import { buildDailySession, markDailySessionStepComplete } from "./dailySession";

const today = {
  date: "2026-04-22",
  todayMode: "Light",
  syncStatus: "synced",
  activeProgram: {
    id: "confidence-reset-14",
    title: "14-day confidence reset",
    category: "confidence",
    durationDays: 14,
    dayIndex: 1,
  },
  currentPriority: {
    domain: "baseline",
    title: "Build your baseline",
    whyItMatters: "There is not enough stable data yet for strong recommendations.",
    recommendedAction: "Start with two calm scores before anything more ambitious.",
    confidence: "low",
  },
  dailyState: [],
  alerts: [],
  actionCards: [
    { id: "learn", kind: "Learn", title: "What counts as enough signal", description: "Read one short explainer before changing the plan.", cta: "Read" },
    { id: "check-in", kind: "Check-in", title: "Two-score reset", description: "Capture one simple signal before you interpret the day.", cta: "Log" },
    { id: "practice", kind: "Practice", title: "Tiny supporting action", description: "Choose one small action and stop while it still feels easy.", cta: "Start" },
    { id: "reflect", kind: "Reflect", title: "Short note for later", description: "Close the loop with one note instead of a long post-mortem.", cta: "Reflect" },
  ],
  quickLogs: [
    { type: "confidence", label: "Confidence", input: "score" },
    { type: "energy", label: "Energy", input: "score" },
    { type: "sleep_quality", label: "Sleep", input: "score" },
  ],
  liveUpdates: [],
  insights: [],
} satisfies TodayPayload;

const content = [
  {
    id: "baseline-without-overchecking",
    type: "guide",
    title: "Build a baseline without overchecking",
    summary: "Collect useful signals.",
    durationMinutes: 4,
    trustLevel: "reviewed_source",
    tags: ["baseline", "confidence", "tracking"],
    sourceName: "Starter",
    language: "en",
    saved: false,
    completed: false,
  },
  {
    id: "sleep-reset",
    type: "summary",
    title: "Sleep setup for next-day readiness",
    summary: "Keep recovery simple.",
    durationMinutes: 5,
    trustLevel: "expert_summary",
    tags: ["sleep", "recovery"],
    sourceName: "Starter",
    language: "en",
    saved: false,
    completed: false,
  },
] satisfies ContentItem[];

describe("dailySession", () => {
  it("builds a stable four-step session with lesson first", () => {
    const session = buildDailySession({
      content,
      language: "en",
      logs: [],
      programProgress: null,
      reviewPackets: [],
      reviewDigestTone: "baseline_building",
      reviewDigestNextStep: "log_two_scores",
      today,
    });

    expect(session.progressLabel).toBe("0 of 4 done");
    expect(session.lessonItemId).toBe("baseline-without-overchecking");
    expect(session.quizLog?.type).toBe("confidence");
    expect(session.steps.map((step) => `${step.title}:${step.state}`)).toEqual([
      "Lesson:active",
      "Quiz:ready",
      "Practice:ready",
      "Reflection:ready",
    ]);
  });

  it("lets a recovery digest pull the lesson toward recovery content", () => {
    const session = buildDailySession({
      content,
      language: "en",
      logs: [],
      programProgress: null,
      reviewPackets: [],
      reviewDigestTone: "recovery",
      reviewDigestNextStep: "protect_recovery",
      today: {
        ...today,
        currentPriority: {
          ...today.currentPriority,
          domain: "confidence",
          confidence: "medium",
        },
      },
    });

    expect(session.lessonItemId).toBe("sleep-reset");
    expect(session.steps[0]?.body).toContain("Sleep setup for next-day readiness");
  });

  it("merges stored progress with same-day quiz, practice, and reflection signals", () => {
    const logs: LogEntry[] = [
      {
        id: "log-1",
        type: "confidence",
        value: 7,
        occurredAt: "2026-04-22T08:00:00.000Z",
        source: "manual",
      },
    ];
    const programProgress = {
      programId: "confidence-reset-14",
      completedDayIndexes: [],
      completedTaskIdsByDay: {
        "1": ["baseline-check"],
      },
      restDayIndexes: [],
      skippedDayIndexes: [],
      lastCompletedAt: null,
      pausedAt: null,
      updatedAt: "2026-04-22T09:00:00.000Z",
    } satisfies ProgramProgress;
    const progress = markDailySessionStepComplete({}, "2026-04-22", "lesson", "2026-04-22T07:00:00.000Z");

    const session = buildDailySession({
      content,
      language: "en",
      logs,
      programProgress,
      progressEntry: progress["2026-04-22"],
      reviewPackets: [
        {
          id: "packet-1",
          section: "week",
          title: "7 days packet",
          blocks: [],
          createdAt: "2026-04-22T20:00:00.000Z",
        },
      ],
      reviewDigestTone: "baseline_building",
      reviewDigestNextStep: "log_two_scores",
      today,
    });

    expect(session.progressLabel).toBe("4 of 4 done");
    expect(session.steps.every((step) => step.state === "done")).toBe(true);
  });
});
