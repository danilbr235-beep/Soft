import type {
  Program,
  ProgramDayPhase,
  ProgramDayPlan,
  ProgramDayTask,
  ProgramProgress,
  ProgramProgressSummary,
  ProgramTaskKind,
} from "@pmhc/types";

export function createProgramProgress(program: Program, updatedAt: string): ProgramProgress {
  return {
    programId: program.id,
    completedDayIndexes: [],
    completedTaskIdsByDay: {},
    restDayIndexes: [],
    skippedDayIndexes: [],
    lastCompletedAt: null,
    pausedAt: null,
    updatedAt,
  };
}

export function completeCurrentProgramDay(
  program: Program,
  progress: ProgramProgress | null,
  completedAt: string,
): ProgramProgress {
  const currentProgress = progress ?? createProgramProgress(program, completedAt);
  if (isProgramPaused(program, currentProgress)) {
    return {
      ...currentProgress,
      updatedAt: completedAt,
    };
  }
  const dayIndex = clampDay(program.dayIndex, program.durationDays);
  const dayPlan = buildProgramDayPlan(program, currentProgress);
  const completedDayIndexes = Array.from(new Set([...currentProgress.completedDayIndexes, dayIndex])).sort(
    (a, b) => a - b,
  );

  return {
    programId: program.id,
    completedDayIndexes,
    restDayIndexes: withoutDay(currentProgress.restDayIndexes, dayIndex),
    skippedDayIndexes: withoutDay(currentProgress.skippedDayIndexes, dayIndex),
    completedTaskIdsByDay: {
      ...currentProgress.completedTaskIdsByDay,
      [dayKey(dayIndex)]: dayPlan.tasks.map((task) => task.id),
    },
    lastCompletedAt: completedAt,
    pausedAt: currentProgress.pausedAt ?? null,
    updatedAt: completedAt,
  };
}

export function buildProgramDayPlan(program: Program, progress: ProgramProgress | null): ProgramDayPlan {
  const dayIndex = clampDay(program.dayIndex, program.durationDays);
  const phase = phaseForDay(dayIndex);
  const tasks = tasksForProgram(program, phase);
  const completedTaskIds = getCompletedTaskIds(progress, program, dayIndex).filter((taskId) =>
    tasks.some((task) => task.id === taskId),
  );
  const completedDay = progress?.programId === program.id && progress.completedDayIndexes.includes(dayIndex);
  const rested = progress?.programId === program.id && (progress.restDayIndexes ?? []).includes(dayIndex);

  return {
    programId: program.id,
    dayIndex,
    phase,
    title: titleForProgram(program, dayIndex),
    summary: summaryForProgram(program),
    tasks,
    completedTaskIds,
    rested,
    completed: rested || completedDay || completedTaskIds.length === tasks.length,
  };
}

export function toggleCurrentProgramTask(
  program: Program,
  progress: ProgramProgress | null,
  taskId: string,
  updatedAt: string,
): ProgramProgress {
  const currentProgress = progress ?? createProgramProgress(program, updatedAt);
  if (isProgramPaused(program, currentProgress)) {
    return {
      ...currentProgress,
      updatedAt,
    };
  }
  const dayIndex = clampDay(program.dayIndex, program.durationDays);
  const tasks = tasksForProgram(program, phaseForDay(dayIndex));

  if (!tasks.some((task) => task.id === taskId)) {
    return {
      ...currentProgress,
      updatedAt,
    };
  }

  const key = dayKey(dayIndex);
  const currentIds = getCompletedTaskIds(currentProgress, program, dayIndex);
  const nextIds = currentIds.includes(taskId)
    ? currentIds.filter((id) => id !== taskId)
    : [...currentIds, taskId];

  return {
    ...currentProgress,
    programId: program.id,
    completedTaskIdsByDay: {
      ...currentProgress.completedTaskIdsByDay,
      [key]: nextIds,
    },
    updatedAt,
  };
}

export function markCurrentProgramRestDay(
  program: Program,
  progress: ProgramProgress | null,
  restedAt: string,
): ProgramProgress {
  const currentProgress = progress ?? createProgramProgress(program, restedAt);
  if (isProgramPaused(program, currentProgress)) {
    return {
      ...currentProgress,
      updatedAt: restedAt,
    };
  }
  const dayIndex = clampDay(program.dayIndex, program.durationDays);
  const restDayIndexes = Array.from(new Set([...(currentProgress.restDayIndexes ?? []), dayIndex])).sort((a, b) => a - b);

  return {
    ...currentProgress,
    programId: program.id,
    completedDayIndexes: withoutDay(currentProgress.completedDayIndexes, dayIndex),
    restDayIndexes,
    skippedDayIndexes: withoutDay(currentProgress.skippedDayIndexes, dayIndex),
    completedTaskIdsByDay: {
      ...currentProgress.completedTaskIdsByDay,
      [dayKey(dayIndex)]: [],
    },
    lastCompletedAt: restedAt,
    pausedAt: currentProgress.pausedAt ?? null,
    updatedAt: restedAt,
  };
}

export function skipCurrentProgramDay(
  program: Program,
  progress: ProgramProgress | null,
  skippedAt: string,
): ProgramProgress {
  const currentProgress = progress ?? createProgramProgress(program, skippedAt);
  if (isProgramPaused(program, currentProgress)) {
    return {
      ...currentProgress,
      updatedAt: skippedAt,
    };
  }
  const dayIndex = clampDay(program.dayIndex, program.durationDays);
  const skippedDayIndexes = Array.from(new Set([...(currentProgress.skippedDayIndexes ?? []), dayIndex])).sort((a, b) => a - b);

  return {
    ...currentProgress,
    programId: program.id,
    completedDayIndexes: withoutDay(currentProgress.completedDayIndexes, dayIndex),
    restDayIndexes: withoutDay(currentProgress.restDayIndexes, dayIndex),
    skippedDayIndexes,
    completedTaskIdsByDay: {
      ...currentProgress.completedTaskIdsByDay,
      [dayKey(dayIndex)]: [],
    },
    lastCompletedAt: skippedAt,
    pausedAt: currentProgress.pausedAt ?? null,
    updatedAt: skippedAt,
  };
}

export function pauseProgramProgress(
  program: Program,
  progress: ProgramProgress | null,
  pausedAt: string,
): ProgramProgress {
  const currentProgress = progress ?? createProgramProgress(program, pausedAt);

  return {
    ...currentProgress,
    programId: program.id,
    pausedAt,
    updatedAt: pausedAt,
  };
}

export function resumeProgramProgress(
  program: Program,
  progress: ProgramProgress | null,
  resumedAt: string,
): ProgramProgress {
  const currentProgress = progress ?? createProgramProgress(program, resumedAt);

  return {
    ...currentProgress,
    programId: program.id,
    pausedAt: null,
    updatedAt: resumedAt,
  };
}

export function isProgramPaused(program: Program, progress: ProgramProgress | null) {
  return progress?.programId === program.id && progress.pausedAt != null;
}

export function applyProgramProgress(program: Program, progress: ProgramProgress | null): Program {
  if (!progress || progress.programId !== program.id) {
    return program;
  }
  const resolvedDays = resolvedDayCount(progress);

  return {
    ...program,
    dayIndex: clampDay(resolvedDays + 1, program.durationDays),
  };
}

export function programCompletionPercent(program: Program, progress: ProgramProgress | null): number {
  if (!progress || progress.programId !== program.id || program.durationDays <= 0) {
    return 0;
  }

  return Math.round((Math.min(resolvedDayCount(progress), program.durationDays) / program.durationDays) * 100);
}

export function buildProgramProgressSummary(
  program: Program,
  progress: ProgramProgress | null,
): ProgramProgressSummary {
  if (!progress || progress.programId !== program.id) {
    return {
      completedDays: 0,
      restDays: 0,
      skippedDays: 0,
      remainingDays: program.durationDays,
      resolvedDays: 0,
      totalDays: program.durationDays,
      paused: false,
    };
  }

  const uniqueCompletedDays = uniqueValidDays(progress.completedDayIndexes, program.durationDays);
  const uniqueRestDays = uniqueValidDays(progress.restDayIndexes ?? [], program.durationDays).filter(
    (day) => !uniqueCompletedDays.includes(day),
  );
  const uniqueSkippedDays = uniqueValidDays(progress.skippedDayIndexes ?? [], program.durationDays).filter(
    (day) => !uniqueCompletedDays.includes(day) && !uniqueRestDays.includes(day),
  );
  const completedDays = uniqueCompletedDays.length;
  const restDays = uniqueRestDays.length;
  const skippedDays = uniqueSkippedDays.length;
  const resolvedDays = Math.min(completedDays + restDays + skippedDays, program.durationDays);

  return {
    completedDays,
    restDays,
    skippedDays,
    remainingDays: Math.max(program.durationDays - resolvedDays, 0),
    resolvedDays,
    totalDays: program.durationDays,
    paused: progress.pausedAt != null,
  };
}

function clampDay(dayIndex: number, durationDays: number): number {
  return Math.min(Math.max(dayIndex, 1), Math.max(durationDays, 1));
}

function withoutDay(days: number[] | undefined, dayIndex: number): number[] {
  return (days ?? []).filter((day) => day !== dayIndex);
}

function resolvedDayCount(progress: ProgramProgress) {
  return new Set([
    ...progress.completedDayIndexes,
    ...(progress.restDayIndexes ?? []),
    ...(progress.skippedDayIndexes ?? []),
  ]).size;
}

function uniqueValidDays(days: number[], durationDays: number) {
  return Array.from(new Set(days)).filter((day) => day >= 1 && day <= durationDays);
}

function getCompletedTaskIds(progress: ProgramProgress | null, program: Program, dayIndex: number): string[] {
  if (!progress || progress.programId !== program.id) {
    return [];
  }

  return progress.completedTaskIdsByDay?.[dayKey(dayIndex)] ?? [];
}

function dayKey(dayIndex: number) {
  return String(dayIndex);
}

function phaseForDay(dayIndex: number): ProgramDayPhase {
  if (dayIndex % 7 === 0) {
    return "recovery";
  }

  if (dayIndex === 1) {
    return "baseline";
  }

  return "practice";
}

function titleForProgram(program: Program, dayIndex: number) {
  if (program.id === "confidence-reset-14") {
    return `Confidence reset: day ${dayIndex}`;
  }

  if (program.id === "pelvic-floor-starter") {
    return `Pelvic floor consistency: day ${dayIndex}`;
  }

  if (program.id === "sleep-environment-reset") {
    return `Sleep reset: day ${dayIndex}`;
  }

  if (program.id === "conservative-recovery") {
    return `Conservative recovery: day ${dayIndex}`;
  }

  return `Clarity baseline: day ${dayIndex}`;
}

function summaryForProgram(program: Program) {
  if (program.id === "confidence-reset-14") {
    return "A short loop: check the signal, downshift the body, and close the day without overchecking.";
  }

  if (program.id === "pelvic-floor-starter") {
    return "Keep the work gentle and consistent. Comfort matters more than intensity.";
  }

  if (program.id === "sleep-environment-reset") {
    return "Make recovery easier tonight with one room cue and one simple wind-down signal.";
  }

  if (program.id === "conservative-recovery") {
    return "Stay light today: track clearly, reduce intensity, and avoid chasing a result.";
  }

  return "Collect a few calm signals and keep the next action small.";
}

function tasksForProgram(program: Program, phase: ProgramDayPhase): ProgramDayTask[] {
  if (phase === "recovery") {
    return [
      task("weekly-review", "reflect", "Weekly review", "Look for one pattern without forcing a conclusion.", 3),
      task("recovery-reset", "recovery", "Recovery reset", "Use one short downshift action before adding more data.", 4),
      task("next-week-boundary", "reflect", "Next-week boundary", "Name one thing to keep light next week.", 2),
    ];
  }

  if (phase === "practice") {
    return [
      task("confidence-map", "reflect", "Confidence map", "Name the situation and the signal without turning it into a verdict.", 2),
      task("body-reset", "recovery", "Body reset", "Use one calm reset before any bigger experiment.", 4),
      task("tiny-action", "practice", "Tiny action", "Choose one small action that supports steadiness today.", 3),
    ];
  }

  if (program.id === "pelvic-floor-starter") {
    return [
      task("comfort-check", "check_in", "Comfort check", "Notice comfort first. If anything feels off, keep the day lighter.", 1),
      task("gentle-practice", "practice", "Gentle consistency practice", "Use an easy set. Stop well before strain.", 4),
      task("evening-reflection", "reflect", "Evening note", "Record what felt easy, what felt tense, and what to keep steady.", 2),
    ];
  }

  if (program.id === "sleep-environment-reset") {
    return [
      task("room-cue", "recovery", "Room cue", "Pick one small cue that makes sleep easier tonight.", 3),
      task("wind-down-check", "check_in", "Wind-down check", "Rate energy and stress before the evening gets crowded.", 1),
      task("evening-reflection", "reflect", "Evening note", "Write what helped recovery and what to repeat tomorrow.", 2),
    ];
  }

  if (program.id === "conservative-recovery") {
    return [
      task("symptom-check", "check_in", "Symptom check", "Log the signal plainly and keep the rest of the day gentle.", 1),
      task("recovery-only", "recovery", "Recovery-only action", "Choose a low-intensity action that does not chase performance.", 5),
      task("boundary-note", "reflect", "Boundary note", "Write what to avoid today so the plan stays conservative.", 2),
    ];
  }

  if (program.id === "clarity-baseline-7") {
    return [
      task("baseline-check", "check_in", "Baseline check", "Log one signal without judging it.", 1),
      task("recovery-reset", "recovery", "Recovery reset", "Use one short downshift action before adding more data.", 4),
      task("evening-reflection", "reflect", "Evening note", "Capture what changed and what stayed unclear.", 2),
    ];
  }

  return [
    task("baseline-check", "check_in", "Baseline check", "Log the signal without turning it into a verdict.", 1),
    task("downshift-practice", "practice", "Downshift practice", "Do one calm reset before any bigger experiment.", 4),
    task("evening-reflection", "reflect", "Evening note", "Record what helped confidence feel steadier today.", 2),
  ];
}

function task(
  id: string,
  kind: ProgramTaskKind,
  title: string,
  description: string,
  durationMinutes: number,
): ProgramDayTask {
  return {
    id,
    kind,
    title,
    description,
    durationMinutes,
  };
}
