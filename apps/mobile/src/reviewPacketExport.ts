import type { LanguageCopy } from "@pmhc/i18n";
import type { AppLanguage } from "@pmhc/types";
import type { ReviewPacketHistoryEntry } from "./reviewPacketHistory";
import type { ReviewSection } from "./reviewRecap";

export type ReviewPacketArchiveFilter = "all" | ReviewSection;

type ReviewPacketExportSource = {
  blocks: ReviewPacketHistoryEntry["blocks"];
  createdAt: string;
  section: ReviewSection;
  title: string;
};

export function filterReviewPacketHistory(
  history: ReviewPacketHistoryEntry[],
  filter: ReviewPacketArchiveFilter,
) {
  if (filter === "all") {
    return history;
  }

  return history.filter((entry) => entry.section === filter);
}

export function buildReviewPacketExportText({
  copy,
  entry,
  language,
}: {
  copy: LanguageCopy;
  entry: ReviewPacketExportSource;
  language: AppLanguage;
}) {
  return [
    entry.title,
    copy.review.archiveSavedAt(copy.review.filterLabels[entry.section], formatPacketSavedAt(entry.createdAt, language)),
    ...entry.blocks.flatMap((block) => [block.title, ...block.lines].join("\n")),
  ].join("\n\n");
}

export function formatPacketSavedAt(createdAt: string, language: AppLanguage) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}
