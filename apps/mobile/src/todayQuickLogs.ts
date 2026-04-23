import type { AppLanguage, QuickLogDefinition, QuickLogType } from "@pmhc/types";
import type { AdaptiveDayGuidanceState } from "./coachAdaptiveNudge";
import type { DaySimplificationState } from "./daySimplification";

export type TodayQuickLogSurface = {
  logs: QuickLogDefinition[];
  noteTitle: string | null;
  noteBody: string | null;
  noteMeta: string | null;
  sheetSubtitle: string | null;
};

export function buildTodayQuickLogSurface({
  daySimplification,
  guidanceState,
  language,
  logs,
}: {
  daySimplification: DaySimplificationState;
  guidanceState: AdaptiveDayGuidanceState;
  language: AppLanguage;
  logs: QuickLogDefinition[];
}): TodayQuickLogSurface {
  if (!daySimplification.active || logs.length === 0) {
    return {
      logs,
      noteTitle: null,
      noteBody: null,
      noteMeta: null,
      sheetSubtitle: null,
    };
  }

  const visibleLogs = pickLogs(logs, preferredLogTypes[guidanceState], visibleLogCaps[guidanceState]);
  const copy = surfaceCopy[language][guidanceState];

  return {
    logs: visibleLogs,
    noteTitle: copy.title,
    noteBody: copy.body,
    noteMeta:
      visibleLogs.length < logs.length ? countLine(language, visibleLogs.length, logs.length) : null,
    sheetSubtitle: copy.sheetSubtitle,
  };
}

function pickLogs(logs: QuickLogDefinition[], preferredTypes: readonly QuickLogType[], cap: number) {
  const logsByType = new Map(logs.map((log) => [log.type, log] as const));
  const ordered: QuickLogDefinition[] = [];
  const seenTypes = new Set<QuickLogType>();

  for (const type of preferredTypes) {
    const log = logsByType.get(type);

    if (!log || seenTypes.has(type)) {
      continue;
    }

    ordered.push(log);
    seenTypes.add(type);
  }

  for (const log of logs) {
    if (seenTypes.has(log.type)) {
      continue;
    }

    ordered.push(log);
    seenTypes.add(log.type);
  }

  return ordered.slice(0, Math.min(cap, logs.length));
}

function countLine(language: AppLanguage, visibleCount: number, totalCount: number) {
  if (language === "ru") {
    return `РћС‚РєСЂС‹С‚Рѕ ${visibleCount} РёР· ${totalCount} Р±С‹СЃС‚СЂС‹С… Р»РѕРіРѕРІ РЅР° СЃРµРіРѕРґРЅСЏ.`;
  }

  return `Showing ${visibleCount} of ${totalCount} quick logs today.`;
}

const visibleLogCaps: Record<AdaptiveDayGuidanceState, number> = {
  recovery: 3,
  narrow: 2,
  protect_morning: 2,
  steady: 2,
};

const preferredLogTypes: Record<AdaptiveDayGuidanceState, readonly QuickLogType[]> = {
  recovery: ["symptom_checkin", "sleep_quality", "energy", "confidence", "libido", "morning_erection"],
  narrow: ["confidence", "energy", "libido", "morning_erection", "sleep_quality", "symptom_checkin"],
  protect_morning: ["morning_erection", "confidence", "energy", "libido", "sleep_quality", "symptom_checkin"],
  steady: ["confidence", "energy", "libido", "morning_erection", "sleep_quality", "symptom_checkin"],
};

const surfaceCopy: Record<
  AppLanguage,
  Record<
    AdaptiveDayGuidanceState,
    {
      title: string;
      body: string;
      sheetSubtitle: string;
    }
  >
> = {
  en: {
    recovery: {
      title: "Keep the check-in conservative",
      body: "Start with symptom and recovery signals. Leave practice logs closed unless the day still needs them.",
      sheetSubtitle: "Start with symptom and recovery signals. You can open the rest later if it still matters.",
    },
    narrow: {
      title: "Keep to two calm scores",
      body: "Use two calm scores first. Add anything else only if the day stays quiet.",
      sheetSubtitle: "Keep this to two calm scores first. Add detail only if it still matters later.",
    },
    protect_morning: {
      title: "Morning rail first",
      body: "Use one quick morning check-in before opening the rest of the day.",
      sheetSubtitle: "Use one quick morning check-in first. Leave the rest closed until the morning rail is in place.",
    },
    steady: {
      title: "Keep the check-in light",
      body: "A short check-in is enough. The rest can stay closed today.",
      sheetSubtitle: "Keep this short. You can add more later if the day still needs it.",
    },
  },
  ru: {
    recovery: {
      title: "Р”РµСЂР¶Рё check-in РѕСЃС‚РѕСЂРѕР¶РЅС‹Рј",
      body: "РќР°С‡РЅРё СЃ СЃРёРјРїС‚РѕРјРѕРІ Рё РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ. РџСЂР°РєС‚РёРєРё Р»СѓС‡С€Рµ РїРѕРєР° РЅРµ РѕС‚РєСЂС‹РІР°С‚СЊ, РµСЃР»Рё РґРµРЅСЊ Рё Р±РµР· СЌС‚РѕРіРѕ РёРґРµС‚ С‚РёС…Рѕ.",
      sheetSubtitle: "РќР°С‡РЅРё СЃ СЃРёРјРїС‚РѕРјРѕРІ Рё РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ. РћСЃС‚Р°Р»СЊРЅРѕРµ РѕС‚РєСЂРѕРµС€СЊ РїРѕС‚РѕРј, РµСЃР»Рё СЌС‚Рѕ РІРѕРѕР±С‰Рµ РїРѕРЅР°РґРѕР±РёС‚СЃСЏ.",
    },
    narrow: {
      title: "РћСЃС‚Р°РІСЊ РґРІРµ СЃРїРѕРєРѕР№РЅС‹Рµ РѕС†РµРЅРєРё",
      body: "РЎРЅР°С‡Р°Р»Р° Р·Р°РїРёС€Рё РґРІРµ СЃРїРѕРєРѕР№РЅС‹Рµ РѕС†РµРЅРєРё. РћСЃС‚Р°Р»СЊРЅРѕРµ РґРѕР±Р°РІР»СЏР№ С‚РѕР»СЊРєРѕ РµСЃР»Рё РґРµРЅСЊ РёРґРµС‚ СЂРѕРІРЅРѕ.",
      sheetSubtitle: "РЎРЅР°С‡Р°Р»Р° РѕСЃС‚Р°РІСЊ РґРІРµ СЃРїРѕРєРѕР№РЅС‹Рµ РѕС†РµРЅРєРё. РџРѕРґСЂРѕР±РЅРѕСЃС‚Рё РґРѕР±Р°РІРёС€СЊ РїРѕС‚РѕРј, РµСЃР»Рё РѕРЅРё РІРїСЂР°РІРґСѓ РЅСѓР¶РЅС‹.",
    },
    protect_morning: {
      title: "РЎРЅР°С‡Р°Р»Р° СѓС‚СЂРµРЅРЅРёР№ СЂРµР»СЊСЃ",
      body: "РЎРґРµР»Р°Р№ РѕРґРёРЅ Р±С‹СЃС‚СЂС‹Р№ СѓС‚СЂРµРЅРЅРёР№ check-in, Р° РѕСЃС‚Р°Р»СЊРЅРѕРµ РѕС‚РєСЂС‹РІР°Р№ СѓР¶Рµ РїРѕС‚РѕРј.",
      sheetSubtitle: "РЎРЅР°С‡Р°Р»Р° РѕРґРёРЅ Р±С‹СЃС‚СЂС‹Р№ СѓС‚СЂРµРЅРЅРёР№ check-in. РћСЃС‚Р°Р»СЊРЅРѕРµ РїСѓСЃС‚СЊ РїРѕРєР° РѕСЃС‚Р°РЅРµС‚СЃСЏ Р·Р°РєСЂС‹С‚С‹Рј, РїРѕРєР° СѓС‚СЂРѕ РЅРµ СЃРѕР±РµСЂРµС‚СЃСЏ.",
    },
    steady: {
      title: "Р”РµСЂР¶Рё check-in РєРѕСЂРѕС‚РєРёРј",
      body: "РљРѕСЂРѕС‚РєРѕРіРѕ check-in РЅР° СЃРµРіРѕРґРЅСЏ РґРѕСЃС‚Р°С‚РѕС‡РЅРѕ. РћСЃС‚Р°Р»СЊРЅРѕРµ РјРѕР¶РµС‚ РїРѕР±С‹С‚СЊ Р·Р°РєСЂС‹С‚С‹Рј.",
      sheetSubtitle: "РљРѕСЂРѕС‚РєРѕРіРѕ check-in РґРѕСЃС‚Р°С‚РѕС‡РЅРѕ. РџРѕРґСЂРѕР±РЅРѕСЃС‚Рё РґРѕР±Р°РІРёС€СЊ РїРѕС‚РѕРј, РµСЃР»Рё РѕРЅРё РІРѕРѕР±С‰Рµ РїРѕРЅР°РґРѕР±СЏС‚СЃСЏ.",
    },
  },
};
