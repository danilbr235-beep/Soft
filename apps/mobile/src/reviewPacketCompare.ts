import type { ReviewPacketHistoryEntry } from "./reviewPacketHistory";

export type ReviewPacketCompareStatus = "same" | "changed";

export type ReviewPacketCompareBlock = {
  id: string;
  title: string;
  status: ReviewPacketCompareStatus;
  leftLines: string[];
  rightLines: string[];
};

export type ReviewPacketCompareResult = {
  left: ReviewPacketHistoryEntry;
  right: ReviewPacketHistoryEntry;
  totalBlocks: number;
  changedBlocks: number;
  blocks: ReviewPacketCompareBlock[];
};

export function buildReviewPacketCompare(
  history: ReviewPacketHistoryEntry[],
): ReviewPacketCompareResult | null {
  if (history.length < 2) {
    return null;
  }

  const [latest, previous] = history;
  const left = previous;
  const right = latest;
  const blockIds = collectBlockIds(left, right);
  const blocks = blockIds.map((blockId) => buildCompareBlock(left, right, blockId));
  const changedBlocks = blocks.filter((block) => block.status === "changed").length;

  return {
    left,
    right,
    totalBlocks: blocks.length,
    changedBlocks,
    blocks,
  };
}

function collectBlockIds(left: ReviewPacketHistoryEntry, right: ReviewPacketHistoryEntry) {
  const ids = new Set<string>();

  left.blocks.forEach((block) => ids.add(block.id));
  right.blocks.forEach((block) => ids.add(block.id));

  return Array.from(ids);
}

function buildCompareBlock(
  left: ReviewPacketHistoryEntry,
  right: ReviewPacketHistoryEntry,
  blockId: string,
): ReviewPacketCompareBlock {
  const leftBlock = left.blocks.find((block) => block.id === blockId);
  const rightBlock = right.blocks.find((block) => block.id === blockId);
  const leftLines = leftBlock?.lines ?? [];
  const rightLines = rightBlock?.lines ?? [];
  const title = rightBlock?.title ?? leftBlock?.title ?? blockId;
  const status =
    leftBlock?.title === rightBlock?.title && areLinesEqual(leftLines, rightLines) ? "same" : "changed";

  return {
    id: blockId,
    title,
    status,
    leftLines,
    rightLines,
  };
}

function areLinesEqual(leftLines: string[], rightLines: string[]) {
  return (
    leftLines.length === rightLines.length &&
    leftLines.every((line, index) => line === rightLines[index])
  );
}
