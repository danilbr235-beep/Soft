import { describe, expect, it } from "vitest";
import type { CoachReviewDigest } from "@pmhc/rules";
import type { TodayPayload } from "@pmhc/types";
import { buildCoachAdaptiveNudge } from "./coachAdaptiveNudge";
import type { MorningNudgeReview } from "./morningNudgeReview";
import type { MorningRoutineReview } from "./morningRoutineReview";

const today: TodayPayload = {
  date: "2026-04-23",
  todayMode: "Light",
  syncStatus: "synced",
  activeProgram: null,
  currentPriority: {
    domain: "baseline",
    title: "Build your baseline",
    whyItMatters: "There is not enough stable data yet for strong recommendations.",
    recommendedAction: "Log two quick scores today.",
    confidence: "low",
  },
  dailyState: [],
  alerts: [],
  actionCards: [],
  quickLogs: [],
  liveUpdates: [],
  insights: [],
};

const morningRoutineReview: MorningRoutineReview = {
  toneId: "reset",
  reasonId: "checkin_gap",
  nextStepId: "pair_checkin",
  title: "Morning routine review",
  body: "A short 7-day read of whether the morning loop is staying repeatable.",
  tone: "Tighten the loop",
  reason: "The wake-and-light anchor shows up more often than the morning check-in, so the loop still breaks early.",
  nextStepTitle: "Morning next step",
  nextStep: "Pair the quick morning log right after the anchor instead of adding a new step.",
  meta: "Full mornings: 1/7 - Partial mornings: 2 - Streak: 1 day",
  stepLines: [],
  fullDays: 1,
  partialDays: 2,
  streak: 1,
};

const steadyMorningRoutineReview: MorningRoutineReview = {
  ...morningRoutineReview,
  toneId: "steady",
  reasonId: "routine_holding",
  nextStepId: "keep_same_loop",
  tone: "Routine is holding",
  reason: "The short morning loop is landing often enough to keep it steady instead of making it more ambitious.",
  nextStep: "Keep the same three-step morning loop for a few more days and let consistency build.",
};

const morningNudgeReview: MorningNudgeReview = {
  title: "Morning nudge review",
  body: "A short read of the current local reminder setup for the morning loop.",
  stateTitle: "State",
  stateLabel: "Enabled",
  timingTitle: "Timing",
  timingLabel: "Weekdays - 08:00",
  styleTitle: "Style",
  styleLabel: "Discreet",
  focusTitle: "Focus",
  focusLabel: "Morning anchor first",
  previewTitle: "Preview",
  previewBody: "Keep morning simple. Light first.",
  historyTitle: "Recent changes",
  historyLabel: "No recent morning nudge changes yet.",
  guidanceState: "repeat",
  guidanceTitle: "Today nudge check",
  guidanceTone: "Repeat first",
  guidanceBody: "Repeat the same reminder tomorrow before changing timing or style.",
  guidanceMeta: "No reminder changes in the last 30 days.",
};

describe("buildCoachAdaptiveNudge", () => {
  it("recommends simplifying the whole day when recovery still leads", () => {
    const reviewDigest: CoachReviewDigest = {
      tone: "recovery",
      confidence: "medium",
      nextStep: "protect_recovery",
    };

    const answer = buildCoachAdaptiveNudge({
      language: "en",
      morningNudgeReview,
      morningRoutineReview: steadyMorningRoutineReview,
      reviewDigest,
      today,
    });

    expect(answer.title).toBe("Should I simplify today?");
    expect(answer.tone).toBe("Recovery-first day");
    expect(answer.body).toContain("whole day should stay smaller");
    expect(answer.nextStep).toContain("one recovery-first action");
  });

  it("uses the morning loop guidance when the main issue is structure", () => {
    const reviewDigest: CoachReviewDigest = {
      tone: "steady",
      confidence: "medium",
      nextStep: "keep_consistency",
    };

    const answer = buildCoachAdaptiveNudge({
      language: "en",
      morningNudgeReview,
      morningRoutineReview,
      reviewDigest,
      today: {
        ...today,
        currentPriority: {
          ...today.currentPriority,
          confidence: "medium",
        },
      },
    });

    expect(answer.tone).toBe("Protect the morning rail");
    expect(answer.body).toContain("around the morning loop");
    expect(answer.nextStep).toBe("Pair the quick morning log right after the anchor instead of adding a new step.");
  });

  it("adds a hold note and keeps Russian copy readable", () => {
    const reviewDigest: CoachReviewDigest = {
      tone: "baseline_building",
      confidence: "low",
      nextStep: "log_two_scores",
    };

    const answer = buildCoachAdaptiveNudge({
      language: "ru",
      morningNudgeReview: {
        ...morningNudgeReview,
        guidanceState: "hold",
      },
      morningRoutineReview: {
        ...steadyMorningRoutineReview,
        toneId: "building",
        reasonId: "no_signal",
        nextStepId: "protect_anchor",
      },
      reviewDigest,
      today,
    });

    expect(answer.title).toBe("Стоит ли упростить день?");
    expect(answer.tone).toBe("День лучше держать узким");
    expect(answer.body).toContain("День лучше держать узким");
    expect(answer.body).toContain("лучше не трогать его время и тон");
    expect(answer.nextStep).toContain("две спокойные оценки");
  });
});
