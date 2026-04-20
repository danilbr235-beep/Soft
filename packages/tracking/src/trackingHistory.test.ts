import { describe, expect, it } from "vitest";
import { createSymptomCheckinValue } from "@pmhc/safety";
import type { LogEntry } from "@pmhc/types";
import {
  buildTrackingExport,
  deleteTrackingLog,
  filterTrackingLogs,
  updateTrackingLogValue,
} from "./trackingHistory";

const logs: LogEntry[] = [
  { id: "routine", type: "pelvic_floor_done", value: true, occurredAt: "2026-04-19T10:00:00.000Z", source: "manual" },
  { id: "symptom", type: "symptom_checkin", value: createSymptomCheckinValue("pain"), occurredAt: "2026-04-19T09:00:00.000Z", source: "manual" },
  { id: "confidence", type: "confidence", value: 7, occurredAt: "2026-04-19T08:00:00.000Z", source: "manual" },
  { id: "energy", type: "energy", value: 5, occurredAt: "2026-04-18T08:00:00.000Z", source: "manual" },
];

describe("tracking history helpers", () => {
  it("filters logs into score, symptom, and routine groups while keeping newest first", () => {
    expect(filterTrackingLogs(logs, "all").map((log) => log.id)).toEqual(["routine", "symptom", "confidence", "energy"]);
    expect(filterTrackingLogs(logs, "scores").map((log) => log.id)).toEqual(["confidence", "energy"]);
    expect(filterTrackingLogs(logs, "symptoms").map((log) => log.id)).toEqual(["symptom"]);
    expect(filterTrackingLogs(logs, "routines").map((log) => log.id)).toEqual(["routine"]);
  });

  it("updates one log value without mutating the original history", () => {
    const updated = updateTrackingLogValue(logs, "confidence", 10);

    expect(updated.find((log) => log.id === "confidence")?.value).toBe(10);
    expect(logs.find((log) => log.id === "confidence")?.value).toBe(7);
    expect(updated.find((log) => log.id === "energy")?.value).toBe(5);
  });

  it("deletes one log and keeps the remaining log order stable", () => {
    expect(deleteTrackingLog(logs, "symptom").map((log) => log.id)).toEqual(["routine", "confidence", "energy"]);
  });

  it("builds a portable local export payload for the selected history", () => {
    const filtered = filterTrackingLogs(logs, "scores");
    const exported = buildTrackingExport(filtered, "2026-04-20T10:00:00.000Z", "scores");

    expect(exported).toEqual({
      version: 1,
      generatedAt: "2026-04-20T10:00:00.000Z",
      filter: "scores",
      totalLogs: 2,
      logs: filtered,
    });
  });
});
