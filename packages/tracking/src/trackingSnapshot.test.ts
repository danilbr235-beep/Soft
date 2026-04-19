import { describe, expect, it } from "vitest";
import { createSymptomCheckinValue } from "@pmhc/safety";
import type { LogEntry } from "@pmhc/types";
import { buildTrackingSnapshot } from "./trackingSnapshot";

const now = new Date("2026-04-19T12:00:00.000Z");

describe("buildTrackingSnapshot", () => {
  it("summarizes today's logs, recent logs, averages, and trend", () => {
    const logs: LogEntry[] = [
      { id: "energy-today", type: "energy", value: 6, occurredAt: "2026-04-19T09:10:00.000Z", source: "manual" },
      { id: "confidence-today", type: "confidence", value: 7, occurredAt: "2026-04-19T09:00:00.000Z", source: "manual" },
      { id: "confidence-yesterday", type: "confidence", value: 5, occurredAt: "2026-04-18T09:00:00.000Z", source: "manual" },
      { id: "sleep-week", type: "sleep_quality", value: 8, occurredAt: "2026-04-16T09:00:00.000Z", source: "manual" },
      { id: "old-libido", type: "libido", value: 10, occurredAt: "2026-04-01T09:00:00.000Z", source: "manual" },
    ];

    const snapshot = buildTrackingSnapshot(logs, now);
    const confidence = snapshot.scoreSignals.find((signal) => signal.type === "confidence");
    const libido = snapshot.scoreSignals.find((signal) => signal.type === "libido");

    expect(snapshot.logsToday).toBe(2);
    expect(snapshot.logsThisWeek).toBe(4);
    expect(snapshot.latestLogAt).toBe("2026-04-19T09:10:00.000Z");
    expect(confidence).toEqual({
      type: "confidence",
      average: 6,
      latest: 7,
      count: 2,
      trend: "up",
    });
    expect(libido).toMatchObject({
      type: "libido",
      average: null,
      latest: null,
      count: 0,
      trend: "unknown",
    });
  });

  it("flags recent symptom red flags without treating old symptoms as current", () => {
    const logs: LogEntry[] = [
      {
        id: "symptom-recent",
        type: "symptom_checkin",
        value: createSymptomCheckinValue("pain"),
        occurredAt: "2026-04-19T08:00:00.000Z",
        source: "manual",
      },
      {
        id: "symptom-old",
        type: "symptom_checkin",
        value: createSymptomCheckinValue("blood"),
        occurredAt: "2026-04-01T08:00:00.000Z",
        source: "manual",
      },
    ];

    expect(buildTrackingSnapshot(logs, now).hasSafetySignal).toBe(true);
    expect(buildTrackingSnapshot([logs[1]], now).hasSafetySignal).toBe(false);
  });

  it("returns an empty baseline snapshot when there are no logs", () => {
    const snapshot = buildTrackingSnapshot([], now);

    expect(snapshot.logsToday).toBe(0);
    expect(snapshot.logsThisWeek).toBe(0);
    expect(snapshot.latestLogAt).toBeNull();
    expect(snapshot.hasSafetySignal).toBe(false);
    expect(snapshot.scoreSignals.every((signal) => signal.trend === "unknown")).toBe(true);
  });
});
