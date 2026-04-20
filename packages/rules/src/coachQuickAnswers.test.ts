import { describe, expect, it } from "vitest";
import type { Alert, TodayPayload } from "@pmhc/types";
import { buildCoachQuickAnswers } from "./coachQuickAnswers";

const safetyAlert = {
  id: "safety-symptoms",
  severity: "medical_attention",
  title: "Symptom review recommended",
  message: "Keep tracking conservative and consider professional guidance if symptoms persist or feel acute.",
  module: "safety",
} satisfies Alert;

const today = {
  date: "2026-04-20",
  todayMode: "Light",
  syncStatus: "synced",
  activeProgram: null,
  currentPriority: {
    domain: "baseline",
    title: "Build your baseline",
    whyItMatters: "There is not enough stable data yet for strong recommendations.",
    recommendedAction: "Log three quick signals today: morning, libido, and confidence.",
    confidence: "low",
  },
  dailyState: [],
  alerts: [safetyAlert],
  actionCards: [],
  quickLogs: [],
  liveUpdates: [],
  insights: [],
} satisfies TodayPayload;

describe("buildCoachQuickAnswers", () => {
  it("builds the four MVP coach questions in a stable order", () => {
    const answers = buildCoachQuickAnswers(today);

    expect(answers.map((answer) => answer.id)).toEqual(["priority", "alert", "data", "next_step"]);
    expect(answers[0].title).toBe("Why this priority?");
    expect(answers[2].body).toMatch(/not enough trend data/i);
  });

  it("explains the highest-priority alert conservatively", () => {
    const alertAnswer = buildCoachQuickAnswers(today).find((answer) => answer.id === "alert");

    expect(alertAnswer?.title).toBe("What does this alert mean?");
    expect(alertAnswer?.body).toContain("Symptom review recommended");
    expect(alertAnswer?.nextStep).toMatch(/Keep tracking conservative/i);
  });

  it("uses a no-alert fallback when Today has no alerts", () => {
    const alertAnswer = buildCoachQuickAnswers({ ...today, alerts: [] }).find((answer) => answer.id === "alert");

    expect(alertAnswer?.body).toMatch(/No active alerts/i);
    expect(alertAnswer?.nextStep).toMatch(/Keep the plan light/i);
  });

  it("keeps answers away from diagnosis, cure, guarantee, or shame language", () => {
    const unsafeWords = /\b(cure|guarantee|failure|broken|diagnose you|treatment plan)\b/i;
    const fullText = buildCoachQuickAnswers(today)
      .map((answer) => `${answer.title} ${answer.body} ${answer.nextStep ?? ""}`)
      .join(" ");

    expect(fullText).not.toMatch(unsafeWords);
  });
});
