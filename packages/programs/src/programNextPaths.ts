import type { Program, ProgramCompletionState, ProgramProgressSummary } from "@pmhc/types";
import type { ProgramDigestNextStep, ProgramDigestTone } from "./programAdjustments";

const knownProgramIds = [
  "confidence-reset-14",
  "pelvic-floor-starter",
  "clarity-baseline-7",
  "sleep-environment-reset",
  "conservative-recovery",
] as const;

export type ProgramNextPathId = (typeof knownProgramIds)[number];
export type ProgramNextPathReason =
  | "baseline_rebuild"
  | "sleep_support"
  | "body_consistency"
  | "confidence_layer"
  | "recovery_guardrail";
export type ProgramNextPathPriority = "primary" | "secondary";

export type ProgramNextPathRecommendation = {
  programId: ProgramNextPathId;
  priority: ProgramNextPathPriority;
  reason: ProgramNextPathReason;
  guidedByDigest: boolean;
};

type BuildProgramNextPathsArgs = {
  activeProgram: Program;
  completionState: ProgramCompletionState;
  digestNextStep?: ProgramDigestNextStep | null;
  digestTone?: ProgramDigestTone | null;
  progressSummary: ProgramProgressSummary;
};

const fallbackOrder: ProgramNextPathId[] = [
  "clarity-baseline-7",
  "sleep-environment-reset",
  "pelvic-floor-starter",
  "confidence-reset-14",
  "conservative-recovery",
];

const steadyFinishOrder: Record<ProgramNextPathId, ProgramNextPathId[]> = {
  "confidence-reset-14": ["pelvic-floor-starter", "sleep-environment-reset"],
  "pelvic-floor-starter": ["confidence-reset-14", "sleep-environment-reset"],
  "clarity-baseline-7": ["confidence-reset-14", "sleep-environment-reset"],
  "sleep-environment-reset": ["confidence-reset-14", "pelvic-floor-starter"],
  "conservative-recovery": ["clarity-baseline-7", "sleep-environment-reset"],
};

const reasonByProgramId: Record<ProgramNextPathId, ProgramNextPathReason> = {
  "confidence-reset-14": "confidence_layer",
  "pelvic-floor-starter": "body_consistency",
  "clarity-baseline-7": "baseline_rebuild",
  "sleep-environment-reset": "sleep_support",
  "conservative-recovery": "recovery_guardrail",
};

export function buildProgramNextPaths(
  args: BuildProgramNextPathsArgs,
): ProgramNextPathRecommendation[] {
  const { activeProgram, completionState, digestNextStep = null, digestTone = null, progressSummary } = args;
  const digestPreferredIds = getDigestPreferredProgramIds(digestTone, digestNextStep);
  const orderedIds = finalizeRecommendations(
    [...digestPreferredIds, ...getPreferredProgramIds(activeProgram.id, completionState, progressSummary)],
    activeProgram.id,
  ).slice(0, 2);

  return orderedIds.map((programId, index) => ({
    programId,
    priority: index === 0 ? "primary" : "secondary",
    reason: reasonByProgramId[programId],
    guidedByDigest: digestPreferredIds.includes(programId),
  }));
}

function getPreferredProgramIds(
  activeProgramId: string,
  completionState: ProgramCompletionState,
  progressSummary: ProgramProgressSummary,
): ProgramNextPathId[] {
  if (completionState === "steady_finish") {
    return steadyFinishOrder[normalizeProgramId(activeProgramId)];
  }

  if (completionState === "mixed_finish") {
    return progressSummary.restDays > progressSummary.skippedDays
      ? ["sleep-environment-reset", "clarity-baseline-7"]
      : ["clarity-baseline-7", "sleep-environment-reset"];
  }

  return ["conservative-recovery", "sleep-environment-reset"];
}

function finalizeRecommendations(
  preferredIds: ProgramNextPathId[],
  activeProgramId: string,
): ProgramNextPathId[] {
  const nextIds: ProgramNextPathId[] = [];

  for (const programId of [...preferredIds, ...fallbackOrder]) {
    if (programId === activeProgramId || nextIds.includes(programId)) {
      continue;
    }

    nextIds.push(programId);
  }

  return nextIds;
}

function getDigestPreferredProgramIds(
  digestTone: ProgramDigestTone | null,
  digestNextStep: ProgramDigestNextStep | null,
): ProgramNextPathId[] {
  if (digestTone === "recovery" || digestNextStep === "protect_recovery") {
    return ["sleep-environment-reset", "conservative-recovery"];
  }

  if (
    digestTone === "baseline_building" ||
    digestNextStep === "log_two_scores" ||
    digestNextStep === "repeat_small_loop"
  ) {
    return ["clarity-baseline-7", "sleep-environment-reset"];
  }

  return [];
}

function normalizeProgramId(programId: string): ProgramNextPathId {
  return knownProgramIds.includes(programId as ProgramNextPathId)
    ? (programId as ProgramNextPathId)
    : "clarity-baseline-7";
}
