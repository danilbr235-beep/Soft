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

  const baseReview = {
    title: "Lighter day review",
    body: "A short 7-day read of how often the app kept the day in the lighter preset.",
    tone: "Used as support",
    toneId: "targeted" as const,
    pattern: "Pattern: one-off support day",
    reason: "One lighter day looks like a targeted downshift, not the whole weekly pattern.",
    reasonId: "single_day" as const,
    nextStepTitle: "Lighter-day next step",
    nextStep: "Use it when the day tightens, then return to the full plan once the signal is quiet again.",
    nextStepId: "return_when_quiet" as const,
    meta: "Lighter days: 1/7 - Current streak: 1 day",
    todayLine: "Active today from Programs.",
    sourceLine: "Today: 0 - Programs: 1",
    activeDays: 1,
    streak: 1,
    todayActive: true,
    sourceCounts: {
      today: 0,
      programs: 1,
    },
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
      daySimplificationReview: {
        ...baseReview,
        activeDays: 0,
        meta: "Lighter days: 0/7 - Current streak: 0 days",
        sourceLine: null,
        streak: 0,
        todayActive: false,
        todayLine: "Not active today.",
      },
      language: "en",
      programTaskCount: 3,
    });

    expect(guidance.action).toBe("apply");
    expect(guidance.ctaLabel).toBe("Use lighter day");
    expect(guidance.nextStep).toBe("Land the morning anchor first.");
    expect(guidance.lines).toEqual([
      "Mode: Standard",
      "Today: up to 2 of 4 priority actions stay visible.",
      "Programs: up to 2 of 3 tasks stay visible.",
    ]);
  });

  it("switches to restore guidance when the lighter day looks like a one-off support day", () => {
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
      daySimplificationReview: baseReview,
      language: "en",
      programTaskCount: 3,
    });

    expect(guidance.action).toBe("restore");
    expect(guidance.tone).toBe("Used as support");
    expect(guidance.body).toContain("one-day support reset");
    expect(guidance.ctaLabel).toBe("Return to full day");
    expect(guidance.nextStep).toBe(
      "Use it when the day tightens, then return to the full plan once the signal is quiet again.",
    );
    expect(guidance.lines).toEqual([
      "Mode: Light",
      "Today: up to 2 of 4 priority actions stay visible.",
      "Programs: up to 1 of 3 tasks stay visible.",
      "Week pattern: 1/7 lighter days - Streak: 1 day",
      "Today: 0 - Programs: 1",
    ]);
  });

  it("holds the lighter preset when the week is still running compressed", () => {
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
        source: "today",
        statusTitle: "Lighter day is on",
        taskCap: 1,
      },
      daySimplificationReview: {
        ...baseReview,
        tone: "Week stayed compressed",
        toneId: "protective",
        pattern: "Pattern: current lighter-day streak",
        reason: "The lighter preset has been active for multiple days in a row.",
        reasonId: "active_streak",
        nextStep: "Keep the next day or two small enough that the app does not need to rescue the plan again.",
        nextStepId: "keep_small",
        meta: "Lighter days: 4/7 - Current streak: 4 days",
        sourceLine: "Today: 2 - Programs: 2",
        activeDays: 4,
        streak: 4,
        sourceCounts: {
          today: 2,
          programs: 2,
        },
      },
      language: "en",
      programTaskCount: 3,
    });

    expect(guidance.action).toBeNull();
    expect(guidance.ctaLabel).toBeNull();
    expect(guidance.tone).toBe("Week stayed compressed");
    expect(guidance.statusLabel).toBe("Lighter day still looks useful right now.");
    expect(guidance.nextStep).toBe(
      "Keep the next day or two small enough that the app does not need to rescue the plan again.",
    );
    expect(guidance.lines).toContain("Week pattern: 4/7 lighter days - Streak: 4 days");
  });
});
