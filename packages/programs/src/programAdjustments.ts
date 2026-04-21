import type { Alert, AlertSeverity, CurrentPriority, ProgramDayPlan, ProgramProgressSummary, TodayMode } from "@pmhc/types";

export type ProgramAdjustmentKind = "downshift" | "recovery" | "baseline" | "steady" | "closeout";
export type ProgramAdjustmentNextStep =
  | "take_rest_day"
  | "keep_one_task"
  | "start_with_check_in"
  | "close_day_gently"
  | "review_boundary";

export type ProgramAdjustmentSummary = {
  kind: ProgramAdjustmentKind;
  nextStep: ProgramAdjustmentNextStep;
  reasonTitle: string;
  avoidToday: string | null;
  remainingTaskTarget: number;
};

type BuildProgramAdjustmentArgs = {
  alerts: Alert[];
  currentPriority: CurrentPriority;
  dayPlan: ProgramDayPlan;
  progressSummary: ProgramProgressSummary;
  todayMode: TodayMode;
};

export function buildProgramAdjustmentSummary(args: BuildProgramAdjustmentArgs): ProgramAdjustmentSummary {
  const { alerts, currentPriority, dayPlan, progressSummary, todayMode } = args;
  const highestAlert = getHighestPriorityAlert(alerts);
  const remainingTasks = dayPlan.rested ? 0 : Math.max(dayPlan.tasks.length - dayPlan.completedTaskIds.length, 0);

  if (highestAlert && severityRank(highestAlert.severity) >= severityRank("high_priority")) {
    return {
      kind: "downshift",
      nextStep: "take_rest_day",
      reasonTitle: highestAlert.title,
      avoidToday: currentPriority.avoidToday ?? highestAlert.message,
      remainingTaskTarget: 0,
    };
  }

  if (progressSummary.remainingDays <= 1) {
    return {
      kind: "closeout",
      nextStep: remainingTasks > 0 ? "close_day_gently" : "review_boundary",
      reasonTitle: currentPriority.title,
      avoidToday: currentPriority.avoidToday ?? null,
      remainingTaskTarget: Math.min(remainingTasks, 1),
    };
  }

  if (shouldUseBaselineAdjustment(currentPriority, dayPlan)) {
    return {
      kind: "baseline",
      nextStep: hasOpenCheckInTask(dayPlan) ? "start_with_check_in" : remainingTasks > 0 ? "keep_one_task" : "close_day_gently",
      reasonTitle: currentPriority.title,
      avoidToday: currentPriority.avoidToday ?? null,
      remainingTaskTarget: Math.min(remainingTasks, 1),
    };
  }

  if (
    todayMode === "Light" ||
    currentPriority.domain === "recovery" ||
    currentPriority.domain === "safety" ||
    dayPlan.phase === "recovery"
  ) {
    return {
      kind: "recovery",
      nextStep: remainingTasks > 0 ? "keep_one_task" : "review_boundary",
      reasonTitle: highestAlert?.title ?? currentPriority.title,
      avoidToday: currentPriority.avoidToday ?? null,
      remainingTaskTarget: Math.min(remainingTasks, 1),
    };
  }

  return {
    kind: "steady",
    nextStep: remainingTasks > 0 ? "keep_one_task" : "close_day_gently",
    reasonTitle: currentPriority.title,
    avoidToday: currentPriority.avoidToday ?? null,
    remainingTaskTarget: Math.min(remainingTasks, 2),
  };
}

function hasOpenCheckInTask(dayPlan: ProgramDayPlan) {
  return dayPlan.tasks.some((task) => task.kind === "check_in" && !dayPlan.completedTaskIds.includes(task.id));
}

function shouldUseBaselineAdjustment(currentPriority: CurrentPriority, dayPlan: ProgramDayPlan) {
  if (currentPriority.domain === "recovery" || currentPriority.domain === "safety") {
    return false;
  }

  return currentPriority.domain === "baseline" || currentPriority.confidence === "low" || dayPlan.phase === "baseline";
}

function getHighestPriorityAlert(alerts: Alert[]) {
  return [...alerts].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0] ?? null;
}

function severityRank(severity: AlertSeverity) {
  return {
    info: 0,
    caution: 1,
    high_priority: 2,
    medical_attention: 3,
  }[severity];
}
