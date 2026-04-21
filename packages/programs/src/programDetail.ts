import type { Program, ProgramDayPlan, ProgramProgressSummary } from "@pmhc/types";

export type ProgramDetailChecklistState = "not_started" | "in_progress" | "done" | "rest_day";
export type ProgramDetailFocus = "observe" | "practice" | "recover";
export type ProgramDetailPace = "light" | "steady" | "downshift";
export type ProgramDetailCompletionBand = "starting" | "building" | "closing" | "complete";

export type ProgramDetailSummary = {
  checklistState: ProgramDetailChecklistState;
  completionBand: ProgramDetailCompletionBand;
  focus: ProgramDetailFocus;
  nextMilestoneDay: number | null;
  pace: ProgramDetailPace;
  tasksRemaining: number;
};

export function buildProgramDetailSummary(
  program: Program,
  dayPlan: ProgramDayPlan,
  progressSummary: ProgramProgressSummary,
): ProgramDetailSummary {
  const completedTasks = dayPlan.completedTaskIds.length;
  const totalTasks = dayPlan.tasks.length;
  const tasksRemaining = dayPlan.rested ? 0 : Math.max(totalTasks - completedTasks, 0);

  return {
    checklistState: checklistStateFor(dayPlan, completedTasks, totalTasks),
    completionBand: completionBandFor(progressSummary),
    focus: focusFor(dayPlan),
    nextMilestoneDay: nextMilestoneDayFor(program, progressSummary),
    pace: paceFor(dayPlan),
    tasksRemaining,
  };
}

function checklistStateFor(
  dayPlan: ProgramDayPlan,
  completedTasks: number,
  totalTasks: number,
): ProgramDetailChecklistState {
  if (dayPlan.rested) {
    return "rest_day";
  }

  if (dayPlan.completed || (totalTasks > 0 && completedTasks === totalTasks)) {
    return "done";
  }

  if (completedTasks > 0) {
    return "in_progress";
  }

  return "not_started";
}

function completionBandFor(progressSummary: ProgramProgressSummary): ProgramDetailCompletionBand {
  if (progressSummary.remainingDays <= 0) {
    return "complete";
  }

  if (progressSummary.remainingDays <= 2) {
    return "closing";
  }

  if (progressSummary.resolvedDays <= 1) {
    return "starting";
  }

  return "building";
}

function focusFor(dayPlan: ProgramDayPlan): ProgramDetailFocus {
  if (dayPlan.phase === "practice") {
    return "practice";
  }

  if (dayPlan.phase === "recovery" || dayPlan.rested) {
    return "recover";
  }

  return "observe";
}

function paceFor(dayPlan: ProgramDayPlan): ProgramDetailPace {
  if (dayPlan.phase === "practice" && !dayPlan.rested) {
    return "steady";
  }

  if (dayPlan.phase === "recovery" || dayPlan.rested) {
    return "downshift";
  }

  return "light";
}

function nextMilestoneDayFor(program: Program, progressSummary: ProgramProgressSummary) {
  if (progressSummary.remainingDays <= 1 || program.dayIndex >= program.durationDays) {
    return null;
  }

  return Math.min(program.dayIndex + 1, program.durationDays);
}
