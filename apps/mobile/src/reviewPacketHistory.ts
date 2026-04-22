import type { ReviewPacketBlock, ReviewRecapResult, ReviewSection } from "./reviewRecap";

export const reviewPacketHistoryLimit = 6;

export type ReviewPacketHistoryEntry = {
  id: string;
  section: ReviewSection;
  title: string;
  blocks: ReviewPacketBlock[];
  createdAt: string;
};

export function createReviewPacketHistoryEntry({
  createdAt,
  packet,
  section,
}: {
  createdAt: string;
  packet: Extract<ReviewRecapResult, { kind: "packet" }>;
  section: ReviewSection;
}): ReviewPacketHistoryEntry {
  return {
    id: `review-packet-${Date.parse(createdAt) || createdAt}-${section}`,
    section,
    title: packet.title,
    blocks: packet.blocks.map((block) => ({
      ...block,
      lines: [...block.lines],
    })),
    createdAt,
  };
}

export function appendReviewPacketHistory(
  history: ReviewPacketHistoryEntry[],
  entry: ReviewPacketHistoryEntry,
  limit = reviewPacketHistoryLimit,
) {
  const signature = getPacketSignature(entry);

  return [entry, ...history.filter((item) => getPacketSignature(item) !== signature)].slice(0, limit);
}

export function isReviewPacketHistoryArray(value: unknown): value is ReviewPacketHistoryEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.id === "string" &&
        typeof entry.section === "string" &&
        typeof entry.title === "string" &&
        typeof entry.createdAt === "string" &&
        Array.isArray(entry.blocks) &&
        entry.blocks.every(
          (block) =>
            isRecord(block) &&
            typeof block.id === "string" &&
            typeof block.title === "string" &&
            Array.isArray(block.lines) &&
            block.lines.every((line) => typeof line === "string"),
        ),
    )
  );
}

function getPacketSignature(entry: ReviewPacketHistoryEntry) {
  return JSON.stringify({
    section: entry.section,
    title: entry.title,
    blocks: entry.blocks.map((block) => ({
      id: block.id,
      title: block.title,
      lines: block.lines,
    })),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
