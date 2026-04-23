import { describe, expect, it } from "vitest";
import {
  buildMorningRoutineMetrics,
  isMorningRoutineProgressStore,
  markMorningRoutineStepComplete,
} from "./morningRoutineProgress";

describe("morningRoutineProgress", () => {
  it("tracks step completion and keeps recent dates", () => {
    let store = {};

    store = markMorningRoutineStepComplete(store, "2026-04-20", "anchor", "2026-04-20T07:00:00.000Z");
    store = markMorningRoutineStepComplete(store, "2026-04-20", "checkin", "2026-04-20T07:05:00.000Z");
    store = markMorningRoutineStepComplete(store, "2026-04-20", "guide", "2026-04-20T07:10:00.000Z");
    store = markMorningRoutineStepComplete(store, "2026-04-21", "anchor", "2026-04-21T07:00:00.000Z");
    store = markMorningRoutineStepComplete(store, "2026-04-21", "checkin", "2026-04-21T07:05:00.000Z");
    store = markMorningRoutineStepComplete(store, "2026-04-21", "guide", "2026-04-21T07:10:00.000Z");
    store = markMorningRoutineStepComplete(store, "2026-04-22", "anchor", "2026-04-22T07:00:00.000Z");

    expect(isMorningRoutineProgressStore(store)).toBe(true);

    const metrics = buildMorningRoutineMetrics(store, "2026-04-22", "en");

    expect(metrics.map((metric) => `${metric.label}:${metric.value}`)).toEqual([
      "Today:1 of 3",
      "Streak:2 days",
      "7-day adherence:2/7",
    ]);
  });
});
