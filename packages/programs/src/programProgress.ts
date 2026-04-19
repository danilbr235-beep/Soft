import type { Program, ProgramDayPlan, ProgramDayTask, ProgramProgress, ProgramTaskKind } from "@pmhc/types";

export function createProgramProgress(program: Program, updatedAt: string): ProgramProgress {
  return {
    programId: program.id,
    completedDayIndexes: [],
    completedTaskIdsByDay: {},
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
  const dayPlan = buildProgramDayPlan(program, currentProgress);
  const completedDayIndexes = Array.from(new Set([...currentProgress.completedDayIndexes, dayIndex])).sort(
    (a, b) => a - b,
  );

  return {
    programId: program.id,
    completedDayIndexes,
    completedTaskIdsByDay: {
      ...currentProgress.completedTaskIdsByDay,
      [dayKey(dayIndex)]: dayPlan.tasks.map((task) => task.id),
    },
    lastCompletedAt: completedAt,
    updatedAt: completedAt,
  };
}

export function buildProgramDayPlan(program: Program, progress: ProgramProgress | null): ProgramDayPlan {
  const dayIndex = clampDay(program.dayIndex, program.durationDays);
  const tasks = tasksForProgram(program);
  const completedTaskIds = getCompletedTaskIds(progress, program, dayIndex).filter((taskId) =>
    tasks.some((task) => task.id === taskId),
  );
  const completedDay = progress?.programId === program.id && progress.completedDayIndexes.includes(dayIndex);

  return {
    programId: program.id,
    dayIndex,
    title: titleForProgram(program, dayIndex),
    summary: summaryForProgram(program),
    tasks,
    completedTaskIds,
    completed: completedDay || completedTaskIds.length === tasks.length,
  };
}

export function toggleCurrentProgramTask(
  program: Program,
  progress: ProgramProgress | null,
  taskId: string,
  updatedAt: string,
): ProgramProgress {
  const currentProgress = progress ?? createProgramProgress(program, updatedAt);
  const dayIndex = clampDay(program.dayIndex, program.durationDays);
  const tasks = tasksForProgram(program);

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

function getCompletedTaskIds(progress: ProgramProgress | null, program: Program, dayIndex: number): string[] {
  if (!progress || progress.programId !== program.id) {
    return [];
  }

  return progress.completedTaskIdsByDay?.[dayKey(dayIndex)] ?? [];
}

function dayKey(dayIndex: number) {
  return String(dayIndex);
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

function tasksForProgram(program: Program): ProgramDayTask[] {
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
