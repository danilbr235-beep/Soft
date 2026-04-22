import { describe, expect, it } from "vitest";
import type { Program, ProgramProgressSummary } from "@pmhc/types";
import { appendProgramHistory, createProgramHistoryEntry } from "./programHistory";

const activeProgram = {
  id: "confidence-reset-14",
  title: "14-day confidence reset",
  category: "confidence",
  durationDays: 14,
  dayIndex: 14,
} satisfies Program;

const progressSummary = {
  completedDays: 9,
  restDays: 2,
  skippedDays: 3,
  remainingDays: 0,
  resolvedDays: 14,
  totalDays: 14,
  paused: false,
} satisfies ProgramProgressSummary;

describe("program history", () => {
  it("creates a stable history entry from a finished cycle", () => {
    expect(
      createProgramHistoryEntry({
        activeProgram,
        completionState: "mixed_finish",
        completedAt: "2026-04-21T12:00:00.000Z",
        nextProgramId: "clarity-baseline-7",
        progressSummary,
        reasonTitle: "Build your baseline",
      }),
    ).toEqual({
      id: "confidence-reset-14:2026-04-21T12:00:00.000Z",
      programId: "confidence-reset-14",
      completionState: "mixed_finish",
      reasonTitle: "Build your baseline",
      completedDays: 9,
      restDays: 2,
      skippedDays: 3,
      completedAt: "2026-04-21T12:00:00.000Z",
      nextProgramId: "clarity-baseline-7",
    });
  });

  it("prepends the latest cycle and deduplicates by id", () => {
    const older = createProgramHistoryEntry({
      activeProgram,
      completionState: "mixed_finish",
      completedAt: "2026-04-20T12:00:00.000Z",
      progressSummary,
      reasonTitle: "Build your baseline",
    });
    const latest = createProgramHistoryEntry({
      activeProgram,
      completionState: "steady_finish",
      completedAt: "2026-04-21T12:00:00.000Z",
      progressSummary: {
        ...progressSummary,
        completedDays: 12,
        restDays: 2,
        skippedDays: 0,
      },
      reasonTitle: "Confidence feels steadier",
    });

    expect(appendProgramHistory([older, latest], latest)).toEqual([latest, older]);
  });
});
