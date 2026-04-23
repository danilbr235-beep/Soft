import { describe, expect, it } from "vitest";
import type { QuickLogDefinition } from "@pmhc/types";
import { buildTodayQuickLogSurface } from "./todayQuickLogs";

const logs: QuickLogDefinition[] = [
  { type: "morning_erection", label: "Morning", input: "boolean" },
  { type: "libido", label: "Libido", input: "score" },
  { type: "confidence", label: "Confidence", input: "score" },
  { type: "symptom_checkin", label: "Symptoms", input: "symptom" },
];

describe("buildTodayQuickLogSurface", () => {
  it("keeps the original quick logs when lighter day is off", () => {
    const surface = buildTodayQuickLogSurface({
      daySimplification: {
        active: false,
        actionCardCap: null,
        applyLabel: "Use lighter day",
        canApply: true,
        effectiveTodayMode: "Standard",
        restoreLabel: null,
        source: null,
        statusTitle: null,
        taskCap: null,
      },
      guidanceState: "narrow",
      language: "en",
      logs,
    });

    expect(surface.logs.map((log) => log.type)).toEqual([
      "morning_erection",
      "libido",
      "confidence",
      "symptom_checkin",
    ]);
    expect(surface.noteTitle).toBeNull();
    expect(surface.sheetSubtitle).toBeNull();
  });

  it("narrows a lighter day down to two calm scores first", () => {
    const surface = buildTodayQuickLogSurface({
      daySimplification: {
        active: true,
        actionCardCap: 2,
        applyLabel: null,
        canApply: true,
        effectiveTodayMode: "Light",
        restoreLabel: "Return to full day",
        source: "today",
        statusTitle: "Lighter day is on",
        taskCap: 2,
      },
      guidanceState: "narrow",
      language: "en",
      logs,
    });

    expect(surface.logs.map((log) => log.type)).toEqual(["confidence", "libido"]);
    expect(surface.noteTitle).toBe("Keep to two calm scores");
    expect(surface.noteMeta).toBe("Showing 2 of 4 quick logs today.");
  });

  it("keeps the morning log first when the morning rail still needs attention", () => {
    const surface = buildTodayQuickLogSurface({
      daySimplification: {
        active: true,
        actionCardCap: 2,
        applyLabel: null,
        canApply: true,
        effectiveTodayMode: "Light",
        restoreLabel: "Return to full day",
        source: "programs",
        statusTitle: "Lighter day is on",
        taskCap: 2,
      },
      guidanceState: "protect_morning",
      language: "en",
      logs,
    });

    expect(surface.logs.map((log) => log.type)).toEqual(["morning_erection", "confidence"]);
    expect(surface.noteBody).toBe("Use one quick morning check-in before opening the rest of the day.");
    expect(surface.sheetSubtitle).toContain("Leave the rest closed");
  });

  it("prioritizes symptom and recovery signals when the day turns recovery-first", () => {
    const recoveryLogs: QuickLogDefinition[] = [
      { type: "sleep_quality", label: "Sleep", input: "score" },
      { type: "energy", label: "Energy", input: "score" },
      { type: "confidence", label: "Confidence", input: "score" },
      { type: "symptom_checkin", label: "Symptoms", input: "symptom" },
      { type: "pump_done", label: "Pump", input: "boolean" },
    ];

    const surface = buildTodayQuickLogSurface({
      daySimplification: {
        active: true,
        actionCardCap: 2,
        applyLabel: null,
        canApply: true,
        effectiveTodayMode: "Light",
        restoreLabel: "Return to full day",
        source: "today",
        statusTitle: "Lighter day is on",
        taskCap: 1,
      },
      guidanceState: "recovery",
      language: "en",
      logs: recoveryLogs,
    });

    expect(surface.logs.map((log) => log.type)).toEqual(["symptom_checkin", "sleep_quality", "energy"]);
    expect(surface.noteTitle).toBe("Keep the check-in conservative");
  });
});
