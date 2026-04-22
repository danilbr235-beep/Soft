import { describe, expect, it } from "vitest";
import type { ProgramHistoryEntry } from "@pmhc/types";
import { buildProgramReview } from "./programReview";

const mixedEntry = {
  id: "confidence-reset-14:2026-04-21T12:00:00.000Z",
  programId: "confidence-reset-14",
  completionState: "mixed_finish",
  reasonTitle: "Build your baseline",
  completedDays: 9,
  restDays: 2,
  skippedDays: 3,
  completedAt: "2026-04-21T12:00:00.000Z",
  nextProgramId: "clarity-baseline-7",
} satisfies ProgramHistoryEntry;

describe("program review", () => {
  it("returns null without history", () => {
    expect(buildProgramReview([])).toBeNull();
  });

  it("prefers a recovery-first read when the latest cycle ended cautiously", () => {
    expect(
      buildProgramReview([
        {
          ...mixedEntry,
          id: "conservative-recovery:2026-04-22T12:00:00.000Z",
          programId: "conservative-recovery",
          completionState: "recovery_finish",
          skippedDays: 1,
        },
        mixedEntry,
      ]),
    ).toMatchObject({
      cycleCount: 2,
      leadingState: "recovery_finish",
      focus: "protect_recovery",
      latestProgramId: "conservative-recovery",
    });
  });

  it("leans toward baseline rebuild when skipped days keep showing up", () => {
    expect(
      buildProgramReview([
        mixedEntry,
        {
          ...mixedEntry,
          id: "sleep-environment-reset:2026-04-20T12:00:00.000Z",
          programId: "sleep-environment-reset",
          nextProgramId: "confidence-reset-14",
        },
      ]),
    ).toMatchObject({
      cycleCount: 2,
      leadingState: "mixed_finish",
      focus: "rebuild_with_short_cycles",
      totalSkippedDays: 6,
    });
  });

  it("builds on steadier history when recent cycles closed cleanly", () => {
    expect(
      buildProgramReview([
        {
          ...mixedEntry,
          id: "pelvic-floor-starter:2026-04-22T12:00:00.000Z",
          programId: "pelvic-floor-starter",
          completionState: "steady_finish",
          completedDays: 14,
          restDays: 0,
          skippedDays: 0,
        },
        {
          ...mixedEntry,
          id: "sleep-environment-reset:2026-04-20T12:00:00.000Z",
          programId: "sleep-environment-reset",
          completionState: "steady_finish",
          completedDays: 12,
          restDays: 2,
          skippedDays: 0,
        },
      ]),
    ).toMatchObject({
      cycleCount: 2,
      leadingState: "steady_finish",
      focus: "build_on_stability",
      totalCompletedDays: 26,
    });
  });
});
