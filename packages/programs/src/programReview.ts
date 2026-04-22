import type { ProgramCompletionState, ProgramHistoryEntry } from "@pmhc/types";

export type ProgramReviewFocus =
  | "build_on_stability"
  | "rebuild_with_short_cycles"
  | "protect_recovery";
export type ProgramReviewTrend =
  | "toward_stability"
  | "holding_pattern"
  | "toward_recovery";

export type ProgramReviewSummary = {
  cycleCount: number;
  totalCompletedDays: number;
  totalRestDays: number;
  totalSkippedDays: number;
  leadingState: ProgramCompletionState;
  focus: ProgramReviewFocus;
  latestProgramId: string;
  trend: ProgramReviewTrend;
};

export function buildProgramReview(history: ProgramHistoryEntry[]): ProgramReviewSummary | null {
  const recentHistory = history.slice(0, 3);

  if (recentHistory.length === 0) {
    return null;
  }

  const totalCompletedDays = recentHistory.reduce((sum, entry) => sum + entry.completedDays, 0);
  const totalRestDays = recentHistory.reduce((sum, entry) => sum + entry.restDays, 0);
  const totalSkippedDays = recentHistory.reduce((sum, entry) => sum + entry.skippedDays, 0);
  const stateCounts = recentHistory.reduce<Record<ProgramCompletionState, number>>(
    (counts, entry) => ({
      ...counts,
      [entry.completionState]: counts[entry.completionState] + 1,
    }),
    {
      steady_finish: 0,
      mixed_finish: 0,
      recovery_finish: 0,
    },
  );

  if (recentHistory[0].completionState === "recovery_finish" || stateCounts.recovery_finish >= 2) {
    return {
      cycleCount: recentHistory.length,
      totalCompletedDays,
      totalRestDays,
      totalSkippedDays,
      leadingState: "recovery_finish",
      focus: "protect_recovery",
      latestProgramId: recentHistory[0].programId,
      trend: buildProgramReviewTrend(recentHistory, stateCounts),
    };
  }

  if (stateCounts.mixed_finish >= stateCounts.steady_finish || totalSkippedDays > 0) {
    return {
      cycleCount: recentHistory.length,
      totalCompletedDays,
      totalRestDays,
      totalSkippedDays,
      leadingState: "mixed_finish",
      focus: "rebuild_with_short_cycles",
      latestProgramId: recentHistory[0].programId,
      trend: buildProgramReviewTrend(recentHistory, stateCounts),
    };
  }

  return {
    cycleCount: recentHistory.length,
    totalCompletedDays,
    totalRestDays,
    totalSkippedDays,
    leadingState: "steady_finish",
    focus: "build_on_stability",
    latestProgramId: recentHistory[0].programId,
    trend: buildProgramReviewTrend(recentHistory, stateCounts),
  };
}

function buildProgramReviewTrend(
  history: ProgramHistoryEntry[],
  stateCounts: Record<ProgramCompletionState, number>,
): ProgramReviewTrend {
  if (history.length < 2) {
    return trendFromState(history[0]?.completionState ?? "mixed_finish");
  }

  const latestRank = completionStateRank(history[0].completionState);
  const oldestRank = completionStateRank(history[history.length - 1].completionState);

  if (latestRank < oldestRank || stateCounts.steady_finish >= 2) {
    return "toward_stability";
  }

  if (latestRank > oldestRank || stateCounts.recovery_finish >= 2) {
    return "toward_recovery";
  }

  return "holding_pattern";
}

function trendFromState(state: ProgramCompletionState): ProgramReviewTrend {
  if (state === "steady_finish") {
    return "toward_stability";
  }

  if (state === "recovery_finish") {
    return "toward_recovery";
  }

  return "holding_pattern";
}

function completionStateRank(state: ProgramCompletionState) {
  return {
    steady_finish: 0,
    mixed_finish: 1,
    recovery_finish: 2,
  }[state];
}
