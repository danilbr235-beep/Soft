import type { AppLanguage } from "@pmhc/types";
import type { MorningNudgeHistoryEntry, MorningNudgePlan } from "./morningNudge";

export type MorningNudgeReview = {
  title: string;
  body: string;
  stateTitle: string;
  stateLabel: string;
  timingTitle: string;
  timingLabel: string;
  styleTitle: string;
  styleLabel: string;
  focusTitle: string;
  focusLabel: string;
  previewTitle: string;
  previewBody: string;
  historyTitle: string;
  historyLabel: string;
};

const copy = {
  en: {
    title: "Morning nudge review",
    body: "A short read of the current local reminder setup for the morning loop.",
    stateTitle: "State",
    historyTitle: "Recent changes",
    noChanges: "No recent morning nudge changes yet.",
    lastChanged: (changedAt: string) => `Last changed ${changedAt}`,
    recentChanges: (count: number) => `${count} ${count === 1 ? "adjustment" : "adjustments"} in the last 30 days`,
  },
  ru: {
    title: "Обзор утренних сигналов",
    body: "Короткий вывод по тому, как сейчас настроено локальное напоминание для утреннего цикла.",
    stateTitle: "Состояние",
    historyTitle: "Недавние изменения",
    noChanges: "Недавних изменений утреннего сигнала пока не было.",
    lastChanged: (changedAt: string) => `Последнее изменение: ${changedAt}`,
    recentChanges: (count: number) => `${count} ${russianAdjustmentWord(count)} за последние 30 дней`,
  },
} as const;

export function buildMorningNudgeReview({
  history,
  language,
  plan,
}: {
  history: MorningNudgeHistoryEntry[];
  language: AppLanguage;
  plan: MorningNudgePlan;
}): MorningNudgeReview {
  const languageCopy = copy[language];
  const recentChanges = countRecentChanges(history, 30);
  const lastChangedAt = history[0]?.changedAt ? formatChangedAt(history[0].changedAt, language) : null;
  const historyLabel =
    recentChanges > 0 && lastChangedAt
      ? `${languageCopy.lastChanged(lastChangedAt)} - ${languageCopy.recentChanges(recentChanges)}`
      : languageCopy.noChanges;

  return {
    title: languageCopy.title,
    body: languageCopy.body,
    stateTitle: languageCopy.stateTitle,
    stateLabel: plan.stateLabel,
    timingTitle: plan.timingTitle,
    timingLabel: plan.timingLabel,
    styleTitle: plan.styleTitle,
    styleLabel: plan.styleLabel,
    focusTitle: plan.focusTitle,
    focusLabel: plan.focusLabel,
    previewTitle: plan.previewTitle,
    previewBody: plan.previewBody,
    historyTitle: languageCopy.historyTitle,
    historyLabel,
  };
}

function countRecentChanges(history: MorningNudgeHistoryEntry[], windowDays: number) {
  const now = Date.now();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  return history.filter((entry) => {
    const changedAtMs = Date.parse(entry.changedAt);
    return !Number.isNaN(changedAtMs) && now - changedAtMs <= windowMs;
  }).length;
}

function formatChangedAt(changedAt: string, language: AppLanguage) {
  const date = new Date(changedAt);

  if (Number.isNaN(date.getTime())) {
    return changedAt;
  }

  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function russianAdjustmentWord(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "изменений";
  }

  if (last === 1) {
    return "изменение";
  }

  if (last >= 2 && last <= 4) {
    return "изменения";
  }

  return "изменений";
}
