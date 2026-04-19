import { describe, expect, it } from "vitest";
import { buildTodayPayload } from "./todayRules";
import { createSymptomCheckinValue } from "@pmhc/safety";
import type { RuleEngineInput } from "@pmhc/types";

const baseInput: RuleEngineInput = {
  profile: {
    id: "local-user",
    language: "ru",
    mode: "Simple",
    primaryGoal: "sexual_confidence",
    secondaryGoals: ["recovery"],
    conservativeGuidance: false,
  },
  activeProgram: {
    id: "baseline-7",
    title: "7-day clarity baseline",
    category: "recovery",
    durationDays: 7,
    dayIndex: 1,
  },
  latestLogs: [],
  recentAlerts: [],
  contentItems: [],
};

describe("buildTodayPayload", () => {
  it("uses baseline-building priority when there is not enough data", () => {
    const payload = buildTodayPayload(baseInput);

    expect(payload.todayMode).toBe("Light");
    expect(payload.currentPriority.domain).toBe("baseline");
    expect(payload.currentPriority.title).toMatch(/baseline/i);
    expect(payload.currentPriority.confidence).toBe("low");
    expect(payload.quickLogs.map((log) => log.type)).toEqual([
      "morning_erection",
      "libido",
      "confidence",
      "symptom_checkin",
    ]);
  });

  it("promotes recovery and sleep when sleep is repeatedly low", () => {
    const payload = buildTodayPayload({
      ...baseInput,
      latestLogs: [
        { id: "sleep-1", type: "sleep_quality", value: 3, occurredAt: "2026-04-17T07:00:00Z", source: "manual" },
        { id: "sleep-2", type: "sleep_quality", value: 4, occurredAt: "2026-04-18T07:00:00Z", source: "manual" },
        { id: "sleep-3", type: "sleep_quality", value: 3, occurredAt: "2026-04-19T07:00:00Z", source: "manual" },
      ],
    });

    expect(payload.currentPriority.domain).toBe("recovery");
    expect(payload.alerts.some((alert) => alert.severity === "caution")).toBe(true);
    expect(payload.actionCards[0].kind).toBe("Practice");
  });

  it("uses conservative alerts when symptom red flags are present", () => {
    const payload = buildTodayPayload({
      ...baseInput,
      profile: { ...baseInput.profile, conservativeGuidance: true },
      latestLogs: [
        {
          id: "symptom-1",
          type: "symptom_checkin",
          value: createSymptomCheckinValue("pain"),
          occurredAt: "2026-04-19T08:00:00Z",
          source: "manual",
        },
      ],
    });

    expect(payload.currentPriority.domain).toBe("safety");
    expect(payload.alerts.map((alert) => alert.severity)).toContain("medical_attention");
    expect(payload.currentPriority.avoidToday).toMatch(/intense|aggressive/i);
  });

  it("suppresses aggressive practice after a pump log", () => {
    const payload = buildTodayPayload({
      ...baseInput,
      latestLogs: [
        { id: "confidence-1", type: "confidence", value: 6, occurredAt: "2026-04-19T07:00:00Z", source: "manual" },
        { id: "libido-1", type: "libido", value: 6, occurredAt: "2026-04-19T07:01:00Z", source: "manual" },
        { id: "pump-1", type: "pump_done", value: true, occurredAt: "2026-04-19T07:02:00Z", source: "manual" },
      ],
    });

    expect(payload.currentPriority.domain).toBe("recovery");
    expect(payload.currentPriority.title).toMatch(/pump/i);
    expect(payload.currentPriority.avoidToday).toMatch(/repeat|stacking|intense/i);
    expect(payload.alerts.map((alert) => alert.id)).toContain("pump-intensity-caution");
  });

  it("does not create a safety alert for all-clear symptom check-ins", () => {
    const payload = buildTodayPayload({
      ...baseInput,
      latestLogs: [
        {
          id: "symptom-1",
          type: "symptom_checkin",
          value: createSymptomCheckinValue("all_clear"),
          occurredAt: "2026-04-19T08:00:00Z",
          source: "manual",
        },
      ],
    });

    expect(payload.currentPriority.domain).toBe("baseline");
    expect(payload.alerts.map((alert) => alert.severity)).not.toContain("medical_attention");
  });
});
