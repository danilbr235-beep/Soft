import { describe, expect, it } from "vitest";
import type { ActionCard } from "@pmhc/types";
import { buildAdaptiveTodayActionCards } from "./todayAdaptiveActionCards";

const cards: ActionCard[] = [
  { id: "practice", kind: "Practice", title: "Short practice", description: "A contained action.", cta: "Start" },
  { id: "check-in", kind: "Check-in", title: "One-minute check-in", description: "Capture the signal.", cta: "Log" },
  { id: "learn", kind: "Learn", title: "Relevant explainer", description: "Read the short context.", cta: "Read" },
  { id: "reflect", kind: "Reflect", title: "Evening note", description: "Record what changed.", cta: "Reflect" },
];

describe("buildAdaptiveTodayActionCards", () => {
  it("keeps narrow days to one small action", () => {
    const guided = buildAdaptiveTodayActionCards({
      actionCards: cards,
      guidanceState: "narrow",
      language: "en",
    });

    expect(guided.map((card) => card.id)).toEqual(["check-in", "practice", "learn", "reflect"]);
    expect(guided[1]?.title).toBe("Stop after one small action");
    expect(guided[3]?.cta).toBe("Leave one line");
  });

  it("moves morning-focused cards ahead of practice when the rail still needs attention", () => {
    const guided = buildAdaptiveTodayActionCards({
      actionCards: cards,
      guidanceState: "protect_morning",
      language: "en",
    });

    expect(guided.map((card) => card.id)).toEqual(["check-in", "learn", "practice", "reflect"]);
    expect(guided[0]?.title).toBe("Morning rail first");
    expect(guided[2]?.title).toBe("Practice can wait");
  });

  it("leaves steady days close to the original rhythm", () => {
    const guided = buildAdaptiveTodayActionCards({
      actionCards: cards,
      guidanceState: "steady",
      language: "en",
    });

    expect(guided.map((card) => card.id)).toEqual(["practice", "reflect", "learn", "check-in"]);
    expect(guided[0]?.title).toBe("Short practice");
  });
});
