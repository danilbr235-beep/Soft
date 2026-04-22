import type { Alert, AlertSeverity, CurrentPriority, ProgramCompletionState, ProgramProgressSummary } from "@pmhc/types";

export type ProgramCompletionNextStep = "choose_next_light" | "rebuild_baseline" | "keep_recovery_light";

export type ProgramCompletionSummary = {
  state: ProgramCompletionState;
  nextStep: ProgramCompletionNextStep;
  reasonTitle: string;
};

type BuildProgramCompletionArgs = {
  alerts: Alert[];
  currentPriority: CurrentPriority;
  progressSummary: ProgramProgressSummary;
};

export function buildProgramCompletionSummary(
  args: BuildProgramCompletionArgs,
): ProgramCompletionSummary | null {
  const { alerts, currentPriority, progressSummary } = args;

  if (progressSummary.remainingDays > 0) {
    return null;
  }

  const highestAlert = getHighestPriorityAlert(alerts);

  if (
    (highestAlert && severityRank(highestAlert.severity) >= severityRank("high_priority")) ||
    currentPriority.domain === "recovery" ||
    currentPriority.domain === "safety"
  ) {
    return {
      state: "recovery_finish",
      nextStep: "keep_recovery_light",
      reasonTitle: highestAlert?.title ?? currentPriority.title,
    };
  }

  if (progressSummary.skippedDays > 0 || (progressSummary.restDays > 0 && progressSummary.restDays * 2 >= progressSummary.completedDays)) {
    return {
      state: "mixed_finish",
      nextStep: "rebuild_baseline",
      reasonTitle: currentPriority.title,
    };
  }

  return {
    state: "steady_finish",
    nextStep: "choose_next_light",
    reasonTitle: currentPriority.title,
  };
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
