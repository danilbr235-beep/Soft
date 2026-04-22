import type { Program, ProgramCompletionState, ProgramHistoryEntry, ProgramProgressSummary } from "@pmhc/types";

type CreateProgramHistoryEntryArgs = {
  activeProgram: Program;
  completionState: ProgramCompletionState;
  completedAt: string;
  nextProgramId?: string | null;
  progressSummary: ProgramProgressSummary;
  reasonTitle: string;
};

export function createProgramHistoryEntry(
  args: CreateProgramHistoryEntryArgs,
): ProgramHistoryEntry {
  const { activeProgram, completionState, completedAt, nextProgramId = null, progressSummary, reasonTitle } = args;

  return {
    id: `${activeProgram.id}:${completedAt}`,
    programId: activeProgram.id,
    completionState,
    reasonTitle,
    completedDays: progressSummary.completedDays,
    restDays: progressSummary.restDays,
    skippedDays: progressSummary.skippedDays,
    completedAt,
    nextProgramId,
  };
}

export function appendProgramHistory(
  history: ProgramHistoryEntry[],
  entry: ProgramHistoryEntry,
): ProgramHistoryEntry[] {
  return [entry, ...history.filter((item) => item.id !== entry.id)];
}
