import { describe, expect, it } from "vitest";
import type { Program, ProgramProgress } from "@pmhc/types";
import {
  applyProgramProgress,
  buildProgramDayPlan,
  completeCurrentProgramDay,
  createProgramProgress,
  programCompletionPercent,
  toggleCurrentProgramTask,
} from "./programProgress";

const program = {
  id: "confidence-reset-14",
  title: "14-day confidence reset",
  category: "confidence",
  durationDays: 14,
  dayIndex: 1,
} satisfies Program;

describe("program progress helpers", () => {
  it("creates empty progress for a starter program", () => {
    expect(createProgramProgress(program, "2026-04-19T12:00:00.000Z")).toEqual({
      programId: "confidence-reset-14",
      completedDayIndexes: [],
      completedTaskIdsByDay: {},
      lastCompletedAt: null,
      updatedAt: "2026-04-19T12:00:00.000Z",
    });
  });

  it("completes the current day once and advances the displayed program day", () => {
    const progress = createProgramProgress(program, "2026-04-19T12:00:00.000Z");
    const completed = completeCurrentProgramDay(program, progress, "2026-04-19T13:00:00.000Z");
    const completedAgain = completeCurrentProgramDay(program, completed, "2026-04-19T14:00:00.000Z");

    expect(completedAgain.completedDayIndexes).toEqual([1]);
    expect(completedAgain.lastCompletedAt).toBe("2026-04-19T14:00:00.000Z");
    expect(applyProgramProgress(program, completedAgain)).toMatchObject({ dayIndex: 2 });
  });

  it("caps displayed day and percent at the program duration", () => {
    const progress = {
      programId: "confidence-reset-14",
      completedDayIndexes: Array.from({ length: 14 }, (_, index) => index + 1),
      lastCompletedAt: "2026-04-19T13:00:00.000Z",
      updatedAt: "2026-04-19T13:00:00.000Z",
    } satisfies ProgramProgress;

    expect(applyProgramProgress(program, progress).dayIndex).toBe(14);
    expect(programCompletionPercent(program, progress)).toBe(100);
  });

  it("builds a conservative daily checklist for the active program day", () => {
    const progress = createProgramProgress(program, "2026-04-19T12:00:00.000Z");
    const plan = buildProgramDayPlan(program, progress);

    expect(plan.programId).toBe("confidence-reset-14");
    expect(plan.dayIndex).toBe(1);
    expect(plan.title).toBe("Confidence reset: day 1");
    expect(plan.tasks.map((task) => task.id)).toEqual([
      "baseline-check",
      "downshift-practice",
      "evening-reflection",
    ]);
    expect(plan.completedTaskIds).toEqual([]);
    expect(plan.completed).toBe(false);
  });

  it("toggles task completion for the current program day without duplicating ids", () => {
    const progress = createProgramProgress(program, "2026-04-19T12:00:00.000Z");
    const withTask = toggleCurrentProgramTask(program, progress, "baseline-check", "2026-04-19T13:00:00.000Z");
    const toggledAgain = toggleCurrentProgramTask(program, withTask, "baseline-check", "2026-04-19T14:00:00.000Z");

    expect(buildProgramDayPlan(program, withTask).completedTaskIds).toEqual(["baseline-check"]);
    expect(buildProgramDayPlan(program, toggledAgain).completedTaskIds).toEqual([]);
  });

  it("completes all current-day tasks when the day is completed", () => {
    const progress = createProgramProgress(program, "2026-04-19T12:00:00.000Z");
    const completed = completeCurrentProgramDay(program, progress, "2026-04-19T13:00:00.000Z");
    const plan = buildProgramDayPlan(program, completed);

    expect(completed.completedDayIndexes).toEqual([1]);
    expect(plan.completed).toBe(true);
    expect(plan.completedTaskIds).toEqual(["baseline-check", "downshift-practice", "evening-reflection"]);
  });
});
