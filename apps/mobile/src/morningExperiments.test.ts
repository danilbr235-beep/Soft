import { describe, expect, it } from "vitest";
import type { ContentItem } from "@pmhc/types";
import { buildMorningExperiments } from "./morningExperiments";

const content = [
  {
    id: "morning-light-walk",
    type: "guide",
    title: "Morning light walk",
    summary: "A short guide.",
    durationMinutes: 4,
    trustLevel: "reviewed_source",
    tags: ["general", "morning"],
    sourceName: "Morning experiments brief",
    language: "en",
    saved: false,
    completed: false,
  },
  {
    id: "morning-mobility-reset",
    type: "guide",
    title: "Morning mobility reset",
    summary: "A short guide.",
    durationMinutes: 3,
    trustLevel: "reviewed_source",
    tags: ["general", "morning"],
    sourceName: "Morning experiments brief",
    language: "en",
    saved: false,
    completed: false,
  },
  {
    id: "morning-cold-caution",
    type: "summary",
    title: "Cold finish caution",
    summary: "A short note.",
    durationMinutes: 3,
    trustLevel: "reviewed_source",
    tags: ["general", "morning"],
    sourceName: "Morning experiments brief",
    language: "en",
    saved: false,
    completed: false,
  },
] satisfies ContentItem[];

describe("buildMorningExperiments", () => {
  it("builds three optional experiments and keeps cold as caution-first", () => {
    const experiments = buildMorningExperiments({
      content,
      language: "en",
    });

    expect(experiments.items.map((item) => item.id)).toEqual(["light_walk", "mobility_reset", "cold_finish"]);
    expect(experiments.items[2]?.badge).toBe("Caution first");
    expect(experiments.items[2]?.guideItemId).toBe("morning-cold-caution");
    expect(experiments.items[0]?.sourceLabels).toContain("American Academy of Sleep Medicine");
  });
});
