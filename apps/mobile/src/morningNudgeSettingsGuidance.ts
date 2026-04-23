import type { AppLanguage } from "@pmhc/types";
import type { MorningNudgePreferences } from "./morningNudge";
import type { MorningNudgeGuidanceState, MorningNudgeReview } from "./morningNudgeReview";

export type MorningNudgeSettingsGuidance = {
  title: string;
  body: string;
  tone: string;
  meta: string;
  changeLines: string[];
  ctaLabel: string | null;
  statusLabel: string;
  recommendedPreferences: MorningNudgePreferences | null;
};

type LocalizedCopy = {
  title: string;
  styleLabel: string;
  timingLabel: string;
  cadenceLabel: string;
  enabledLabel: string;
  stateOn: string;
  stateOff: string;
  cadenceWeekdays: string;
  cadenceDaily: string;
  ctas: Partial<Record<MorningNudgeGuidanceState, string>>;
  keepCurrent: string;
  alreadyAligned: string;
  changeLine: (field: string, from: string, to: string) => string;
};

const timeLabels = {
  early: "07:15",
  standard: "08:00",
  late: "09:00",
} as const;

const copy: Record<AppLanguage, LocalizedCopy> = {
  en: {
    title: "Recommended setup",
    styleLabel: "Style",
    timingLabel: "Timing",
    cadenceLabel: "Cadence",
    enabledLabel: "State",
    stateOn: "On",
    stateOff: "Off",
    cadenceWeekdays: "Weekdays",
    cadenceDaily: "Daily",
    ctas: {
      optional: "Pause nudges for now",
      simplify: "Apply calmer setup",
      pair: "Apply pairing setup",
      same_cue: "Use one cue",
    },
    keepCurrent: "Leave the current reminder setup as it is for now.",
    alreadyAligned: "Current settings already fit this morning read.",
    changeLine: (field, from, to) => `${field}: ${from} -> ${to}`,
  },
  ru: {
    title: "Рекомендованная настройка",
    styleLabel: "Стиль",
    timingLabel: "Время",
    cadenceLabel: "Ритм",
    enabledLabel: "Состояние",
    stateOn: "Включен",
    stateOff: "Выключен",
    cadenceWeekdays: "Будни",
    cadenceDaily: "Каждый день",
    ctas: {
      optional: "Пока выключить сигнал",
      simplify: "Применить более спокойную схему",
      pair: "Применить схему для чек-ина",
      same_cue: "Оставить один сигнал",
    },
    keepCurrent: "Пока лучше не менять текущую настройку сигнала.",
    alreadyAligned: "Текущая настройка уже совпадает с этой подсказкой.",
    changeLine: (field, from, to) => `${field}: ${from} -> ${to}`,
  },
};

export function buildMorningNudgeSettingsGuidance({
  language,
  preferences,
  review,
}: {
  language: AppLanguage;
  preferences: MorningNudgePreferences;
  review: MorningNudgeReview;
}): MorningNudgeSettingsGuidance {
  const languageCopy = copy[language];
  const recommendedPreferences = buildRecommendedPreferences(preferences, review.guidanceState);
  const nextPreferences =
    recommendedPreferences && !arePreferencesEqual(preferences, recommendedPreferences) ? recommendedPreferences : null;
  const changeLines = nextPreferences ? buildChangeLines(language, preferences, nextPreferences) : [];

  return {
    title: languageCopy.title,
    body: review.guidanceBody,
    tone: review.guidanceTone,
    meta: review.guidanceMeta,
    changeLines,
    ctaLabel: nextPreferences ? languageCopy.ctas[review.guidanceState] ?? null : null,
    statusLabel: nextPreferences ? review.guidanceBody : recommendedPreferences ? languageCopy.alreadyAligned : languageCopy.keepCurrent,
    recommendedPreferences: nextPreferences,
  };
}

function buildRecommendedPreferences(
  preferences: MorningNudgePreferences,
  guidanceState: MorningNudgeGuidanceState,
): MorningNudgePreferences | null {
  switch (guidanceState) {
    case "optional":
      return preferences.enabled
        ? {
            ...preferences,
            enabled: false,
          }
        : null;
    case "simplify":
      return {
        enabled: true,
        tone: "discreet",
        timePreset: preferences.timePreset === "late" ? "standard" : preferences.timePreset,
        weekdaysOnly: true,
      };
    case "pair":
      return {
        enabled: true,
        tone: "supportive",
        timePreset: preferences.timePreset === "late" ? "standard" : preferences.timePreset,
        weekdaysOnly: true,
      };
    case "same_cue":
      return {
        enabled: true,
        tone: "discreet",
        timePreset: preferences.timePreset === "late" ? "standard" : preferences.timePreset,
        weekdaysOnly: true,
      };
    case "repeat":
    case "hold":
    case "steady":
      return null;
  }
}

function buildChangeLines(
  language: AppLanguage,
  current: MorningNudgePreferences,
  next: MorningNudgePreferences,
) {
  const languageCopy = copy[language];
  const lines: string[] = [];

  if (current.enabled !== next.enabled) {
    lines.push(
      languageCopy.changeLine(
        languageCopy.enabledLabel,
        current.enabled ? languageCopy.stateOn : languageCopy.stateOff,
        next.enabled ? languageCopy.stateOn : languageCopy.stateOff,
      ),
    );
  }

  if (current.tone !== next.tone) {
    lines.push(
      languageCopy.changeLine(
        languageCopy.styleLabel,
        formatTone(language, current.tone),
        formatTone(language, next.tone),
      ),
    );
  }

  if (current.timePreset !== next.timePreset) {
    lines.push(
      languageCopy.changeLine(
        languageCopy.timingLabel,
        timeLabels[current.timePreset],
        timeLabels[next.timePreset],
      ),
    );
  }

  if (current.weekdaysOnly !== next.weekdaysOnly) {
    lines.push(
      languageCopy.changeLine(
        languageCopy.cadenceLabel,
        current.weekdaysOnly ? languageCopy.cadenceWeekdays : languageCopy.cadenceDaily,
        next.weekdaysOnly ? languageCopy.cadenceWeekdays : languageCopy.cadenceDaily,
      ),
    );
  }

  return lines;
}

function formatTone(language: AppLanguage, tone: MorningNudgePreferences["tone"]) {
  if (language === "ru") {
    return tone === "discreet" ? "Ненавязчивый" : "Поддерживающий";
  }

  return tone === "discreet" ? "Discreet" : "Supportive";
}

function arePreferencesEqual(left: MorningNudgePreferences, right: MorningNudgePreferences) {
  return (
    left.enabled === right.enabled &&
    left.tone === right.tone &&
    left.timePreset === right.timePreset &&
    left.weekdaysOnly === right.weekdaysOnly
  );
}
