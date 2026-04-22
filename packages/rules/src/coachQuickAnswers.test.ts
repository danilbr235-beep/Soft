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

  it("uses the review digest to sharpen the next step and confidence framing", () => {
    const answers = buildCoachQuickAnswers(
      { ...today, alerts: [] },
      "en",
      {
        tone: "baseline_building",
        confidence: "low",
        nextStep: "log_two_scores",
      },
    );
    const priorityAnswer = answers.find((answer) => answer.id === "priority");
    const dataAnswer = answers.find((answer) => answer.id === "data");
    const nextStepAnswer = answers.find((answer) => answer.id === "next_step");

    expect(priorityAnswer?.body).toContain("broader review still points to a baseline-building day");
    expect(dataAnswer?.body).toContain("broader review confidence is still low");
    expect(nextStepAnswer?.nextStep).toBe("Start with two calm scores before deciding whether today needs anything more.");
  });

  it("uses the review digest to keep a no-alert day conservative when recovery still leads", () => {
    const alertAnswer = buildCoachQuickAnswers(
      { ...today, alerts: [] },
      "en",
      {
        tone: "recovery",
        confidence: "medium",
        nextStep: "protect_recovery",
      },
    ).find((answer) => answer.id === "alert");

    expect(alertAnswer?.body).toContain("broader review still points to a recovery-first day");
    expect(alertAnswer?.nextStep).toBe("Keep today to one recovery-first action and one check-in.");
  });

  it("keeps answers away from diagnosis, cure, guarantee, or shame language", () => {
    const unsafeWords = /\b(cure|guarantee|failure|broken|diagnose you|treatment plan)\b/i;
    const fullText = buildCoachQuickAnswers(today)
      .map((answer) => `${answer.title} ${answer.body} ${answer.nextStep ?? ""}`)
      .join(" ");

    expect(fullText).not.toMatch(unsafeWords);
  });
});
