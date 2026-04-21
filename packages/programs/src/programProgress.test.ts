import { describe, expect, it } from "vitest";
import type { Program, ProgramProgress } from "@pmhc/types";
import {
  applyProgramProgress,
  buildProgramDayPlan,
  buildProgramProgressSummary,
  completeCurrentProgramDay,
  createProgramProgress,
  isProgramPaused,
  markCurrentProgramRestDay,
  pauseProgramProgress,
  programCompletionPercent,
  resumeProgramProgress,
  skipCurrentProgramDay,
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
      restDayIndexes: [],
      skippedDayIndexes: [],
      lastCompletedAt: null,
      pausedAt: null,
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

  it("marks the current day as a rest day and advances without counting it as completed work", () => {
    const progress = createProgramProgress(program, "2026-04-19T12:00:00.000Z");
    const rested = markCurrentProgramRestDay(program, progress, "2026-04-19T13:00:00.000Z");
    const plan = buildProgramDayPlan(program, rested);

    expect(rested.restDayIndexes).toEqual([1]);
    expect(plan.rested).toBe(true);
    expect(plan.completed).toBe(true);
    expect(applyProgramProgress(program, rested)).toMatchObject({ dayIndex: 2 });
    expect(programCompletionPercent(program, rested)).toBe(7);
  });

  it("marks the current day as skipped and advances without counting it as completed or rest", () => {
    const progress = createProgramProgress(program, "2026-04-19T12:00:00.000Z");
    const skipped = skipCurrentProgramDay(program, progress, "2026-04-19T13:00:00.000Z");

    expect(skipped.skippedDayIndexes).toEqual([1]);
    expect(skipped.completedDayIndexes).toEqual([]);
    expect(skipped.restDayIndexes).toEqual([]);
    expect(applyProgramProgress(program, skipped)).toMatchObject({ dayIndex: 2 });
    expect(programCompletionPercent(program, skipped)).toBe(7);
  });

  it("summarizes completed, rest, and remaining program days", () => {
    const completed = completeCurrentProgramDay(
      program,
      createProgramProgress(program, "2026-04-19T12:00:00.000Z"),
      "2026-04-19T13:00:00.000Z",
    );
    const skipped = skipCurrentProgramDay(applyProgramProgress(program, completed), completed, "2026-04-19T14:00:00.000Z");
    const progress = markCurrentProgramRestDay(applyProgramProgress(program, skipped), skipped, "2026-04-19T15:00:00.000Z");

    expect(buildProgramProgressSummary(program, progress)).toEqual({
      completedDays: 1,
      restDays: 1,
      skippedDays: 1,
      remainingDays: 11,
      resolvedDays: 3,
      totalDays: 14,
      paused: false,
    });
  });

  it("can pause and resume a program without advancing the day, and pauses block task changes", () => {
    const progress = createProgramProgress(program, "2026-04-19T12:00:00.000Z");
    const paused = pauseProgramProgress(program, progress, "2026-04-19T12:30:00.000Z");
    const toggledWhilePaused = toggleCurrentProgramTask(program, paused, "baseline-check", "2026-04-19T12:40:00.000Z");
    const resumed = resumeProgramProgress(program, toggledWhilePaused, "2026-04-19T12:45:00.000Z");
    const toggledAfterResume = toggleCurrentProgramTask(program, resumed, "baseline-check", "2026-04-19T12:50:00.000Z");

    expect(isProgramPaused(program, paused)).toBe(true);
    expect(applyProgramProgress(program, paused)).toMatchObject({ dayIndex: 1 });
    expect(buildProgramDayPlan(program, toggledWhilePaused).completedTaskIds).toEqual([]);
    expect(isProgramPaused(program, resumed)).toBe(false);
    expect(buildProgramDayPlan(program, toggledAfterResume).completedTaskIds).toEqual(["baseline-check"]);
  });

  it("varies the day plan across baseline, practice, and recovery days", () => {
    const progress = createProgramProgress(program, "2026-04-19T12:00:00.000Z");
    const dayTwo = buildProgramDayPlan({ ...program, dayIndex: 2 }, progress);
    const daySeven = buildProgramDayPlan({ ...program, dayIndex: 7 }, progress);

    expect(dayTwo.phase).toBe("practice");
    expect(dayTwo.tasks.map((task) => task.id)).toEqual(["confidence-map", "body-reset", "tiny-action"]);
    expect(daySeven.phase).toBe("recovery");
    expect(daySeven.tasks.map((task) => task.id)).toEqual(["weekly-review", "recovery-reset", "next-week-boundary"]);
  });
});
