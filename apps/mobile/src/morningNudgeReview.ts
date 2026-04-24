import type { AppLanguage } from "@pmhc/types";
import type { MorningNudgeHistoryEntry, MorningNudgePlan } from "./morningNudge";
import type { MorningRoutineReview } from "./morningRoutineReview";

export type MorningNudgeGuidanceState = "optional" | "simplify" | "pair" | "same_cue" | "repeat" | "hold" | "steady";

export type MorningNudgeReview = {
  title: string;
  body: string;
  pattern: string;
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
  guidanceState: MorningNudgeGuidanceState;
  guidanceTitle: string;
  guidanceTone: string;
  guidanceBody: string;
  guidanceMeta: string;
};

type LocalizedCopy = {
  title: string;
  body: string;
  patterns: Record<MorningNudgeGuidanceState, string>;
  stateTitle: string;
  historyTitle: string;
  noChanges: string;
  noRecentChanges: string;
  lastChanged: (changedAt: string) => string;
  recentChanges: (count: number) => string;
  guidanceTitle: string;
  guidanceTones: Record<MorningNudgeGuidanceState, string>;
  guidanceBodies: Record<MorningNudgeGuidanceState, string>;
};

const copy: Record<AppLanguage, LocalizedCopy> = {
  en: {
    title: "Morning nudge review",
    body: "A short read of the current local reminder setup for the morning loop.",
    patterns: {
      optional: "Pattern: reminder support is optional",
      simplify: "Pattern: one calmer cue fits best",
      pair: "Pattern: keep the cue and add the check-in",
      same_cue: "Pattern: one cue should carry the guide too",
      repeat: "Pattern: repeat before retuning",
      hold: "Pattern: recent changes are still settling",
      steady: "Pattern: current cue already fits",
    },
    stateTitle: "State",
    historyTitle: "Recent changes",
    noChanges: "No recent morning nudge changes yet.",
    noRecentChanges: "No reminder changes in the last 30 days.",
    lastChanged: (changedAt: string) => `Last changed ${changedAt}`,
    recentChanges: (count: number) => `${count} ${count === 1 ? "adjustment" : "adjustments"} in the last 30 days`,
    guidanceTitle: "Today nudge check",
    guidanceTones: {
      optional: "Optional support",
      simplify: "Keep one calm cue",
      pair: "Use one rail",
      same_cue: "One cue is enough",
      repeat: "Repeat first",
      hold: "Hold steady",
      steady: "Current cue is enough",
    },
    guidanceBodies: {
      optional:
        "You do not need a reminder just because it exists. Turn it on only if the anchor keeps slipping for a few mornings.",
      simplify:
        "The morning loop still needs the anchor to land first. Keep one calm cue and avoid retuning the reminder day to day.",
      pair:
        "Keep the same cue and place the quick check-in right after it. The next gain is consistency, not a new setting.",
      same_cue:
        "Do not add a second reminder. Let the same morning cue lead into the guide on the same day.",
      repeat:
        "Repeat the same reminder tomorrow before changing timing or style. The loop needs repetition more than optimization.",
      hold:
        "The reminder changed recently. Leave timing and tone alone for a few mornings so the loop can settle.",
      steady:
        "The morning loop is already holding. The current timing and style are enough for now.",
    },
  },
  ru: {
    title: "Обзор утреннего сигнала",
    body: "Короткий вывод по тому, как сейчас настроено локальное напоминание для утреннего цикла.",
    patterns: {
      optional: "Паттерн: сигнал пока только опциональная поддержка",
      simplify: "Паттерн: лучше оставить один спокойный сигнал",
      pair: "Паттерн: тот же сигнал стоит связать с чек-ином",
      same_cue: "Паттерн: одного сигнала достаточно и для гида",
      repeat: "Паттерн: сначала повторение, потом настройка",
      hold: "Паттерн: последние изменения еще укладываются",
      steady: "Паттерн: текущий сигнал уже подходит",
    },
    stateTitle: "Состояние",
    historyTitle: "Недавние изменения",
    noChanges: "Недавних изменений утреннего сигнала пока не было.",
    noRecentChanges: "За последние 30 дней настройки сигнала не менялись.",
    lastChanged: (changedAt: string) => `Последнее изменение: ${changedAt}`,
    recentChanges: (count: number) => `${count} ${russianAdjustmentWord(count)} за последние 30 дней`,
    guidanceTitle: "Подсказка на сегодня",
    guidanceTones: {
      optional: "Поддержка по желанию",
      simplify: "Оставь один спокойный сигнал",
      pair: "Один рельс для утра",
      same_cue: "Одного сигнала достаточно",
      repeat: "Сначала повторить",
      hold: "Ничего не менять",
      steady: "Текущего сигнала достаточно",
    },
    guidanceBodies: {
      optional:
        "Не обязательно включать сигнал только потому, что он доступен. Включай его, если утренний якорь срывается несколько дней подряд.",
      simplify:
        "Сейчас важнее сначала закрепить сам якорь утра. Оставь один спокойный сигнал и не перенастраивай его каждый день.",
      pair:
        "Оставь тот же сигнал и привяжи к нему короткий чек-ин. Следующий выигрыш здесь - регулярность, а не новая настройка.",
      same_cue:
        "Не добавляй второе напоминание. Пусть тот же утренний сигнал ведет и в чек-ин, и в короткий гид.",
      repeat:
        "Завтра повтори тот же сигнал еще раз, не трогая время и стиль. Сейчас утру полезнее повторяемость, чем настройка.",
      hold:
        "Сигнал недавно уже менялся. Оставь время и тон как есть на несколько дней, чтобы цикл успел закрепиться.",
      steady:
        "Утренний цикл уже держится. Текущего времени и стиля сигнала сейчас достаточно.",
    },
  },
};

export function buildMorningNudgeReview({
  history,
  language,
  plan,
  routineReview,
}: {
  history: MorningNudgeHistoryEntry[];
  language: AppLanguage;
  plan: MorningNudgePlan;
  routineReview: MorningRoutineReview;
}): MorningNudgeReview {
  const languageCopy = copy[language];
  const recentChanges14 = countRecentChanges(history, 14);
  const recentChanges30 = countRecentChanges(history, 30);
  const lastChangedAt = history[0]?.changedAt ? formatChangedAt(history[0].changedAt, language) : null;
  const historyLabel =
    recentChanges30 > 0 && lastChangedAt
      ? `${languageCopy.lastChanged(lastChangedAt)} - ${languageCopy.recentChanges(recentChanges30)}`
      : languageCopy.noChanges;
  const guidanceState = selectGuidanceState({
    plan,
    recentChanges14,
    routineReview,
  });

  return {
    title: languageCopy.title,
    body: languageCopy.body,
    pattern: languageCopy.patterns[guidanceState],
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
    guidanceState,
    guidanceTitle: languageCopy.guidanceTitle,
    guidanceTone: languageCopy.guidanceTones[guidanceState],
    guidanceBody: languageCopy.guidanceBodies[guidanceState],
    guidanceMeta: recentChanges30 > 0 ? languageCopy.recentChanges(recentChanges30) : languageCopy.noRecentChanges,
  };
}

function selectGuidanceState({
  plan,
  recentChanges14,
  routineReview,
}: {
  plan: MorningNudgePlan;
  recentChanges14: number;
  routineReview: MorningRoutineReview;
}): MorningNudgeGuidanceState {
  if (!plan.enabled) {
    return "optional";
  }

  if (routineReview.nextStepId === "protect_anchor") {
    return "simplify";
  }

  if (routineReview.nextStepId === "pair_checkin") {
    return "pair";
  }

  if (routineReview.nextStepId === "open_guide_same_morning") {
    return "same_cue";
  }

  if (recentChanges14 >= 2) {
    return "hold";
  }

  if (routineReview.nextStepId === "keep_same_loop") {
    return "steady";
  }

  return "repeat";
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
