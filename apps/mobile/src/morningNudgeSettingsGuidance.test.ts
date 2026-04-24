import { describe, expect, it } from "vitest";
import { buildMorningNudgeSettingsGuidance } from "./morningNudgeSettingsGuidance";
import type { MorningNudgeReview } from "./morningNudgeReview";
import type { MorningNudgePreferences } from "./morningNudge";

const simplifyReview: MorningNudgeReview = {
  title: "Morning nudge review",
  body: "A short read of the current local reminder setup for the morning loop.",
  pattern: "Pattern: one calmer cue fits best",
  stateTitle: "State",
  stateLabel: "On",
  timingTitle: "Timing",
  timingLabel: "Daily - 09:00",
  styleTitle: "Style",
  styleLabel: "Supportive",
  focusTitle: "Current focus",
  focusLabel: "Protect anchor",
  previewTitle: "Preview",
  previewBody: "Keep morning simple. Light first.",
  historyTitle: "Recent changes",
  historyLabel: "No recent morning nudge changes yet.",
  guidanceState: "simplify",
  guidanceTitle: "Today nudge check",
  guidanceTone: "Keep one calm cue",
  guidanceBody: "The morning loop still needs the anchor to land first.",
  guidanceMeta: "No reminder changes in the last 30 days.",
};

describe("morningNudgeSettingsGuidance", () => {
  it("suggests a calmer preset when the loop still needs the anchor", () => {
    const preferences: MorningNudgePreferences = {
      enabled: true,
      tone: "supportive",
      timePreset: "late",
      weekdaysOnly: false,
    };

    const guidance = buildMorningNudgeSettingsGuidance({
      language: "en",
      preferences,
      review: simplifyReview,
    });

    expect(guidance.ctaLabel).toBe("Apply calmer setup");
    expect(guidance.changeLines).toEqual([
      "Style: Supportive -> Discreet",
      "Timing: 09:00 -> 08:00",
      "Cadence: Daily -> Weekdays",
    ]);
    expect(guidance.recommendedPreferences).toEqual({
      enabled: true,
      tone: "discreet",
      timePreset: "standard",
      weekdaysOnly: true,
    });
  });

  it("does not suggest changes when the current setup is already aligned", () => {
    const preferences: MorningNudgePreferences = {
      enabled: true,
      tone: "discreet",
      timePreset: "standard",
      weekdaysOnly: true,
    };

    const guidance = buildMorningNudgeSettingsGuidance({
      language: "en",
      preferences,
      review: simplifyReview,
    });

    expect(guidance.ctaLabel).toBeNull();
    expect(guidance.changeLines).toEqual([]);
    expect(guidance.statusLabel).toBe("Current settings already fit this morning read.");
  });

  it("can suggest pausing nudges when support is optional", () => {
    const preferences: MorningNudgePreferences = {
      enabled: true,
      tone: "discreet",
      timePreset: "standard",
      weekdaysOnly: true,
    };

    const guidance = buildMorningNudgeSettingsGuidance({
      language: "en",
      preferences,
      review: {
        ...simplifyReview,
        guidanceState: "optional",
        guidanceTone: "Optional support",
      },
    });

    expect(guidance.ctaLabel).toBe("Pause nudges for now");
    expect(guidance.changeLines).toEqual(["State: On -> Off"]);
    expect(guidance.recommendedPreferences?.enabled).toBe(false);
  });
});
