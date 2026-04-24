import { describe, expect, it } from "vitest";
import type { LogEntry, ProgramHistoryEntry } from "@pmhc/types";
import { buildReviewSignalChange } from "./reviewSignalChange";

const now = new Date("2026-04-23T12:00:00.000Z");

describe("buildReviewSignalChange", () => {
  it("surfaces a recovery shift when symptoms and recovery scores worsen", () => {
    const logs: LogEntry[] = [
      createScoreLog("sleep_quality", 3, "2026-04-22T08:00:00.000Z"),
      createScoreLog("energy", 4, "2026-04-21T08:00:00.000Z"),
      createSymptomLog("2026-04-20T08:00:00.000Z"),
      createScoreLog("sleep_quality", 7, "2026-04-13T08:00:00.000Z"),
      createScoreLog("energy", 7, "2026-04-12T08:00:00.000Z"),
    ];

    const result = buildReviewSignalChange({
      language: "en",
      logs,
      now,
      programHistory: [],
    });

    expect(result.toneId).toBe("recovery");
    expect(result.reasonId).toBe("recovery_shift");
    expect(result.changeLines[0]).toContain("Symptoms:");
    expect(result.changeLines.some((line) => line.includes("Sleep:"))).toBe(true);
  });

  it("treats more usable signal as a building week", () => {
    const logs: LogEntry[] = [
      createScoreLog("confidence", 7, "2026-04-22T08:00:00.000Z"),
      createScoreLog("confidence", 6, "2026-04-21T08:00:00.000Z"),
      createScoreLog("energy", 6, "2026-04-20T08:00:00.000Z"),
    ];

    const result = buildReviewSignalChange({
      language: "en",
      logs,
      now,
      programHistory: [],
    });

    expect(result.toneId).toBe("building");
    expect(result.reasonId).toBe("more_signal");
    expect(result.changeLines.some((line) => line.includes("Confidence:"))).toBe(true);
    expect(result.meta).toContain("This week: 3 logs");
  });

  it("returns a steady read when the two weeks look almost the same", () => {
    const logs: LogEntry[] = [
      createScoreLog("confidence", 6, "2026-04-22T08:00:00.000Z"),
      createScoreLog("confidence", 6, "2026-04-15T18:00:00.000Z"),
    ];
    const programHistory: ProgramHistoryEntry[] = [];

    const result = buildReviewSignalChange({
      language: "en",
      logs,
      now,
      programHistory,
    });

    expect(result.toneId).toBe("steady");
    expect(result.reasonId).toBe("little_changed");
    expect(result.changeLines).toEqual(["No strong difference between the last two weeks yet."]);
  });
});

function createScoreLog(
  type: "sleep_quality" | "energy" | "confidence" | "libido",
  value: number,
  occurredAt: string,
): LogEntry {
  return {
    id: `${type}-${occurredAt}`,
    type,
    value,
    occurredAt,
    source: "manual",
  };
}

function createSymptomLog(occurredAt: string): LogEntry {
  return {
    id: `symptom-${occurredAt}`,
    type: "symptom_checkin",
    value: {
      severity: "moderate",
      pain: true,
      numbness: false,
      blood: false,
      injuryConcern: false,
    },
    occurredAt,
    source: "manual",
  };
}
