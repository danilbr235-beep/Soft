import { describe, expect, it } from "vitest";
import { buildReviewPreferencesGuidance } from "./reviewPreferencesGuidance";
import type { ReviewPacketHistoryEntry } from "./reviewPacketHistory";
import type { MorningRoutineReview } from "./morningRoutineReview";
import type { ReviewPreferences } from "./reviewPreferences";

const buildingMorningReview: MorningRoutineReview = {
  toneId: "building",
  reasonId: "checkin_gap",
  nextStepId: "pair_checkin",
  title: "Morning routine review",
  body: "A short 7-day read of whether the morning loop is staying repeatable.",
  tone: "Building consistency",
  reason: "The loop still breaks early.",
  nextStepTitle: "Morning next step",
  nextStep: "Pair the quick morning log right after the anchor instead of adding a new step.",
  meta: "Full mornings: 0/7 - Partial mornings: 2 - Streak: 0 days",
  stepLines: ["Anchor: 2/7 mornings", "Check-in: 0/7 mornings", "Guide: 0/7 mornings"],
  fullDays: 0,
  partialDays: 2,
  streak: 0,
};

const steadyMorningReview: MorningRoutineReview = {
  ...buildingMorningReview,
  toneId: "steady",
  reasonId: "routine_holding",
  nextStepId: "keep_same_loop",
  tone: "Routine is holding",
  reason: "The short morning loop is landing often enough.",
  nextStep: "Keep the same three-step morning loop for a few more days and let consistency build.",
  meta: "Full mornings: 5/7 - Partial mornings: 0 - Streak: 3 days",
  fullDays: 5,
  partialDays: 0,
  streak: 3,
};

describe("reviewPreferencesGuidance", () => {
  it("recommends a weekly packet flow when morning signal is still building", () => {
    const guidance = buildReviewPreferencesGuidance({
      history: [],
      language: "en",
      morningRoutineReview: buildingMorningReview,
      preferences: {
        defaultSection: "overview",
        defaultFormat: "snapshot",
        includeMorningRoutineInPacket: false,
      },
    });

    expect(guidance.ctaLabel).toBe("Apply weekly packet setup");
    expect(guidance.changeLines).toEqual([
      "Section: Overview -> 7 days",
      "Format: Snapshot -> Packet",
      "Morning block: Off -> On",
    ]);
    expect(guidance.recommendedPreferences).toEqual({
      defaultSection: "week",
      defaultFormat: "packet",
      includeMorningRoutineInPacket: true,
    } satisfies ReviewPreferences);
  });

  it("leans on recent packet history when the user already saves cycle packets", () => {
    const history: ReviewPacketHistoryEntry[] = [
      {
        id: "packet-1",
        section: "cycles",
        title: "Cycles packet",
        blocks: [],
        createdAt: "2026-04-22T09:00:00.000Z",
      },
      {
        id: "packet-2",
        section: "cycles",
        title: "Cycles packet",
        blocks: [],
        createdAt: "2026-04-21T09:00:00.000Z",
      },
    ];

    const guidance = buildReviewPreferencesGuidance({
      history,
      language: "en",
      morningRoutineReview: steadyMorningReview,
      preferences: {
        defaultSection: "overview",
        defaultFormat: "packet",
        includeMorningRoutineInPacket: true,
      },
    });

    expect(guidance.tone).toBe("Start from cycle history");
    expect(guidance.changeLines).toEqual([
      "Section: Overview -> Cycles",
      "Morning block: On -> Off",
    ]);
    expect(guidance.recommendedPreferences?.defaultSection).toBe("cycles");
  });

  it("keeps the current setup when a steady morning loop already matches the lighter preset", () => {
    const guidance = buildReviewPreferencesGuidance({
      history: [],
      language: "en",
      morningRoutineReview: steadyMorningReview,
      preferences: {
        defaultSection: "overview",
        defaultFormat: "snapshot",
        includeMorningRoutineInPacket: false,
      },
    });

    expect(guidance.ctaLabel).toBeNull();
    expect(guidance.statusLabel).toBe("Current review settings already match this pattern.");
    expect(guidance.changeLines).toEqual([]);
  });
});
