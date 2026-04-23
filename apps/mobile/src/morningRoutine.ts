import { morningRoutineEvidenceSources } from "@pmhc/evidence";
import type { AppLanguage, ContentItem, QuickLogDefinition, TodayPayload } from "@pmhc/types";
import type { MorningRoutineReview } from "./morningRoutineReview";
import {
  buildMorningRoutineMetrics,
  morningRoutineStepIds,
  type MorningRoutineMetric,
  type MorningRoutineProgressEntry,
  type MorningRoutineProgressStore,
  type MorningRoutineStepId,
} from "./morningRoutineProgress";

export type MorningRoutineStep = {
  id: MorningRoutineStepId;
  title: string;
  body: string;
  badge: string;
  highlighted: boolean;
  highlightLabel: string | null;
  statusLabel: string;
  completed: boolean;
  cta: string;
  ctaKind: "guide" | "log" | "complete";
  actionLabel: string;
  sourceLabels: string[];
};

export type MorningRoutine = {
  title: string;
  body: string;
  note: string;
  guidance: {
    title: string;
    tone: string;
    reason: string;
    nextStepTitle: string;
    nextStep: string;
    meta: string;
  } | null;
  guideItemId: string | null;
  logDefinition: QuickLogDefinition | null;
  metrics: MorningRoutineMetric[];
  steps: MorningRoutineStep[];
};

type Input = {
  content: ContentItem[];
  language: AppLanguage;
  progressEntry?: MorningRoutineProgressEntry | null;
  progressStore: MorningRoutineProgressStore;
  review: MorningRoutineReview | null;
  today: TodayPayload;
};

const guideId = "morning-routine-reset";

const copy = {
  en: {
    title: "Morning routine",
    body: "A short evidence-backed start: steady wake-up, one calm check-in, one gentle movement cue.",
    note: "Good fit for repeated morning actions. Longer instructions and courses should stay in Learn or Programs.",
    guidanceTitle: "7-day morning read",
    anchorTitle: "Wake and light anchor",
    anchorBody: "Keep the wake time steady and get outdoor light early when you can.",
    checkinTitle: "One calm check-in",
    checkinBody: (label: string) => `Log ${label.toLowerCase()} once and move on without turning the morning into a diagnosis.`,
    guideTitle: "Morning reset guide",
    guideBody: "Open the short guide for the conservative version of the routine and the source basis behind it.",
    anchorBadge: "Anchor",
    checkinBadge: "Check-in",
    guideBadge: "Guide",
    ready: "Ready",
    done: "Done",
    openGuide: "Open guide",
    openLog: "Quick log",
    markDone: "Mark done",
    startHere: "Start here today",
    stepActionLabel: (title: string, cta: string) => `${cta}: ${title}`,
  },
  ru: {
    title: "Утренняя рутина",
    body: "Короткий старт на проверенной базе: стабильный подъем, один спокойный чек-ин и один мягкий сигнал на движение.",
    note: "Повторяемые утренние действия лучше держать здесь, а длинные инструкции и курсы — в Базе или Плане.",
    guidanceTitle: "Вывод по утру за 7 дней",
    anchorTitle: "Подъем и дневной свет",
    anchorBody: "Старайся вставать примерно в одно время и получить дневной свет как можно раньше.",
    checkinTitle: "Один спокойный чек-ин",
    checkinBody: (label: string) => `Отметь ${label.toLowerCase()} один раз и не превращай утро в самодиагностику.`,
    guideTitle: "Гид по мягкому утру",
    guideBody: "Открой короткий гид с консервативной версией рутины и источниками, на которые она опирается.",
    anchorBadge: "Основа",
    checkinBadge: "Чек-ин",
    guideBadge: "Гид",
    ready: "Готово",
    done: "Сделано",
    openGuide: "Открыть гид",
    openLog: "Быстрый лог",
    markDone: "Отметить",
    startHere: "Начни с этого",
    stepActionLabel: (title: string, cta: string) => `${cta}: ${title}`,
  },
} as const;

export function buildMorningRoutine({
  content,
  language,
  progressEntry,
  progressStore,
  review,
  today,
}: Input): MorningRoutine {
  const guide = content.find((item) => item.id === guideId) ?? null;
  const preferredLog =
    today.quickLogs.find((log) => log.type === "morning_erection") ??
    today.quickLogs.find((log) => log.type === "sleep_quality") ??
    today.quickLogs.find((log) => log.type === "energy") ??
    today.quickLogs[0] ??
    null;
  const languageCopy = copy[language];
  const completedStepIds = new Set<MorningRoutineStepId>(progressEntry?.completedStepIds ?? []);
  const focusStepId = selectFocusStepId(review, completedStepIds);

  const steps: MorningRoutineStep[] = morningRoutineStepIds.map((stepId) => {
    const completed = completedStepIds.has(stepId);
    const highlighted = !completed && stepId === focusStepId;
    const statusLabel = completed ? languageCopy.done : languageCopy.ready;

    if (stepId === "anchor") {
      const cta = completed ? languageCopy.done : languageCopy.markDone;

      return {
        id: stepId,
        title: languageCopy.anchorTitle,
        body: languageCopy.anchorBody,
        badge: languageCopy.anchorBadge,
        highlighted,
        highlightLabel: highlighted ? languageCopy.startHere : null,
        statusLabel,
        completed,
        cta,
        ctaKind: "complete",
        actionLabel: languageCopy.stepActionLabel(languageCopy.anchorTitle, cta),
        sourceLabels: morningRoutineEvidenceSources.slice(0, 2).map((source) => source.organization),
      };
    }

    if (stepId === "checkin") {
      return {
        id: stepId,
        title: languageCopy.checkinTitle,
        body: languageCopy.checkinBody(preferredLog?.label ?? "one signal"),
        badge: languageCopy.checkinBadge,
        highlighted,
        highlightLabel: highlighted ? languageCopy.startHere : null,
        statusLabel,
        completed,
        cta: languageCopy.openLog,
        ctaKind: "log",
        actionLabel: languageCopy.stepActionLabel(languageCopy.checkinTitle, languageCopy.openLog),
        sourceLabels: [
          morningRoutineEvidenceSources[1]?.organization,
          morningRoutineEvidenceSources[2]?.organization,
        ].filter(Boolean),
      };
    }

    return {
      id: stepId,
      title: languageCopy.guideTitle,
      body: languageCopy.guideBody,
      badge: languageCopy.guideBadge,
      highlighted,
      highlightLabel: highlighted ? languageCopy.startHere : null,
      statusLabel,
      completed,
      cta: languageCopy.openGuide,
      ctaKind: "guide",
      actionLabel: languageCopy.stepActionLabel(languageCopy.guideTitle, languageCopy.openGuide),
      sourceLabels: morningRoutineEvidenceSources.map((source) => source.organization),
    };
  });

  return {
    title: languageCopy.title,
    body: languageCopy.body,
    note: languageCopy.note,
    guidance: review
      ? {
          title: languageCopy.guidanceTitle,
          tone: review.tone,
          reason: review.reason,
          nextStepTitle: review.nextStepTitle,
          nextStep: review.nextStep,
          meta: review.meta,
        }
      : null,
    guideItemId: guide?.id ?? null,
    logDefinition: preferredLog,
    metrics: buildMorningRoutineMetrics(progressStore, today.date, language),
    steps,
  };
}

function selectFocusStepId(
  review: MorningRoutineReview | null,
  completedStepIds: Set<MorningRoutineStepId>,
): MorningRoutineStepId | null {
  const firstIncompleteStepId = morningRoutineStepIds.find((stepId) => !completedStepIds.has(stepId)) ?? null;

  if (!review || !firstIncompleteStepId) {
    return firstIncompleteStepId;
  }

  if (review.nextStepId === "protect_anchor") {
    return completedStepIds.has("anchor") ? firstIncompleteStepId : "anchor";
  }

  if (review.nextStepId === "pair_checkin") {
    return completedStepIds.has("checkin") ? firstIncompleteStepId : "checkin";
  }

  if (review.nextStepId === "open_guide_same_morning") {
    return completedStepIds.has("guide") ? firstIncompleteStepId : "guide";
  }

  return firstIncompleteStepId;
}
