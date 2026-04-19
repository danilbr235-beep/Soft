import type { ContentItem, RuleEngineInput } from "@pmhc/types";

export const featuredContent: ContentItem[] = [
  {
    id: "baseline-without-overchecking",
    type: "guide",
    title: "Build a baseline without overchecking",
    summary: "A short guide for collecting useful signals without turning health into a scoreboard.",
    durationMinutes: 4,
    trustLevel: "reviewed_source",
    tags: ["baseline", "tracking", "confidence"],
    sourceName: "PMHC reviewed starter note",
    language: "en",
    translatedSummaryRu: "Как собрать спокойную базовую линию без навязчивой проверки.",
    saved: false,
    completed: false,
  },
  {
    id: "sleep-room-reset",
    type: "summary",
    title: "Sleep setup that supports next-day readiness",
    summary: "A practical room and routine checklist for a lighter recovery day.",
    durationMinutes: 5,
    trustLevel: "expert_summary",
    tags: ["sleep", "environment", "recovery"],
    sourceName: "Reviewed sleep environment brief",
    language: "en",
    translatedSummaryRu: "Практичный чек-лист сна и комнаты для восстановления.",
    saved: false,
    completed: false,
  },
];

export const starterRuleInput: RuleEngineInput = {
  profile: {
    id: "local-user",
    language: "ru",
    mode: "Simple",
    primaryGoal: "sexual_confidence",
    secondaryGoals: ["recovery", "tracking"],
    conservativeGuidance: false,
  },
  activeProgram: {
    id: "clarity-baseline-7",
    title: "7-day clarity baseline",
    category: "recovery",
    durationDays: 7,
    dayIndex: 1,
  },
  latestLogs: [],
  recentAlerts: [],
  contentItems: featuredContent,
};
