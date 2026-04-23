import { describe, expect, it } from "vitest";
import type { ProgramDayPlan } from "@pmhc/types";
import { buildProgramDayGuidanceSummary } from "./programDayGuidance";

const dayPlan: ProgramDayPlan = {
  programId: "confidence-reset-14",
  dayIndex: 1,
  phase: "practice",
  title: "Confidence reset: day 1",
  summary: "Collect a few calm signals and keep the next action small.",
  tasks: [
    { id: "practice", kind: "practice", title: "Practice", description: "One calm reset.", durationMinutes: 4 },
    { id: "checkin", kind: "check_in", title: "Check-in", description: "Log one signal.", durationMinutes: 1 },
    { id: "reflect", kind: "reflect", title: "Reflect", description: "Capture what changed.", durationMinutes: 2 },
    { id: "learn", kind: "learn", title: "Learn", description: "One short guide.", durationMinutes: 3 },
  ],
  completedTaskIds: [],
  rested: false,
  completed: false,
};

describe("buildProgramDayGuidanceSummary", () => {
  it("narrows the plan around the opening signal", () => {
    const summary = buildProgramDayGuidanceSummary({
      dayPlan,
      guidanceState: "narrow",
      language: "en",
    });

    expect(summary.tone).toBe("Keep the plan narrow");
    expect(summary.taskCapText).toContain("one task");
    expect(summary.orderedTaskIds).toEqual(["checkin", "practice", "reflect", "learn"]);
  });

  it("puts morning-compatible tasks first when the morning rail still leads", () => {
    const summary = buildProgramDayGuidanceSummary({
      dayPlan,
      guidanceState: "protect_morning",
      language: "en",
    });

    expect(summary.tone).toBe("Morning-first plan");
    expect(summary.orderedTaskIds).toEqual(["checkin", "learn", "practice", "reflect"]);
  });

  it("keeps steady plans practice-led", () => {
    const summary = buildProgramDayGuidanceSummary({
      dayPlan,
      guidanceState: "steady",
      language: "en",
    });

    expect(summary.orderedTaskIds).toEqual(["practice", "reflect", "learn", "checkin"]);
  });
});
