import { describe, expect, it } from "vitest";
import { getCopy } from "@pmhc/i18n";
import {
  buildReviewPacketExportText,
  filterReviewPacketHistory,
  formatPacketSavedAt,
  type ReviewPacketArchiveFilter,
} from "./reviewPacketExport";
import type { ReviewPacketHistoryEntry } from "./reviewPacketHistory";

const history: ReviewPacketHistoryEntry[] = [
  {
    id: "packet-1",
    section: "month",
    title: "30 days packet",
    blocks: [
      {
        id: "summary",
        title: "Summary",
        lines: ["Recovery-first month", "A symptom check-in keeps this month conservative."],
      },
    ],
    createdAt: "2026-04-22T12:00:00.000Z",
  },
  {
    id: "packet-2",
    section: "cycles",
    title: "Cycles packet",
    blocks: [
      {
        id: "history",
        title: "History snapshot",
        lines: ["Latest completed cycle: 14-day confidence reset"],
      },
    ],
    createdAt: "2026-04-23T12:00:00.000Z",
  },
];

describe("reviewPacketExport", () => {
  it.each([
    ["all", 2],
    ["month", 1],
    ["cycles", 1],
    ["week", 0],
  ] satisfies Array<[ReviewPacketArchiveFilter, number]>)("filters archive packets for %s", (filter, count) => {
    expect(filterReviewPacketHistory(history, filter)).toHaveLength(count);
  });

  it("builds a readable export text", () => {
    const text = buildReviewPacketExportText({
      copy: getCopy("en"),
      entry: history[0],
      language: "en",
    });

    expect(text).toContain("30 days packet");
    expect(text).toContain("30 days - saved");
    expect(text).toContain("Summary");
    expect(text).toContain("Recovery-first month");
  });

  it("formats saved-at timestamps for supported locales", () => {
    expect(formatPacketSavedAt("2026-04-22T12:00:00.000Z", "en").length).toBeGreaterThan(0);
    expect(formatPacketSavedAt("2026-04-22T12:00:00.000Z", "ru").length).toBeGreaterThan(0);
    expect(formatPacketSavedAt("not-a-date", "en")).toBe("not-a-date");
  });
});
