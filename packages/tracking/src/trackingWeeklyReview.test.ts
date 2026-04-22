import { describe, expect, it } from "vitest";
import { createSymptomCheckinValue } from "@pmhc/safety";
import type { LogEntry, ProgramHistoryEntry } from "@pmhc/types";
import { buildTrackingWeeklyReview } from "./trackingWeeklyReview";

const now = new Date("2026-04-21T12:00:00.000Z");

function logEntry(overrides: Partial<LogEntry>): LogEntry {
  return {
    id: "log-1",
    type: "confidence",
    value: 6,
    occurredAt: "2026-04-20T09:00:00.000Z",
    source: "manual",
    ...overrides,
  };
}

function historyEntry(overrides: Partial<ProgramHistoryEntry>): ProgramHistoryEntry {
  return {
    id: "confidence-reset-14:2026-04-20T12:00:00.000Z",
    programId: "confidence-reset-14",
    completionState: "mixed_finish",
    reasonTitle: "Build your baseline",
    completedDays: 9,
    restDays: 2,
    skippedDays: 3,
    completedAt: "2026-04-20T12:00:00.000Z",
    nextProgramId: "clarity-baseline-7",
    ...overrides,
  };
}

describe("tracking weekly review", () => {
  it("stays in baseline-building mode when there is still very little signal", () => {
    expect(buildTrackingWeeklyReview([logEntry({ value: 6 })], [], now)).toMatchObject({
      tone: "baseline_building",
      reason: "low_data",
      nextStep: "log_two_scores",
      logsInWeek: 1,
      scoreLogsInWeek: 1,
      symptomLogsInWeek: 0,
      latestProgramId: null,
    });
  });

  it("switches to recovery-first when a symptom red flag is present", () => {
    expect(
      buildTrackingWeeklyReview(
        [
          logEntry({ id: "confidence-1", value: 7 }),
          logEntry({
            id: "symptom-1",
            type: "symptom_checkin",
            value: createSymptomCheckinValue("pain"),
          }),
        ],
        [],
        now,
      ),
    ).toMatchObject({
      tone: "recovery",
      reason: "symptom_caution",
      nextStep: "protect_recovery",
      logsInWeek: 2,
      scoreLogsInWeek: 1,
      symptomLogsInWeek: 1,
    });
  });

  it("keeps the week lighter when sleep or energy dip", () => {
    expect(
      buildTrackingWeeklyReview(
        [
          logEntry({ id: "sleep-older", type: "sleep_quality", value: 7, occurredAt: "2026-04-18T09:00:00.000Z" }),
          logEntry({ id: "sleep-latest", type: "sleep_quality", value: 4, occurredAt: "2026-04-20T09:00:00.000Z" }),
          logEntry({ id: "energy-latest", type: "energy", value: 4, occurredAt: "2026-04-20T10:00:00.000Z" }),
        ],
        [],
        now,
      ),
    ).toMatchObject({
      tone: "recovery",
      reason: "sleep_dip",
      nextStep: "protect_recovery",
    });
  });

  it("recognizes steadier recent cycle history", () => {
    expect(
      buildTrackingWeeklyReview(
        [],
        [
          historyEntry({
            id: "pelvic-floor-starter:2026-04-21T12:00:00.000Z",
            programId: "pelvic-floor-starter",
            completionState: "steady_finish",
            completedDays: 14,
            restDays: 0,
            skippedDays: 0,
          }),
          historyEntry({
            id: "confidence-reset-14:2026-04-19T12:00:00.000Z",
            completionState: "mixed_finish",
            completedAt: "2026-04-19T12:00:00.000Z",
          }),
        ],
        now,
      ),
    ).toMatchObject({
      tone: "steady",
      reason: "program_stability",
      nextStep: "keep_consistency",
      latestProgramId: "pelvic-floor-starter",
    });
  });

  it("prefers a shorter rebuild when recent cycles are still mixed", () => {
    expect(
      buildTrackingWeeklyReview(
        [],
        [
          historyEntry({ id: "mixed-1", programId: "confidence-reset-14" }),
          historyEntry({
            id: "mixed-2",
            programId: "sleep-environment-reset",
            completedAt: "2026-04-19T12:00:00.000Z",
          }),
        ],
        now,
      ),
    ).toMatchObject({
      tone: "baseline_building",
      reason: "program_rebuild",
      nextStep: "repeat_small_loop",
      latestProgramId: "confidence-reset-14",
    });
  });
});
