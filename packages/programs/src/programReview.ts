import type { ProgramCompletionState, ProgramHistoryEntry } from "@pmhc/types";

export type ProgramReviewFocus =
  | "build_on_stability"
  | "rebuild_with_short_cycles"
  | "protect_recovery";

export type ProgramReviewSummary = {
  cycleCount: number;
  totalCompletedDays: number;
  totalRestDays: number;
  totalSkippedDays: number;
  leadingState: ProgramCompletionState;
  focus: ProgramReviewFocus;
  latestProgramId: string;
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
  };
}
