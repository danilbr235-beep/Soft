import { describe, expect, it } from "vitest";
import type { ContentItem } from "@pmhc/types";
import {
  contentCategoryFor,
  groupContentByCategory,
  recommendContentForToday,
} from "./contentRecommendations";

const content = [
  {
    id: "baseline",
    type: "guide",
    title: "Build a baseline",
    summary: "Collect calm signals.",
    durationMinutes: 4,
    trustLevel: "reviewed_source",
    tags: ["baseline", "confidence", "tracking"],
    sourceName: "Starter",
    language: "en",
    saved: false,
    completed: false,
  },
  {
    id: "sleep",
    type: "summary",
    title: "Sleep reset",
    summary: "Keep recovery simple.",
    durationMinutes: 5,
    trustLevel: "expert_summary",
    tags: ["sleep", "environment", "recovery"],
    sourceName: "Starter",
    language: "en",
    saved: true,
    completed: false,
  },
  {
    id: "pelvic",
    type: "article",
    title: "Pelvic floor consistency",
    summary: "Gentle consistency beats intensity.",
    durationMinutes: 6,
    trustLevel: "reviewed_source",
    tags: ["pelvic_floor", "practice", "safety"],
    sourceName: "Starter",
    language: "en",
    saved: false,
    completed: false,
  },
  {
    id: "done",
    type: "article",
    title: "Completed confidence read",
    summary: "Already finished.",
    durationMinutes: 3,
    trustLevel: "reviewed_source",
    tags: ["confidence"],
    sourceName: "Starter",
    language: "en",
    saved: true,
    completed: true,
  },
] satisfies ContentItem[];

describe("content recommendations", () => {
  it("chooses the first known category from item tags", () => {
    expect(contentCategoryFor(content[0])).toBe("baseline");
    expect(contentCategoryFor(content[1])).toBe("sleep");
    expect(contentCategoryFor(content[2])).toBe("pelvic_floor");
  });

  it("groups content by category in a stable order", () => {
    const groups = groupContentByCategory(content);

    expect(groups.map((group) => group.category)).toEqual(["baseline", "sleep", "pelvic_floor", "confidence"]);
    expect(groups[0].items.map((item) => item.id)).toEqual(["baseline"]);
  });

  it("recommends incomplete content tied to the Today priority first", () => {
    const recommendations = recommendContentForToday(content, {
      activeProgramCategory: "confidence",
      priorityDomain: "confidence",
      reviewDigestTone: "baseline_building",
      reviewDigestNextStep: "log_two_scores",
    });

    expect(recommendations.map((item) => item.item.id)).toEqual(["baseline", "sleep", "pelvic"]);
    expect(recommendations[0].reason).toBe("digest");
    expect(recommendations.some((item) => item.item.id === "done")).toBe(false);
  });

  it("maps environment priorities to sleep and recovery content", () => {
    const recommendations = recommendContentForToday(content, {
      activeProgramCategory: "sleep",
      priorityDomain: "environment",
    });

    expect(recommendations[0]).toMatchObject({
      item: { id: "sleep" },
      reason: "priority",
    });
  });

  it("lets a recovery digest lift recovery content above unrelated program reads", () => {
    const recommendations = recommendContentForToday(content, {
      activeProgramCategory: "confidence",
      priorityDomain: "confidence",
      reviewDigestTone: "recovery",
      reviewDigestNextStep: "protect_recovery",
    });

    expect(recommendations[0]).toMatchObject({
      item: { id: "sleep" },
      reason: "digest",
    });
    expect(recommendations[1]?.item.id).toBe("pelvic");
  });
});
