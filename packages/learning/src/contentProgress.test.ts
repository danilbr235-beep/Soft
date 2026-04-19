import { describe, expect, it } from "vitest";
import type { ContentItem, ContentProgress } from "@pmhc/types";
import { markContentCompleted, mergeContentProgress, toggleContentSaved } from "./contentProgress";

const content = [
  {
    id: "baseline",
    type: "guide",
    title: "Build a baseline",
    summary: "Collect calm signals.",
    durationMinutes: 4,
    trustLevel: "reviewed_source",
    tags: ["baseline"],
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
    tags: ["sleep"],
    sourceName: "Starter",
    language: "en",
    saved: true,
    completed: false,
  },
] satisfies ContentItem[];

describe("content progress helpers", () => {
  it("overlays saved and completed state onto catalog items", () => {
    const progress = [
      {
        itemId: "baseline",
        saved: true,
        completed: true,
        updatedAt: "2026-04-19T09:00:00.000Z",
      },
    ] satisfies ContentProgress[];

    const merged = mergeContentProgress(content, progress);

    expect(merged[0]).toMatchObject({ id: "baseline", saved: true, completed: true });
    expect(merged[1]).toMatchObject({ id: "sleep", saved: true, completed: false });
  });

  it("toggles saved state while preserving completion", () => {
    const progress = [
      {
        itemId: "baseline",
        saved: false,
        completed: true,
        updatedAt: "2026-04-19T09:00:00.000Z",
      },
    ] satisfies ContentProgress[];

    const next = toggleContentSaved(progress, "baseline", "2026-04-19T10:00:00.000Z");

    expect(next).toEqual([
      {
        itemId: "baseline",
        saved: true,
        completed: true,
        updatedAt: "2026-04-19T10:00:00.000Z",
      },
    ]);
  });

  it("marks an item complete and keeps it saved", () => {
    const next = markContentCompleted([], "baseline", "2026-04-19T10:00:00.000Z");

    expect(next).toEqual([
      {
        itemId: "baseline",
        saved: true,
        completed: true,
        updatedAt: "2026-04-19T10:00:00.000Z",
      },
    ]);
  });
});
