import { describe, expect, it } from "vitest";
import { createSymptomCheckinValue } from "@pmhc/safety";
import type { LogEntry, ProgramHistoryEntry } from "@pmhc/types";
import { buildTrackingPeriodReview } from "./trackingPeriodReview";

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

describe("tracking period review", () => {
  it("uses a higher low-data threshold for a 30-day read", () => {
    expect(
      buildTrackingPeriodReview(
        [
          logEntry({ id: "log-1", occurredAt: "2026-04-05T09:00:00.000Z" }),
          logEntry({ id: "log-2", type: "energy", occurredAt: "2026-04-11T09:00:00.000Z" }),
          logEntry({ id: "log-3", type: "sleep_quality", occurredAt: "2026-04-17T09:00:00.000Z" }),
        ],
        [],
        30,
        now,
      ),
    ).toMatchObject({
      tone: "baseline_building",
      reason: "low_data",
      nextStep: "log_two_scores",
      logsInPeriod: 3,
      scoreLogsInPeriod: 3,
      cycleCountInPeriod: 0,
    });
  });

  it("keeps the period recovery-first when a symptom red flag exists", () => {
    expect(
      buildTrackingPeriodReview(
        [
          logEntry({ id: "confidence-1", value: 7, occurredAt: "2026-04-05T09:00:00.000Z" }),
          logEntry({
            id: "symptom-1",
            type: "symptom_checkin",
            value: createSymptomCheckinValue("pain"),
            occurredAt: "2026-04-10T09:00:00.000Z",
          }),
        ],
        [],
        30,
        now,
      ),
    ).toMatchObject({
      tone: "recovery",
      reason: "symptom_caution",
      nextStep: "protect_recovery",
      cycleCountInPeriod: 0,
    });
  });

  it("recognizes steadier cycle history inside the review window", () => {
    expect(
      buildTrackingPeriodReview(
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
            completedAt: "2026-04-19T12:00:00.000Z",
          }),
        ],
        30,
        now,
      ),
    ).toMatchObject({
      tone: "steady",
      reason: "program_stability",
      nextStep: "keep_consistency",
      cycleCountInPeriod: 2,
      latestProgramId: "pelvic-floor-starter",
    });
  });

  it("ignores cycles that fall outside the selected window", () => {
    expect(
      buildTrackingPeriodReview(
        [],
        [
          historyEntry({
            id: "old-cycle",
            completedAt: "2026-02-01T12:00:00.000Z",
          }),
        ],
        30,
        now,
      ),
    ).toMatchObject({
      tone: "baseline_building",
      reason: "low_data",
      cycleCountInPeriod: 0,
      latestProgramId: null,
    });
  });
});
