import { describe, expect, it } from "vitest";
import type { Program } from "@pmhc/types";
import { buildProgramDayPlan, createProgramProgress, markCurrentProgramRestDay, toggleCurrentProgramTask } from "./programProgress";
import { buildProgramDetailSummary } from "./programDetail";

const baseProgram = {
  id: "confidence-reset-14",
  title: "14-day confidence reset",
  category: "confidence",
  durationDays: 14,
  dayIndex: 1,
} satisfies Program;

describe("program detail summary", () => {
  it("describes a new baseline day as a light starting point", () => {
    const progress = createProgramProgress(baseProgram, "2026-04-21T09:00:00.000Z");
    const dayPlan = buildProgramDayPlan(baseProgram, progress);

    expect(
      buildProgramDetailSummary(baseProgram, dayPlan, {
        completedDays: 0,
        restDays: 0,
        remainingDays: 14,
        resolvedDays: 0,
        totalDays: 14,
      }),
    ).toMatchObject({
      checklistState: "not_started",
      focus: "observe",
      pace: "light",
      completionBand: "starting",
      tasksRemaining: 3,
      nextMilestoneDay: 2,
    });
  });

  it("marks a partially completed practice day as in progress", () => {
    const practiceProgram = {
      ...baseProgram,
      dayIndex: 2,
    } satisfies Program;
    const progress = toggleCurrentProgramTask(
      practiceProgram,
      createProgramProgress(practiceProgram, "2026-04-21T09:00:00.000Z"),
      "confidence-map",
      "2026-04-21T09:10:00.000Z",
    );
    const dayPlan = buildProgramDayPlan(practiceProgram, progress);

    expect(
      buildProgramDetailSummary(practiceProgram, dayPlan, {
        completedDays: 1,
        restDays: 0,
        remainingDays: 12,
        resolvedDays: 2,
        totalDays: 14,
      }),
    ).toMatchObject({
      checklistState: "in_progress",
      focus: "practice",
      pace: "steady",
      completionBand: "building",
      tasksRemaining: 2,
      nextMilestoneDay: 3,
    });
  });

  it("treats a rested recovery day as a downshift moment", () => {
    const recoveryProgram = {
      ...baseProgram,
      dayIndex: 7,
    } satisfies Program;
    const progress = markCurrentProgramRestDay(
      recoveryProgram,
      createProgramProgress(recoveryProgram, "2026-04-21T09:00:00.000Z"),
      "2026-04-21T09:10:00.000Z",
    );
    const dayPlan = buildProgramDayPlan(recoveryProgram, progress);

    expect(
      buildProgramDetailSummary(recoveryProgram, dayPlan, {
        completedDays: 4,
        restDays: 1,
        remainingDays: 9,
        resolvedDays: 5,
        totalDays: 14,
      }),
    ).toMatchObject({
      checklistState: "rest_day",
      focus: "recover",
      pace: "downshift",
      completionBand: "building",
      tasksRemaining: 0,
      nextMilestoneDay: 8,
    });
  });

  it("flags the final stretch when only one day remains", () => {
    const closingProgram = {
      ...baseProgram,
      dayIndex: 14,
    } satisfies Program;
    const progress = createProgramProgress(closingProgram, "2026-04-21T09:00:00.000Z");
    const dayPlan = buildProgramDayPlan(closingProgram, progress);

    expect(
      buildProgramDetailSummary(closingProgram, dayPlan, {
        completedDays: 11,
        restDays: 2,
        remainingDays: 1,
        resolvedDays: 13,
        totalDays: 14,
      }),
    ).toMatchObject({
      completionBand: "closing",
      nextMilestoneDay: null,
    });
  });
});
