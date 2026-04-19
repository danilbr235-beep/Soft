import type { Program, ProgramProgress } from "@pmhc/types";

export function createProgramProgress(program: Program, updatedAt: string): ProgramProgress {
  return {
    programId: program.id,
    completedDayIndexes: [],
    lastCompletedAt: null,
    updatedAt,
  };
}

export function completeCurrentProgramDay(
  program: Program,
  progress: ProgramProgress | null,
  completedAt: string,
): ProgramProgress {
  const currentProgress = progress ?? createProgramProgress(program, completedAt);
  const dayIndex = clampDay(program.dayIndex, program.durationDays);
  const completedDayIndexes = Array.from(new Set([...currentProgress.completedDayIndexes, dayIndex])).sort(
    (a, b) => a - b,
  );

  return {
    programId: program.id,
    completedDayIndexes,
    lastCompletedAt: completedAt,
    updatedAt: completedAt,
  };
}

export function applyProgramProgress(program: Program, progress: ProgramProgress | null): Program {
  if (!progress || progress.programId !== program.id) {
    return program;
  }

  return {
    ...program,
    dayIndex: clampDay(progress.completedDayIndexes.length + 1, program.durationDays),
  };
}

export function programCompletionPercent(program: Program, progress: ProgramProgress | null): number {
  if (!progress || progress.programId !== program.id || program.durationDays <= 0) {
    return 0;
  }

  const completedCount = Math.min(progress.completedDayIndexes.length, program.durationDays);
  return Math.round((completedCount / program.durationDays) * 100);
}

function clampDay(dayIndex: number, durationDays: number): number {
  return Math.min(Math.max(dayIndex, 1), Math.max(durationDays, 1));
}
