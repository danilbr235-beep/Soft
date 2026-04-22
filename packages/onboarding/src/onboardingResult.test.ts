import { describe, expect, it } from "vitest";
import { createOnboardingResult, getStarterProgramById } from "./onboardingResult";
import type { OnboardingDraft } from "@pmhc/types";

const draft: OnboardingDraft = {
  primaryGoal: "sexual_confidence",
  secondaryGoals: ["recovery", "tracking"],
  mode: "Simple",
  baseline: {
    sleep: 5,
    energy: 4,
    confidence: 3,
    libido: 4,
    stress: 7,
  },
  redFlags: [],
  privacy: {
    vaultLockEnabled: true,
  },
  language: "ru",
};

describe("createOnboardingResult", () => {
  it("creates a stable profile and recommended starter program", () => {
    const result = createOnboardingResult(draft, "2026-04-19T10:00:00Z");

    expect(result.profile.primaryGoal).toBe("sexual_confidence");
    expect(result.profile.mode).toBe("Simple");
    expect(result.profile.conservativeGuidance).toBe(false);
    expect(result.privacy.vaultLockEnabled).toBe(true);
    expect(result.privacy.discreetNotifications).toBe(true);
    expect(result.contentPreferences.autoTranslate).toBe(true);
    expect(result.recommendedProgram.id).toBe("confidence-reset-14");
  });

  it("routes pelvic floor goal to pelvic floor starter", () => {
    const result = createOnboardingResult({
      ...draft,
      primaryGoal: "pelvic_floor",
      secondaryGoals: ["recovery"],
    });

    expect(result.recommendedProgram.id).toBe("pelvic-floor-starter");
    expect(result.recommendedProgram.category).toBe("pelvic_floor");
  });

  it("enables conservative guidance when red flags are present", () => {
    const result = createOnboardingResult({
      ...draft,
      redFlags: ["persistent_pain"],
    });

    expect(result.profile.conservativeGuidance).toBe(true);
    expect(result.recommendedProgram.id).toBe("conservative-recovery");
  });

  it("can look up a starter program by id for later cycle switches", () => {
    expect(getStarterProgramById("sleep-environment-reset")).toMatchObject({
      id: "sleep-environment-reset",
      category: "sleep",
      durationDays: 14,
      dayIndex: 1,
    });
    expect(getStarterProgramById("missing-program")).toBeNull();
  });
});
