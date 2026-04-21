import { describe, expect, it } from "vitest";
import type { Program, ProgramProgressSummary } from "@pmhc/types";
import { buildProgramNextPaths } from "./programNextPaths";

const confidenceProgram = {
  id: "confidence-reset-14",
  title: "14-day confidence reset",
  category: "confidence",
  durationDays: 14,
  dayIndex: 14,
} satisfies Program;

const conservativeRecoveryProgram = {
  id: "conservative-recovery",
  title: "Conservative recovery mode",
  category: "recovery",
  durationDays: 7,
  dayIndex: 7,
} satisfies Program;

const completedSummary = {
  completedDays: 12,
  restDays: 2,
  skippedDays: 0,
  remainingDays: 0,
  resolvedDays: 14,
  totalDays: 14,
  paused: false,
} satisfies ProgramProgressSummary;

describe("program next paths", () => {
  it("recommends a light next layer after a steady finish", () => {
    expect(
      buildProgramNextPaths({
        activeProgram: confidenceProgram,
        completionState: "steady_finish",
        progressSummary: completedSummary,
      }),
    ).toEqual([
      {
        programId: "pelvic-floor-starter",
        priority: "primary",
        reason: "body_consistency",
      },
      {
        programId: "sleep-environment-reset",
        priority: "secondary",
        reason: "sleep_support",
      },
    ]);
  });

  it("leans back to baseline-building after a mixed finish", () => {
    expect(
      buildProgramNextPaths({
        activeProgram: confidenceProgram,
        completionState: "mixed_finish",
        progressSummary: {
          ...completedSummary,
          completedDays: 9,
          restDays: 2,
          skippedDays: 3,
        },
      }),
    ).toEqual([
      {
        programId: "clarity-baseline-7",
        priority: "primary",
        reason: "baseline_rebuild",
      },
      {
        programId: "sleep-environment-reset",
        priority: "secondary",
        reason: "sleep_support",
      },
    ]);
  });

  it("keeps recovery-first options when the cycle ends under caution", () => {
    expect(
      buildProgramNextPaths({
        activeProgram: conservativeRecoveryProgram,
        completionState: "recovery_finish",
        progressSummary: {
          ...completedSummary,
          completedDays: 4,
          restDays: 2,
          skippedDays: 1,
          totalDays: 7,
          resolvedDays: 7,
        },
      }),
    ).toEqual([
      {
        programId: "sleep-environment-reset",
        priority: "primary",
        reason: "sleep_support",
      },
      {
        programId: "clarity-baseline-7",
        priority: "secondary",
        reason: "baseline_rebuild",
      },
    ]);
  });
});
