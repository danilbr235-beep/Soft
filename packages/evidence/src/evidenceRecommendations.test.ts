import { describe, expect, it } from "vitest";
import { officialEvidenceSources } from "./evidenceSources";
import { recommendEvidenceSources } from "./evidenceRecommendations";

describe("recommendEvidenceSources", () => {
  it("prioritizes sexual health guidelines for a baseline-building confidence read", () => {
    const recommendations = recommendEvidenceSources({
      activeProgramCategory: "confidence",
      priorityDomain: "baseline",
      reviewDigestTone: "baseline_building",
      reviewDigestNextStep: "log_two_scores",
    });

    expect(recommendations.map((item) => item.source.id)).toEqual([
      "eau-sexual-reproductive-health",
      "aua-ed-guideline",
      "ics-standards",
    ]);
    expect(recommendations[0]?.reason).toBe("digest");
  });

  it("pulls sleep guidance to the top for a recovery-first read", () => {
    const recommendations = recommendEvidenceSources({
      activeProgramCategory: "sleep",
      priorityDomain: "recovery",
      reviewDigestTone: "recovery",
      reviewDigestNextStep: "protect_recovery",
    });

    expect(recommendations[0]).toMatchObject({
      source: { id: "aasm-standards-guidelines" },
      reason: "digest",
    });
  });

  it("surfaces ICS standards for pelvic floor work", () => {
    const recommendations = recommendEvidenceSources({
      activeProgramCategory: "pelvic_floor",
      priorityDomain: "pelvic_floor",
    });

    expect(recommendations[0]).toMatchObject({
      source: { id: "ics-standards" },
    });
    expect(recommendations.some((item) => officialEvidenceSources.some((source) => source.id === item.source.id))).toBe(true);
  });
});
