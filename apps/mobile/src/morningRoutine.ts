import { morningRoutineEvidenceSources } from "@pmhc/evidence";
import type { AppLanguage, ContentItem, QuickLogDefinition, TodayPayload } from "@pmhc/types";

export type MorningRoutine = {
  title: string;
  body: string;
  note: string;
  guideItemId: string | null;
  logDefinition: QuickLogDefinition | null;
  steps: {
    id: "anchor" | "checkin" | "guide";
    title: string;
    body: string;
    badge: string;
    cta: string | null;
    ctaKind: "guide" | "log" | null;
    sourceLabels: string[];
  }[];
};

type Input = {
  content: ContentItem[];
  language: AppLanguage;
  today: TodayPayload;
};

const guideId = "morning-routine-reset";

const copy = {
  en: {
    title: "Morning routine",
    body: "A short evidence-backed start: steady wake-up, one calm check-in, one gentle movement cue.",
    note: "Good fit for repeated morning actions. Longer instructions and courses should stay in Learn or Programs.",
    anchorTitle: "Wake and light anchor",
    anchorBody: "Keep the wake time steady and get outdoor light early when you can.",
    checkinTitle: "One calm check-in",
    checkinBody: (label: string) => `Log ${label.toLowerCase()} once and move on without turning the morning into a diagnosis.`,
    guideTitle: "Morning reset guide",
    guideBody: "Open the short guide for the conservative version of the routine and the source basis behind it.",
    anchorBadge: "Anchor",
    checkinBadge: "Check-in",
    guideBadge: "Guide",
    openGuide: "Open guide",
    openLog: "Quick log",
  },
  ru: {
    title: "Утренняя рутина",
    body: "Короткий старт на проверенной базе: стабильный подъем, один спокойный чек-ин и один мягкий сигнал на движение.",
    note: "Повторяемые утренние действия лучше держать здесь, а длинные инструкции и курсы — в Базе или Плане.",
    anchorTitle: "Подъем и дневной свет",
    anchorBody: "Старайся вставать примерно в одно время и получить дневной свет как можно раньше.",
    checkinTitle: "Один спокойный чек-ин",
    checkinBody: (label: string) => `Отметь ${label.toLowerCase()} один раз и не превращай утро в самодиагностику.`,
    guideTitle: "Гид по мягкому утру",
    guideBody: "Открой короткий гид с консервативной версией рутины и источниками, на которые она опирается.",
    anchorBadge: "Основа",
    checkinBadge: "Чек-ин",
    guideBadge: "Гид",
    openGuide: "Открыть гид",
    openLog: "Быстрый лог",
  },
} as const;

export function buildMorningRoutine({ content, language, today }: Input): MorningRoutine {
  const guide = content.find((item) => item.id === guideId) ?? null;
  const preferredLog =
    today.quickLogs.find((log) => log.type === "morning_erection") ??
    today.quickLogs.find((log) => log.type === "sleep_quality") ??
    today.quickLogs.find((log) => log.type === "energy") ??
    today.quickLogs[0] ??
    null;
  const languageCopy = copy[language];

  return {
    title: languageCopy.title,
    body: languageCopy.body,
    note: languageCopy.note,
    guideItemId: guide?.id ?? null,
    logDefinition: preferredLog,
    steps: [
      {
        id: "anchor",
        title: languageCopy.anchorTitle,
        body: languageCopy.anchorBody,
        badge: languageCopy.anchorBadge,
        cta: null,
        ctaKind: null,
        sourceLabels: morningRoutineEvidenceSources.slice(0, 2).map((source) => source.organization),
      },
      {
        id: "checkin",
        title: languageCopy.checkinTitle,
        body: languageCopy.checkinBody(preferredLog?.label ?? "one signal"),
        badge: languageCopy.checkinBadge,
        cta: languageCopy.openLog,
        ctaKind: "log",
        sourceLabels: [morningRoutineEvidenceSources[1]?.organization, morningRoutineEvidenceSources[2]?.organization].filter(Boolean),
      },
      {
        id: "guide",
        title: languageCopy.guideTitle,
        body: languageCopy.guideBody,
        badge: languageCopy.guideBadge,
        cta: languageCopy.openGuide,
        ctaKind: "guide",
        sourceLabels: morningRoutineEvidenceSources.map((source) => source.organization),
      },
    ],
  };
}
