import type { AppLanguage } from "@pmhc/types";
import type { DaySimplificationSource, DaySimplificationStore } from "./daySimplification";

export type DaySimplificationReviewTone = "full" | "targeted" | "protective";
export type DaySimplificationReviewReason =
  | "none_recent"
  | "single_day"
  | "mixed_sources"
  | "repeated_days"
  | "active_streak";
export type DaySimplificationReviewNextStep =
  | "keep_optional"
  | "return_when_quiet"
  | "watch_repeat"
  | "keep_small";

export type DaySimplificationReview = {
  title: string;
  body: string;
  toneId: DaySimplificationReviewTone;
  reasonId: DaySimplificationReviewReason;
  nextStepId: DaySimplificationReviewNextStep;
  tone: string;
  reason: string;
  nextStepTitle: string;
  nextStep: string;
  meta: string;
  todayLine: string;
  sourceLine: string | null;
  activeDays: number;
  streak: number;
  todayActive: boolean;
  sourceCounts: Record<DaySimplificationSource, number>;
};

type LocalizedCopy = {
  title: string;
  body: string;
  nextStepTitle: string;
  tones: Record<DaySimplificationReviewTone, string>;
  reasons: Record<DaySimplificationReviewReason, string>;
  nextSteps: Record<DaySimplificationReviewNextStep, string>;
  meta: (activeDays: number, streak: number) => string;
  activeToday: (sourceLabel: string) => string;
  inactiveToday: string;
  sourceLine: (todayCount: number, programsCount: number) => string;
  sourceLabels: Record<DaySimplificationSource, string>;
};

const copy: Record<AppLanguage, LocalizedCopy> = {
  en: {
    title: "Lighter day review",
    body: "A short 7-day read of how often the app kept the day in the lighter preset.",
    nextStepTitle: "Lighter-day next step",
    tones: {
      full: "Mostly full days",
      targeted: "Used as support",
      protective: "Week stayed compressed",
    },
    reasons: {
      none_recent:
        "No lighter days were kept in the last 7 days, so the app has not needed to trim the plan lately.",
      single_day:
        "One lighter day looks like a targeted downshift, not the whole weekly pattern.",
      mixed_sources:
        "The lighter preset came from both Today and Programs, which usually means the scope needed trimming from more than one angle.",
      repeated_days:
        "Several recent days stayed in the lighter preset, so the week has been running with a smaller surface.",
      active_streak:
        "The lighter preset has been active for multiple days in a row, which is a stronger pattern than a one-off downshift.",
    },
    nextSteps: {
      keep_optional:
        "Leave lighter day as an option for narrow days, not the default shape of the week.",
      return_when_quiet:
        "Use it when the day tightens, then return to the full plan once the signal is quiet again.",
      watch_repeat:
        "Watch whether the same compression shows up again before adding more ambition.",
      keep_small:
        "Keep the next day or two small enough that the app does not need to rescue the plan again.",
    },
    meta: (activeDays, streak) =>
      `Lighter days: ${activeDays}/7 - Current streak: ${formatEnglishDayCount(streak)}`,
    activeToday: (sourceLabel) => `Active today from ${sourceLabel}.`,
    inactiveToday: "Not active today.",
    sourceLine: (todayCount, programsCount) => `Today: ${todayCount} - Programs: ${programsCount}`,
    sourceLabels: {
      today: "Today",
      programs: "Programs",
    },
  },
  ru: {
    title: "РћР±Р·РѕСЂ С‰Р°РґСЏС‰РµРіРѕ РґРЅСЏ",
    body: "РљРѕСЂРѕС‚РєРёР№ РІР·РіР»СЏРґ РЅР° РїРѕСЃР»РµРґРЅРёРµ 7 РґРЅРµР№: РєР°Рє С‡Р°СЃС‚Рѕ РїСЂРёР»РѕР¶РµРЅРёРµ РѕСЃС‚Р°РІР»СЏР»Рѕ РґРµРЅСЊ РІ С‰Р°РґСЏС‰РµРј СЂРµР¶РёРјРµ.",
    nextStepTitle: "РЎР»РµРґСѓСЋС‰РёР№ С€Р°Рі РґР»СЏ С‰Р°РґСЏС‰РµРіРѕ РґРЅСЏ",
    tones: {
      full: "РџРѕРєР° РїСЂРµРѕР±Р»Р°РґР°СЋС‚ РѕР±С‹С‡РЅС‹Рµ РґРЅРё",
      targeted: "РЎСЂР°Р±Р°С‚С‹РІР°Р» РєР°Рє РїРѕРґРґРµСЂР¶РєР°",
      protective: "РќРµРґРµР»СЏ РёС€Р»Р° РІ СЃР¶Р°С‚РѕРј СЂРµР¶РёРјРµ",
    },
    reasons: {
      none_recent:
        "Р—Р° РїРѕСЃР»РµРґРЅРёРµ 7 РґРЅРµР№ С‰Р°РґСЏС‰РёС… РґРЅРµР№ РЅРµ Р±С‹Р»Рѕ, Р·РЅР°С‡РёС‚ РїР»Р°РЅ РЅРµ РїСЂРёС…РѕРґРёР»РѕСЃСЊ СЃРѕРєСЂР°С‰Р°С‚СЊ.",
      single_day:
        "РћРґРёРЅ С‰Р°РґСЏС‰РёР№ РґРµРЅСЊ РїРѕС…РѕР¶ РЅР° С‚РѕС‡РµС‡РЅРѕРµ СЃРЅРёР¶РµРЅРёРµ С‚РµРјРїР°, Р° РЅРµ РЅР° РІСЃСЋ РЅРµРґРµР»СЋ.",
      mixed_sources:
        "Р©Р°РґСЏС‰РёР№ СЂРµР¶РёРј РІРєР»СЋС‡Р°Р»СЃСЏ Рё РёР· Today, Рё РёР· Programs. РћР±С‹С‡РЅРѕ СЌС‚Рѕ Р·РЅР°С‡РёС‚, С‡С‚Рѕ РґРµРЅСЊ РїСЂРёС…РѕРґРёР»РѕСЃСЊ СЃСѓР¶Р°С‚СЊ СЃ СЂР°Р·РЅС‹С… СЃС‚РѕСЂРѕРЅ.",
      repeated_days:
        "РќРµСЃРєРѕР»СЊРєРѕ РЅРµРґР°РІРЅРёС… РґРЅРµР№ РѕСЃС‚Р°РІР°Р»РёСЃСЊ РІ С‰Р°РґСЏС‰РµРј СЂРµР¶РёРјРµ, Р·РЅР°С‡РёС‚ РЅРµРґРµР»СЏ РёРґРµС‚ СЃ РјРµРЅСЊС€РёРј СЂР°Р·РјР°С…РѕРј.",
      active_streak:
        "Р©Р°РґСЏС‰РёР№ СЂРµР¶РёРј РґРµСЂР¶РёС‚СЃСЏ РЅРµСЃРєРѕР»СЊРєРѕ РґРЅРµР№ РїРѕРґСЂСЏРґ, Рё СЌС‚Рѕ СѓР¶Рµ СЃРёР»СЊРЅРµРµ, С‡РµРј РѕРґРёРЅ СЂР°Р·РѕРІС‹Р№ downshift.",
    },
    nextSteps: {
      keep_optional:
        "РџСѓСЃС‚СЊ С‰Р°РґСЏС‰РёР№ РґРµРЅСЊ РѕСЃС‚Р°РµС‚СЃСЏ РёРЅСЃС‚СЂСѓРјРµРЅС‚РѕРј РґР»СЏ СѓР·РєРёС… РґРЅРµР№, Р° РЅРµ СЂРµР¶РёРјРѕРј РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ.",
      return_when_quiet:
        "Р’РєР»СЋС‡Р°Р№ РµРіРѕ, РєРѕРіРґР° РґРµРЅСЊ СЃСѓР¶Р°РµС‚СЃСЏ, Рё РІРѕР·РІСЂР°С‰Р°Р№СЃСЏ Рє РѕР±С‹С‡РЅРѕРјСѓ РїР»Р°РЅСѓ, РєРѕРіРґР° СЃРёРіРЅР°Р» СЃРЅРѕРІР° СЃРїРѕРєРѕРµРЅ.",
      watch_repeat:
        "РџРѕСЃРјРѕС‚СЂРё, РїРѕРІС‚РѕСЂРёС‚СЃСЏ Р»Рё С‚Р°РєРѕРµ СЃР¶Р°С‚РёРµ РµС‰Рµ СЂР°Р·, РїСЂРµР¶РґРµ С‡РµРј РґРѕР±Р°РІР»СЏС‚СЊ РЅРѕРІСѓСЋ Р°РјР±РёС†РёСЋ.",
      keep_small:
        "РћСЃС‚Р°РІСЊ Р±Р»РёР¶Р°Р№С€РёР№ РґРµРЅСЊ РёР»Рё РґРІР° РґРѕСЃС‚Р°С‚РѕС‡РЅРѕ РЅРµР±РѕР»СЊС€РёРјРё, С‡С‚РѕР±С‹ РїСЂРёР»РѕР¶РµРЅРёСЋ РЅРµ РїСЂРёС…РѕРґРёР»РѕСЃСЊ СЃРЅРѕРІР° СЃРїР°СЃР°С‚СЊ РїР»Р°РЅ.",
    },
    meta: (activeDays, streak) =>
      `Р©Р°РґСЏС‰РёС… РґРЅРµР№: ${activeDays}/7 - РўРµРєСѓС‰Р°СЏ СЃРµСЂРёСЏ: ${formatRussianDayCount(streak)}`,
    activeToday: (sourceLabel) => `РЎРµРіРѕРґРЅСЏ С‰Р°РґСЏС‰РёР№ СЂРµР¶РёРј РІРєР»СЋС‡РµРЅ РёР· ${sourceLabel}.`,
    inactiveToday: "РЎРµРіРѕРґРЅСЏ С‰Р°РґСЏС‰РёР№ СЂРµР¶РёРј РЅРµ Р°РєС‚РёРІРµРЅ.",
    sourceLine: (todayCount, programsCount) => `РЎРµРіРѕРґРЅСЏ: ${todayCount} - РџСЂРѕРіСЂР°РјРјС‹: ${programsCount}`,
    sourceLabels: {
      today: "РЎРµРіРѕРґРЅСЏ",
      programs: "РџСЂРѕРіСЂР°РјРјС‹",
    },
  },
};

export function buildDaySimplificationReview({
  date,
  language,
  store,
}: {
  date: string;
  language: AppLanguage;
  store: DaySimplificationStore;
}): DaySimplificationReview {
  const languageCopy = copy[language];
  const last7Dates = Array.from({ length: 7 }, (_, index) => shiftDate(date, -index));
  const activeEntries = last7Dates.map((currentDate) => store[currentDate]).filter(isEntry);
  const sourceCounts = activeEntries.reduce<Record<DaySimplificationSource, number>>(
    (accumulator, entry) => {
      accumulator[entry.source] += 1;
      return accumulator;
    },
    {
      today: 0,
      programs: 0,
    },
  );
  const activeDays = activeEntries.length;
  const streak = countCurrentStreak(date, store);
  const todayEntry = store[date] ?? null;
  const todayActive = todayEntry != null;
  const summary = selectSummary({
    activeDays,
    sourceCounts,
    streak,
  });

  return {
    title: languageCopy.title,
    body: languageCopy.body,
    toneId: summary.tone,
    reasonId: summary.reason,
    nextStepId: summary.nextStep,
    tone: languageCopy.tones[summary.tone],
    reason: languageCopy.reasons[summary.reason],
    nextStepTitle: languageCopy.nextStepTitle,
    nextStep: languageCopy.nextSteps[summary.nextStep],
    meta: languageCopy.meta(activeDays, streak),
    todayLine: todayActive
      ? languageCopy.activeToday(languageCopy.sourceLabels[todayEntry.source])
      : languageCopy.inactiveToday,
    sourceLine: activeDays > 0 ? languageCopy.sourceLine(sourceCounts.today, sourceCounts.programs) : null,
    activeDays,
    streak,
    todayActive,
    sourceCounts,
  };
}

function selectSummary({
  activeDays,
  sourceCounts,
  streak,
}: {
  activeDays: number;
  sourceCounts: Record<DaySimplificationSource, number>;
  streak: number;
}) {
  if (activeDays === 0) {
    return {
      tone: "full",
      reason: "none_recent",
      nextStep: "keep_optional",
    } satisfies Summary;
  }

  if (streak >= 2) {
    return {
      tone: "protective",
      reason: "active_streak",
      nextStep: "keep_small",
    } satisfies Summary;
  }

  if (activeDays >= 4) {
    return {
      tone: "protective",
      reason: "repeated_days",
      nextStep: "keep_small",
    } satisfies Summary;
  }

  if (sourceCounts.today > 0 && sourceCounts.programs > 0) {
    return {
      tone: "targeted",
      reason: "mixed_sources",
      nextStep: "watch_repeat",
    } satisfies Summary;
  }

  return {
    tone: "targeted",
    reason: "single_day",
    nextStep: "return_when_quiet",
  } satisfies Summary;
}

type Summary = {
  tone: DaySimplificationReviewTone;
  reason: DaySimplificationReviewReason;
  nextStep: DaySimplificationReviewNextStep;
};

function isEntry(
  value: DaySimplificationStore[string] | undefined,
): value is NonNullable<DaySimplificationStore[string]> {
  return value != null;
}

function countCurrentStreak(date: string, store: DaySimplificationStore) {
  let streak = 0;

  while (store[shiftDate(date, -streak)]) {
    streak += 1;
  }

  return streak;
}

function shiftDate(date: string, days: number) {
  const nextDate = new Date(`${date}T00:00:00.000Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function formatEnglishDayCount(count: number) {
  return `${count} day${count === 1 ? "" : "s"}`;
}

function formatRussianDayCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} РґРµРЅСЊ`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} РґРЅСЏ`;
  }

  return `${count} РґРЅРµР№`;
}
