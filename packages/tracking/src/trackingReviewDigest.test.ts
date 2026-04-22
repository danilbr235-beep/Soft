import { describe, expect, it } from "vitest";
import { createSymptomCheckinValue } from "@pmhc/safety";
import type { LogEntry, ProgramHistoryEntry } from "@pmhc/types";
import { buildTrackingReviewDigest } from "./trackingReviewDigest";

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

describe("tracking review digest", () => {
  it("stays low-confidence when there is still very little signal", () => {
    expect(buildTrackingReviewDigest([logEntry({ value: 6 })], [], now)).toMatchObject({
      tone: "baseline_building",
      reason: "collect_more_signal",
      confidence: "low",
      nextStep: "log_two_scores",
    });
  });

  it("moves to high-confidence recovery when caution signals align", () => {
    expect(
      buildTrackingReviewDigest(
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
      reason: "protect_recovery_now",
      confidence: "high",
      nextStep: "protect_recovery",
    });
  });

  it("recognizes when stability is holding across reviews", () => {
    expect(
      buildTrackingReviewDigest(
        [
          logEntry({ id: "confidence-old", value: 6, occurredAt: "2026-04-05T09:00:00.000Z" }),
          logEntry({ id: "confidence-new", value: 7, occurredAt: "2026-04-20T09:00:00.000Z" }),
          logEntry({ id: "sleep-old", type: "sleep_quality", value: 6, occurredAt: "2026-04-06T09:00:00.000Z" }),
          logEntry({ id: "sleep-new", type: "sleep_quality", value: 6, occurredAt: "2026-04-19T09:00:00.000Z" }),
          logEntry({ id: "energy-old", type: "energy", value: 5, occurredAt: "2026-04-07T09:00:00.000Z" }),
          logEntry({ id: "energy-new", type: "energy", value: 6, occurredAt: "2026-04-18T09:00:00.000Z" }),
          logEntry({ id: "libido-old", type: "libido", value: 5, occurredAt: "2026-04-08T09:00:00.000Z" }),
          logEntry({ id: "libido-new", type: "libido", value: 6, occurredAt: "2026-04-17T09:00:00.000Z" }),
        ],
        [
          historyEntry({
            id: "pelvic-floor-starter:2026-04-20T12:00:00.000Z",
            programId: "pelvic-floor-starter",
            completionState: "steady_finish",
            completedDays: 14,
            restDays: 0,
            skippedDays: 0,
          }),
        ],
        now,
      ),
    ).toMatchObject({
      tone: "steady",
      reason: "stability_is_holding",
      confidence: "high",
      nextStep: "keep_consistency",
      latestProgramId: "pelvic-floor-starter",
    });
  });

  it("keeps a short rebuild bias when cycle history is still mixed", () => {
    expect(
      buildTrackingReviewDigest(
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
      reason: "short_rebuild_still_fits",
      confidence: "medium",
      nextStep: "repeat_small_loop",
    });
  });
});
