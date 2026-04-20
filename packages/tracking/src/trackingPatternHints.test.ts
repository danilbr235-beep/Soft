import { describe, expect, it } from "vitest";
import type { LogEntry } from "@pmhc/types";
import { buildTrackingPatternHints } from "./trackingPatternHints";

const now = new Date("2026-04-20T12:00:00.000Z");

describe("buildTrackingPatternHints", () => {
  it("finds conservative same-direction weekly movement across paired score days", () => {
    const logs: LogEntry[] = [
      { id: "sleep-1", type: "sleep_quality", value: 4, occurredAt: "2026-04-17T08:00:00.000Z", source: "manual" },
      { id: "energy-1", type: "energy", value: 3, occurredAt: "2026-04-17T09:00:00.000Z", source: "manual" },
      { id: "sleep-2", type: "sleep_quality", value: 6, occurredAt: "2026-04-18T08:00:00.000Z", source: "manual" },
      { id: "energy-2", type: "energy", value: 5, occurredAt: "2026-04-18T09:00:00.000Z", source: "manual" },
      { id: "sleep-3", type: "sleep_quality", value: 8, occurredAt: "2026-04-19T08:00:00.000Z", source: "manual" },
      { id: "energy-3", type: "energy", value: 7, occurredAt: "2026-04-19T09:00:00.000Z", source: "manual" },
    ];

    expect(buildTrackingPatternHints(logs, now)[0]).toMatchObject({
      id: "sleep_energy",
      status: "observed",
      primaryType: "sleep_quality",
      comparisonType: "energy",
      direction: "together",
      overlappingDays: 3,
      confidence: "medium",
    });
  });

  it("returns a low-data fallback when paired recent days are not enough", () => {
    const logs: LogEntry[] = [
      { id: "old-sleep", type: "sleep_quality", value: 9, occurredAt: "2026-04-01T08:00:00.000Z", source: "manual" },
      { id: "old-energy", type: "energy", value: 9, occurredAt: "2026-04-01T09:00:00.000Z", source: "manual" },
      { id: "confidence-only", type: "confidence", value: 7, occurredAt: "2026-04-19T09:00:00.000Z", source: "manual" },
    ];

    expect(buildTrackingPatternHints(logs, now)).toEqual([
      {
        id: "low_data",
        status: "low_data",
        primaryType: null,
        comparisonType: null,
        direction: "unknown",
        overlappingDays: 0,
        confidence: "low",
      },
    ]);
  });

  it("does not encode causal, diagnostic, or guaranteed language", () => {
    const text = JSON.stringify(buildTrackingPatternHints([], now));

    expect(text).not.toMatch(/\b(cause|caused|diagnose|treat|guarantee|proves?)\b/i);
  });
});
