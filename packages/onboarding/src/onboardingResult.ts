import type { OnboardingDraft, OnboardingResult, Program } from "@pmhc/types";

export const starterPrograms: Record<string, Program> = {
  confidence: {
    id: "confidence-reset-14",
    title: "14-day confidence reset",
    category: "confidence",
    durationDays: 14,
    dayIndex: 1,
  },
  pelvicFloor: {
    id: "pelvic-floor-starter",
    title: "Pelvic floor consistency starter",
    category: "pelvic_floor",
    durationDays: 14,
    dayIndex: 1,
  },
  recovery: {
    id: "clarity-baseline-7",
    title: "7-day clarity baseline",
    category: "recovery",
    durationDays: 7,
    dayIndex: 1,
  },
  sleep: {
    id: "sleep-environment-reset",
    title: "Sleep and environment reset",
    category: "sleep",
    durationDays: 14,
    dayIndex: 1,
  },
  conservative: {
    id: "conservative-recovery",
    title: "Conservative recovery mode",
    category: "recovery",
    durationDays: 7,
    dayIndex: 1,
  },
};

export function createOnboardingResult(
  draft: OnboardingDraft,
  completedAt = new Date().toISOString(),
): OnboardingResult {
  const conservativeGuidance = draft.redFlags.length > 0;

  return {
    profile: {
      id: "local-user",
      language: draft.language,
      mode: draft.mode,
      primaryGoal: draft.primaryGoal,
      secondaryGoals: draft.secondaryGoals,
      conservativeGuidance,
    },
    baseline: draft.baseline,
    privacy: {
      vaultLockEnabled: draft.privacy.vaultLockEnabled ?? false,
      discreetNotifications: draft.privacy.discreetNotifications ?? true,
    },
    contentPreferences: {
      language: draft.language,
      autoTranslate: draft.language === "ru",
    },
    recommendedProgram: conservativeGuidance ? starterPrograms.conservative : chooseProgram(draft),
    completedAt,
  };
}

function chooseProgram(draft: OnboardingDraft): Program {
  if (draft.primaryGoal === "pelvic_floor") {
    return starterPrograms.pelvicFloor;
  }

  if (draft.primaryGoal === "sleep_environment") {
    return starterPrograms.sleep;
  }

  if (draft.primaryGoal === "recovery" || draft.primaryGoal === "tracking") {
    return starterPrograms.recovery;
  }

  return starterPrograms.confidence;
}
