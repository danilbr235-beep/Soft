import { describe, expect, it } from "vitest";
import type { CurrentPriority } from "@pmhc/types";
import { explainPriority } from "./todayRules";

const baselinePriority = {
  domain: "baseline",
  title: "Build your baseline",
  whyItMatters: "There is not enough stable data yet for strong recommendations.",
  recommendedAction: "Log three quick signals today: morning, libido, and confidence.",
  confidence: "low",
} satisfies CurrentPriority;

describe("explainPriority", () => {
  it("explains low-data priorities without overstating certainty", () => {
    const explanation = explainPriority(baselinePriority);

    expect(explanation.title).toBe("Build your baseline");
    expect(explanation.dataNote).toMatch(/not enough trend data/i);
    expect(explanation.confidenceNote).toMatch(/low/i);
    expect(explanation.safetyNote).toMatch(/not a diagnosis/i);
  });

  it("carries conservative avoid-today guidance into the coach answer", () => {
    const explanation = explainPriority({
      ...baselinePriority,
      domain: "safety",
      avoidToday: "Avoid intense or aggressive protocols until the signal is clearer.",
      confidence: "medium",
    });

    expect(explanation.avoidToday).toMatch(/avoid intense/i);
    expect(explanation.nextStep).toBe(baselinePriority.recommendedAction);
  });

  it("can explain a priority in Russian", () => {
    const explanation = explainPriority(baselinePriority, "ru");

    expect(explanation.dataNote).toMatch(/данных/i);
    expect(explanation.confidenceNote).toMatch(/низкая/i);
    expect(explanation.safetyNote).toMatch(/не диагноз/i);
  });
});
