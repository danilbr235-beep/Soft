import { describe, expect, it } from "vitest";
import {
  appendReviewPacketHistory,
  createReviewPacketHistoryEntry,
  isReviewPacketHistoryArray,
  reviewPacketHistoryLimit,
} from "./reviewPacketHistory";

describe("reviewPacketHistory", () => {
  it("creates a packet history entry from a prepared packet", () => {
    const entry = createReviewPacketHistoryEntry({
      createdAt: "2026-04-22T12:00:00.000Z",
      packet: {
        kind: "packet",
        title: "30 days packet",
        blocks: [
          {
            id: "summary",
            title: "Summary",
            lines: ["Recovery-first month"],
          },
        ],
      },
      section: "month",
    });

    expect(entry.section).toBe("month");
    expect(entry.title).toBe("30 days packet");
    expect(entry.blocks[0]?.lines).toEqual(["Recovery-first month"]);
  });

  it("keeps the newest unique packets first and trims history", () => {
    const basePacket = {
      kind: "packet" as const,
      title: "Week packet",
      blocks: [
        {
          id: "summary" as const,
          title: "Summary",
          lines: ["Steady week"],
        },
      ],
    };

    const history = Array.from({ length: reviewPacketHistoryLimit }, (_, index) =>
      createReviewPacketHistoryEntry({
        createdAt: `2026-04-2${index}T12:00:00.000Z`,
        packet: {
          ...basePacket,
          title: `${index} packet`,
        },
        section: "week",
      }),
    );

    const duplicate = createReviewPacketHistoryEntry({
      createdAt: "2026-04-29T12:00:00.000Z",
      packet: history[2]
        ? {
            kind: "packet",
            title: history[2].title,
            blocks: history[2].blocks,
          }
        : basePacket,
      section: "week",
    });

    const deduped = appendReviewPacketHistory(history, duplicate);
    expect(deduped).toHaveLength(reviewPacketHistoryLimit);
    expect(deduped[0]?.title).toBe(duplicate.title);
    expect(deduped.filter((entry) => entry.title === duplicate.title)).toHaveLength(1);

    const newest = createReviewPacketHistoryEntry({
      createdAt: "2026-04-30T12:00:00.000Z",
      packet: {
        ...basePacket,
        title: "Latest packet",
      },
      section: "overview",
    });

    const nextHistory = appendReviewPacketHistory(deduped, newest);
    expect(nextHistory).toHaveLength(reviewPacketHistoryLimit);
    expect(nextHistory[0]?.title).toBe("Latest packet");
  });

  it("validates stored packet history arrays", () => {
    expect(
      isReviewPacketHistoryArray([
        {
          id: "review-packet-1",
          section: "overview",
          title: "Overview packet",
          blocks: [
            {
              id: "summary",
              title: "Summary",
              lines: ["One line"],
            },
          ],
          createdAt: "2026-04-22T12:00:00.000Z",
        },
      ]),
    ).toBe(true);

    expect(
      isReviewPacketHistoryArray([
        {
          id: "review-packet-1",
          section: "overview",
          title: "Overview packet",
          blocks: [
            {
              id: "summary",
              title: "Summary",
              lines: [1],
            },
          ],
          createdAt: "2026-04-22T12:00:00.000Z",
        },
      ]),
    ).toBe(false);
  });
});
