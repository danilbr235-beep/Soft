import type { AppLanguage } from "@pmhc/types";
import type { MorningRoutineProgressEntry } from "./morningRoutineProgress";
import type { MorningRoutineReview } from "./morningRoutineReview";

export type MorningNudgeTone = "discreet" | "supportive";
export type MorningNudgeTimePreset = "early" | "standard" | "late";

export type MorningNudgePreferences = {
  enabled: boolean;
  tone: MorningNudgeTone;
  timePreset: MorningNudgeTimePreset;
  weekdaysOnly: boolean;
};

export type MorningNudgePlan = {
  enabled: boolean;
  title: string;
  body: string;
  stateLabel: string;
  timingTitle: string;
  timingLabel: string;
  styleTitle: string;
  styleLabel: string;
  focusTitle: string;
  focusLabel: string;
  previewTitle: string;
  previewBody: string;
};

export const defaultMorningNudgePreferences: MorningNudgePreferences = {
  enabled: true,
  tone: "discreet",
  timePreset: "standard",
  weekdaysOnly: true,
};

const timeLabels: Record<MorningNudgeTimePreset, string> = {
  early: "07:15",
  standard: "08:00",
  late: "09:00",
};

const copy = {
  en: {
    title: "Morning nudge",
    body: "A discreet local reminder plan tied to the current 7-day morning read.",
    disabledBody: "Morning nudges are off. Turn one on if you want a quiet cue for the anchor and check-in loop.",
    stateOn: "On",
    stateOff: "Off",
    timingTitle: "Timing",
    styleTitle: "Style",
    focusTitle: "Current focus",
    previewTitle: "Preview",
    cadenceWeekdays: "Weekdays",
    cadenceDaily: "Daily",
    styles: {
      discreet: "Discreet",
      supportive: "Supportive",
    } satisfies Record<MorningNudgeTone, string>,
    focusLabels: {
      protect_anchor: "Protect anchor",
      repeat_full_loop: "Repeat full loop",
      pair_checkin: "Pair check-in",
      open_guide_same_morning: "Open guide",
      keep_same_loop: "Keep same loop",
    } satisfies Record<MorningRoutineReview["nextStepId"], string>,
    previews: {
      off: "Morning nudges stay silent until you turn them back on.",
      doneDiscreet: "Morning loop is done. Same calm start tomorrow.",
      doneSupportive: "Today already landed. Keep the same short morning again tomorrow.",
      discreet: {
        protect_anchor: "Keep morning simple. Light first.",
        repeat_full_loop: "Same short three-step morning again.",
        pair_checkin: "Light first, then one quick check-in.",
        open_guide_same_morning: "Same morning, plus the short guide.",
        keep_same_loop: "Same calm loop again tomorrow.",
      } satisfies Record<MorningRoutineReview["nextStepId"], string>,
      supportive: {
        protect_anchor: "Start with wake time and daylight. Let the rest wait until that feels repeatable.",
        repeat_full_loop: "Repeat the same three-step morning once more before changing it.",
        pair_checkin: "After the anchor, add one calm check-in and stop there.",
        open_guide_same_morning: "Open the short guide on the same morning you do the check-in.",
        keep_same_loop: "Stay with the same short morning loop for a few more days.",
      } satisfies Record<MorningRoutineReview["nextStepId"], string>,
    },
  },
  ru: {
    title: "Утренний сигнал",
    body: "Локальный и незаметный план напоминания, привязанный к текущему 7-дневному разбору утра.",
    disabledBody: "Утренние сигналы выключены. Включи их, если хочешь тихое напоминание про якорь и короткий чек-ин.",
    stateOn: "Включен",
    stateOff: "Выключен",
    timingTitle: "Время",
    styleTitle: "Стиль",
    focusTitle: "Текущий фокус",
    previewTitle: "Пример сигнала",
    cadenceWeekdays: "Будни",
    cadenceDaily: "Каждый день",
    styles: {
      discreet: "Незаметный",
      supportive: "Поддерживающий",
    } satisfies Record<MorningNudgeTone, string>,
    focusLabels: {
      protect_anchor: "Держать якорь",
      repeat_full_loop: "Повторить цикл",
      pair_checkin: "Подвязать чек-ин",
      open_guide_same_morning: "Открыть гид",
      keep_same_loop: "Оставить цикл",
    } satisfies Record<MorningRoutineReview["nextStepId"], string>,
    previews: {
      off: "Пока утренние сигналы молчат, пока ты не включишь их снова.",
      doneDiscreet: "Утренний цикл уже закрыт. Завтра просто повтори тот же спокойный старт.",
      doneSupportive: "На сегодня утро уже собрано. Завтра лучше снова начать с того же короткого цикла.",
      discreet: {
        protect_anchor: "Утро держи простым. Сначала свет и подъем.",
        repeat_full_loop: "Завтра снова тот же короткий трехшаговый цикл.",
        pair_checkin: "Сначала свет, потом один короткий чек-ин.",
        open_guide_same_morning: "То же утро, плюс короткий гид.",
        keep_same_loop: "Завтра снова тот же спокойный цикл.",
      } satisfies Record<MorningRoutineReview["nextStepId"], string>,
      supportive: {
        protect_anchor: "Начни с подъема и дневного света. Остальное подожди, пока этот шаг не станет устойчивее.",
        repeat_full_loop: "Еще раз спокойно повтори тот же трехшаговый цикл, не меняя его.",
        pair_checkin: "После якоря добавь один спокойный чек-ин и на этом остановись.",
        open_guide_same_morning: "Открой короткий гид в то же утро, когда делаешь чек-ин.",
        keep_same_loop: "Оставь тот же короткий утренний цикл еще на несколько дней.",
      } satisfies Record<MorningRoutineReview["nextStepId"], string>,
    },
  },
} as const;

export function buildMorningNudgePlan({
  language,
  preferences,
  progressEntry,
  review,
}: {
  language: AppLanguage;
  preferences: MorningNudgePreferences;
  progressEntry?: MorningRoutineProgressEntry | null;
  review: MorningRoutineReview;
}): MorningNudgePlan {
  const languageCopy = copy[language];
  const cadenceLabel = preferences.weekdaysOnly ? languageCopy.cadenceWeekdays : languageCopy.cadenceDaily;
  const timingLabel = `${cadenceLabel} - ${timeLabels[preferences.timePreset]}`;
  const styleLabel = languageCopy.styles[preferences.tone];
  const completedToday = (progressEntry?.completedStepIds.length ?? 0) >= 3;

  return {
    enabled: preferences.enabled,
    title: languageCopy.title,
    body: preferences.enabled ? languageCopy.body : languageCopy.disabledBody,
    stateLabel: preferences.enabled ? languageCopy.stateOn : languageCopy.stateOff,
    timingTitle: languageCopy.timingTitle,
    timingLabel: preferences.enabled ? timingLabel : languageCopy.stateOff,
    styleTitle: languageCopy.styleTitle,
    styleLabel,
    focusTitle: languageCopy.focusTitle,
    focusLabel: languageCopy.focusLabels[review.nextStepId],
    previewTitle: languageCopy.previewTitle,
    previewBody: buildPreviewBody({
      completedToday,
      language,
      preferences,
      review,
    }),
  };
}

export function isMorningNudgePreferences(value: unknown): value is MorningNudgePreferences {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.enabled === "boolean" &&
    isMorningNudgeTone(value.tone) &&
    isMorningNudgeTimePreset(value.timePreset) &&
    typeof value.weekdaysOnly === "boolean"
  );
}

function buildPreviewBody({
  completedToday,
  language,
  preferences,
  review,
}: {
  completedToday: boolean;
  language: AppLanguage;
  preferences: MorningNudgePreferences;
  review: MorningRoutineReview;
}) {
  const languageCopy = copy[language];

  if (!preferences.enabled) {
    return languageCopy.previews.off;
  }

  if (completedToday) {
    return preferences.tone === "discreet"
      ? languageCopy.previews.doneDiscreet
      : languageCopy.previews.doneSupportive;
  }

  return languageCopy.previews[preferences.tone][review.nextStepId];
}

function isMorningNudgeTone(value: unknown): value is MorningNudgeTone {
  return value === "discreet" || value === "supportive";
}

function isMorningNudgeTimePreset(value: unknown): value is MorningNudgeTimePreset {
  return value === "early" || value === "standard" || value === "late";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
