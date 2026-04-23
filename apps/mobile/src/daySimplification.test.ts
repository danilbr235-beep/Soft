import { describe, expect, it } from "vitest";
import {
  buildDaySimplificationState,
  describeProgramSimplification,
  describeTodaySimplification,
  limitProgramTasksForDay,
  limitTodayActionCards,
} from "./daySimplification";

describe("day simplification", () => {
  it("builds an active lighter-day state with caps", () => {
    const state = buildDaySimplificationState({
      baseTodayMode: "Standard",
      date: "2026-04-23",
      guidanceState: "protect_morning",
      language: "en",
      store: {
        "2026-04-23": {
          appliedAt: "2026-04-23T08:00:00.000Z",
          source: "today",
        },
      },
    });

    expect(state.active).toBe(true);
    expect(state.effectiveTodayMode).toBe("Light");
    expect(state.actionCardCap).toBe(2);
    expect(state.taskCap).toBe(2);
    expect(state.restoreLabel).toBe("Return to full day");
  });

  it("limits today cards and program tasks when a lighter day is active", () => {
    const state = buildDaySimplificationState({
      baseTodayMode: "Light",
      date: "2026-04-23",
      guidanceState: "recovery",
      language: "en",
      store: {
        "2026-04-23": {
          appliedAt: "2026-04-23T08:00:00.000Z",
          source: "programs",
        },
      },
    });

    const visibleCards = limitTodayActionCards(
      [
        { id: "practice", kind: "Practice", title: "One recovery-first step", description: "", cta: "" },
        { id: "check-in", kind: "Check-in", title: "Log the cautious signal first", description: "", cta: "" },
        { id: "learn", kind: "Learn", title: "Why recovery still fits", description: "", cta: "" },
      ],
      state,
    );
    const visibleTasks = limitProgramTasksForDay(
      [
        { id: "comfort-check" },
        { id: "gentle-practice" },
        { id: "boundary-note" },
      ],
      [],
      state,
    );

    expect(visibleCards.map((card) => card.id)).toEqual(["practice", "check-in"]);
    expect(visibleTasks.map((task) => task.id)).toEqual(["comfort-check"]);
  });

  it("describes the lighter day summary for today and programs", () => {
    expect(describeTodaySimplification({ hiddenCount: 2, language: "en", visibleCount: 2 })).toEqual({
      summary: "Showing 2 priority actions for today.",
      hidden: "2 more actions are hidden for later.",
    });
    expect(describeProgramSimplification({ hiddenCount: 1, language: "en", visibleCount: 2 })).toEqual({
      summary: "Showing 2 tasks in the lighter day plan.",
      hidden: "1 more task is hidden for later.",
    });
  });
});
