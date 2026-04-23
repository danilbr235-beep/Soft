import { describe, expect, it } from "vitest";
import { buildDaySimplificationGuidance } from "./daySimplificationGuidance";

describe("day simplification guidance", () => {
  const adaptiveDayGuidance = {
    id: "simplify" as const,
    state: "narrow" as const,
    tone: "Keep today narrow",
    title: "Should I simplify today?",
    body: "Keep today narrow.",
    nextStep: "Land the morning anchor first.",
  };

  it("offers an apply preset when lighter day is recommended but inactive", () => {
    const guidance = buildDaySimplificationGuidance({
      actionCardCount: 4,
      adaptiveDayGuidance,
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
      language: "en",
      programTaskCount: 3,
    });

    expect(guidance.action).toBe("apply");
    expect(guidance.ctaLabel).toBe("Use lighter day");
    expect(guidance.lines).toEqual([
      "Mode: Standard",
      "Today: up to 2 of 4 priority actions stay visible.",
      "Programs: up to 2 of 3 tasks stay visible.",
    ]);
  });

  it("switches to restore guidance when lighter day is active", () => {
    const guidance = buildDaySimplificationGuidance({
      actionCardCount: 4,
      adaptiveDayGuidance,
      daySimplification: {
        active: true,
        actionCardCap: 2,
        applyLabel: null,
        canApply: true,
        effectiveTodayMode: "Light",
        restoreLabel: "Return to full day",
        source: "programs",
        statusTitle: "Lighter day is on",
        taskCap: 1,
      },
      language: "en",
      programTaskCount: 3,
    });

    expect(guidance.action).toBe("restore");
    expect(guidance.tone).toBe("Lighter day is on");
    expect(guidance.ctaLabel).toBe("Return to full day");
    expect(guidance.lines).toEqual([
      "Mode: Light",
      "Today: up to 2 of 4 priority actions stay visible.",
      "Programs: up to 1 of 3 tasks stay visible.",
    ]);
  });
});
