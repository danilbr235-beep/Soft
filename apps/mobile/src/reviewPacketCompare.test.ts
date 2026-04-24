import { describe, expect, it } from "vitest";
import { buildReviewPacketCompare } from "./reviewPacketCompare";
import type { ReviewPacketHistoryEntry } from "./reviewPacketHistory";

const earlierPacket: ReviewPacketHistoryEntry = {
  id: "packet-earlier",
  section: "month",
  title: "30 days packet",
  createdAt: "2026-04-20T09:00:00.000Z",
  blocks: [
    {
      id: "summary",
      title: "Summary",
      lines: ["Recovery-first month", "Sleep dipped enough to stay conservative."],
    },
    {
      id: "morning",
      title: "Morning routine",
      lines: ["Pattern: first full morning landed", "Morning next step: Repeat the same three-step morning tomorrow before changing it."],
    },
  ],
};

const latestPacket: ReviewPacketHistoryEntry = {
  id: "packet-latest",
  section: "week",
  title: "7 days packet",
  createdAt: "2026-04-23T09:00:00.000Z",
  blocks: [
    {
      id: "summary",
      title: "Summary",
      lines: ["Recovery-first week", "A symptom check-in still makes this week conservative."],
    },
    {
      id: "morning",
      title: "Morning routine",
      lines: ["Pattern: first full morning landed", "Morning next step: Repeat the same three-step morning tomorrow before changing it."],
    },
    {
      id: "nudge",
      title: "Morning nudge",
      lines: ["Pattern: recent changes are still settling"],
    },
  ],
};

describe("buildReviewPacketCompare", () => {
  it("returns null when fewer than two packets are available", () => {
    expect(buildReviewPacketCompare([latestPacket])).toBeNull();
  });

  it("compares the two latest packets in archive order", () => {
    const result = buildReviewPacketCompare([latestPacket, earlierPacket]);

    expect(result).not.toBeNull();
    expect(result?.left.title).toBe("30 days packet");
    expect(result?.right.title).toBe("7 days packet");
    expect(result?.totalBlocks).toBe(3);
    expect(result?.changedBlocks).toBe(2);
  });

  it("marks unchanged blocks as stable and preserves lines on both sides", () => {
    const result = buildReviewPacketCompare([latestPacket, earlierPacket]);
    const morningBlock = result?.blocks.find((block) => block.id === "morning");

    expect(morningBlock?.status).toBe("same");
    expect(morningBlock?.leftLines[0]).toBe("Pattern: first full morning landed");
    expect(morningBlock?.rightLines[0]).toBe("Pattern: first full morning landed");
  });

  it("marks missing or changed blocks as changed", () => {
    const result = buildReviewPacketCompare([latestPacket, earlierPacket]);
    const summaryBlock = result?.blocks.find((block) => block.id === "summary");
    const nudgeBlock = result?.blocks.find((block) => block.id === "nudge");

    expect(summaryBlock?.status).toBe("changed");
    expect(nudgeBlock?.status).toBe("changed");
    expect(nudgeBlock?.leftLines).toEqual([]);
    expect(nudgeBlock?.rightLines).toEqual(["Pattern: recent changes are still settling"]);
  });
});
