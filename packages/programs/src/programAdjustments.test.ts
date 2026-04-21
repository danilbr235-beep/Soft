import { describe, expect, it } from "vitest";
import type { Alert, CurrentPriority, Program, ProgramDayPlan, ProgramProgressSummary, TodayMode } from "@pmhc/types";
import { buildProgramAdjustmentSummary } from "./programAdjustments";

const activeProgram = {
  id: "confidence-reset-14",
  title: "14-day confidence reset",
  category: "confidence",
  durationDays: 14,
  dayIndex: 1,
} satisfies Program;

const basePlan = {
  programId: "confidence-reset-14",
  dayIndex: 1,
  phase: "baseline",
  title: "Confidence reset: day 1",
  summary: "Collect a few calm signals and keep the next action small.",
  tasks: [
    { id: "baseline-check", kind: "check_in", title: "Baseline check", description: "Log one signal.", durationMinutes: 1 },
    { id: "downshift-practice", kind: "practice", title: "Downshift practice", description: "One calm reset.", durationMinutes: 4 },
    { id: "evening-reflection", kind: "reflect", title: "Evening note", description: "Capture what changed.", durationMinutes: 2 },
  ],
  completedTaskIds: [],
  rested: false,
  completed: false,
} satisfies ProgramDayPlan;

const baseSummary = {
  completedDays: 0,
  restDays: 0,
  remainingDays: 14,
  resolvedDays: 0,
  totalDays: 14,
} satisfies ProgramProgressSummary;

const baselinePriority = {
  domain: "baseline",
  title: "Build your baseline",
  whyItMatters: "More calm signal comes before stronger conclusions.",
  recommendedAction: "Start with one small signal.",
  confidence: "low",
} satisfies CurrentPriority;

describe("program adjustment summary", () => {
  it("downshifts fully when a high-priority alert is active", () => {
    const alert = {
      id: "safety-caution",
      severity: "high_priority",
      title: "Symptom review recommended",
      message: "Keep today conservative",
      module: "safety",
    } satisfies Alert;

    expect(
      buildProgramAdjustmentSummary({
        alerts: [alert],
        currentPriority: {
          ...baselinePriority,
          domain: "safety",
          avoidToday: "Avoid pushing intensity today.",
        },
        dayPlan: basePlan,
        progressSummary: baseSummary,
        todayMode: "Light",
      }),
    ).toMatchObject({
      kind: "downshift",
      nextStep: "take_rest_day",
      reasonTitle: "Symptom review recommended",
      remainingTaskTarget: 0,
    });
  });

  it("reduces the plan to one small task on recovery-first days", () => {
    expect(
      buildProgramAdjustmentSummary({
        alerts: [],
        currentPriority: {
          ...baselinePriority,
          domain: "recovery",
          title: "Recovery comes first",
          confidence: "medium",
        },
        dayPlan: { ...basePlan, phase: "practice" },
        progressSummary: { ...baseSummary, completedDays: 1, remainingDays: 13, resolvedDays: 1 },
        todayMode: "Light",
      }),
    ).toMatchObject({
      kind: "recovery",
      nextStep: "keep_one_task",
      reasonTitle: "Recovery comes first",
      remainingTaskTarget: 1,
    });
  });

  it("uses the check-in as the first adjustment for baseline and low-data days", () => {
    expect(
      buildProgramAdjustmentSummary({
        alerts: [],
        currentPriority: baselinePriority,
        dayPlan: basePlan,
        progressSummary: baseSummary,
        todayMode: "Light",
      }),
    ).toMatchObject({
      kind: "baseline",
      nextStep: "start_with_check_in",
      reasonTitle: "Build your baseline",
      remainingTaskTarget: 1,
    });
  });

  it("switches to a closeout adjustment on the final scheduled day", () => {
    expect(
      buildProgramAdjustmentSummary({
        alerts: [],
        currentPriority: {
          ...baselinePriority,
          domain: "confidence",
          title: "Keep confidence work light",
          confidence: "medium",
        },
        dayPlan: {
          ...basePlan,
          dayIndex: 14,
          phase: "practice",
          completedTaskIds: ["baseline-check", "downshift-practice"],
        },
        progressSummary: {
          ...baseSummary,
          completedDays: 11,
          restDays: 2,
          remainingDays: 1,
          resolvedDays: 13,
        },
        todayMode: "Standard" as TodayMode,
      }),
    ).toMatchObject({
      kind: "closeout",
      nextStep: "close_day_gently",
      reasonTitle: "Keep confidence work light",
      remainingTaskTarget: 1,
    });
  });
});
