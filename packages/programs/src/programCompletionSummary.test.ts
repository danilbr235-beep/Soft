import { describe, expect, it } from "vitest";
import type { Alert, CurrentPriority, ProgramProgressSummary } from "@pmhc/types";
import { buildProgramCompletionSummary } from "./programCompletionSummary";

const baselinePriority = {
  domain: "baseline",
  title: "Build your baseline",
  whyItMatters: "More calm signal comes before stronger conclusions.",
  recommendedAction: "Start with one small signal.",
  confidence: "low",
} satisfies CurrentPriority;

const completedSummary = {
  completedDays: 12,
  restDays: 2,
  skippedDays: 0,
  remainingDays: 0,
  resolvedDays: 14,
  totalDays: 14,
  paused: false,
} satisfies ProgramProgressSummary;

describe("program completion summary", () => {
  it("returns null until the program is fully resolved", () => {
    expect(
      buildProgramCompletionSummary({
        alerts: [],
        currentPriority: baselinePriority,
        progressSummary: {
          ...completedSummary,
          remainingDays: 1,
          resolvedDays: 13,
        },
      }),
    ).toBeNull();
  });

  it("uses a steady-finish summary when the cycle closes without caution signals", () => {
    expect(
      buildProgramCompletionSummary({
        alerts: [],
        currentPriority: {
          ...baselinePriority,
          domain: "confidence",
          title: "Confidence feels steadier",
          confidence: "medium",
        },
        progressSummary: completedSummary,
      }),
    ).toMatchObject({
      state: "steady_finish",
      nextStep: "choose_next_light",
      reasonTitle: "Confidence feels steadier",
    });
  });

  it("uses a mixed-finish summary when skipped days were needed", () => {
    expect(
      buildProgramCompletionSummary({
        alerts: [],
        currentPriority: baselinePriority,
        progressSummary: {
          ...completedSummary,
          completedDays: 9,
          restDays: 2,
          skippedDays: 3,
        },
      }),
    ).toMatchObject({
      state: "mixed_finish",
      nextStep: "rebuild_baseline",
      reasonTitle: "Build your baseline",
    });
  });

  it("uses a recovery-finish summary when safety or recovery signals are present", () => {
    const alert = {
      id: "symptom-review",
      severity: "high_priority",
      title: "Symptom review recommended",
      message: "Keep today conservative",
      module: "safety",
    } satisfies Alert;

    expect(
      buildProgramCompletionSummary({
        alerts: [alert],
        currentPriority: {
          ...baselinePriority,
          domain: "recovery",
          title: "Recovery comes first",
          confidence: "medium",
        },
        progressSummary: {
          ...completedSummary,
          completedDays: 8,
          restDays: 4,
          skippedDays: 2,
        },
      }),
    ).toMatchObject({
      state: "recovery_finish",
      nextStep: "keep_recovery_light",
      reasonTitle: "Symptom review recommended",
    });
  });
});
