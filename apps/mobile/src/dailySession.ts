import {
  recommendContentForToday,
  type ContentRecommendationDigestNextStep,
  type ContentRecommendationDigestTone,
} from "@pmhc/learning";
import type { AppLanguage, ContentItem, LogEntry, ProgramProgress, QuickLogDefinition, TodayPayload } from "@pmhc/types";
import type { ReviewPacketHistoryEntry } from "./reviewPacketHistory";

export const dailySessionStepIds = ["lesson", "quiz", "practice", "reflection"] as const;

export type DailySessionStepId = (typeof dailySessionStepIds)[number];
export type DailySessionStepState = "ready" | "active" | "done";

export type DailySessionProgressEntry = {
  completedStepIds: DailySessionStepId[];
  updatedAt: string;
};

export type DailySessionProgressStore = Record<string, DailySessionProgressEntry>;

export type DailySessionStep = {
  id: DailySessionStepId;
  title: string;
  body: string;
  cta: string;
  state: DailySessionStepState;
  statusLabel: string;
  openLabel: string;
};

export type DailySession = {
  title: string;
  body: string;
  progressLabel: string;
  lessonItemId: string | null;
  quizLog: QuickLogDefinition | null;
  steps: DailySessionStep[];
};

type BuildDailySessionInput = {
  content: ContentItem[];
  language: AppLanguage;
  logs: LogEntry[];
  programProgress: ProgramProgress | null;
  progressEntry?: DailySessionProgressEntry | null;
  reviewDigestNextStep: ContentRecommendationDigestNextStep;
  reviewDigestTone: ContentRecommendationDigestTone;
  reviewPackets: ReviewPacketHistoryEntry[];
  today: TodayPayload;
};

type DailySessionCopy = {
  title: string;
  body: string;
  progressLabel: (done: number, total: number) => string;
  states: Record<DailySessionStepState, string>;
  stepTitles: Record<DailySessionStepId, string>;
  ctas: {
    lesson: string;
    library: string;
    quiz: string;
    practice: string;
    track: string;
    reflection: string;
  };
  lessonIntro: (title: string) => string;
  lessonFallback: string;
  quizIntro: (label: string) => string;
  practiceFallback: string;
  reflectionFallback: string;
  openStep: (title: string) => string;
};

const dailySessionCopy: Record<AppLanguage, DailySessionCopy> = {
  en: {
    title: "Daily session",
    body: "One calm loop for today: lesson, quiz, practice, reflection.",
    progressLabel: (done, total) => `${done} of ${total} done`,
    states: {
      ready: "Ready",
      active: "Active",
      done: "Done",
    },
    stepTitles: {
      lesson: "Lesson",
      quiz: "Quiz",
      practice: "Practice",
      reflection: "Reflection",
    },
    ctas: {
      lesson: "Open lesson",
      library: "Open library",
      quiz: "Open quick log",
      practice: "Open plan",
      track: "Open Track",
      reflection: "Open Review",
    },
    lessonIntro: (title) => `Start with ${title} so the rest of today has context.`,
    lessonFallback: "Open the library and pick one short read before adding more data.",
    quizIntro: (label) => `Use one quick ${label.toLowerCase()} check-in to calibrate the day without over-reading it.`,
    practiceFallback: "Choose one gentle action and stop while it still feels easy to repeat tomorrow.",
    reflectionFallback: "Close the day with one short note about what helped and what should stay light next time.",
    openStep: (title) => `Open daily session step: ${title}`,
  },
  ru: {
    title: "Сессия на сегодня",
    body: "Один спокойный круг на день: материал, быстрый чек, практика, короткий итог.",
    progressLabel: (done, total) => `Готово ${done} из ${total}`,
    states: {
      ready: "Готово к шагу",
      active: "Текущий шаг",
      done: "Сделано",
    },
    stepTitles: {
      lesson: "Материал",
      quiz: "Быстрый чек",
      practice: "Практика",
      reflection: "Короткий итог",
    },
    ctas: {
      lesson: "Открыть материал",
      library: "Открыть базу",
      quiz: "Открыть быстрый лог",
      practice: "Открыть план",
      track: "Открыть трекинг",
      reflection: "Открыть обзор",
    },
    lessonIntro: (title) => `Начните с материала «${title}», чтобы у дня появился спокойный контекст.`,
    lessonFallback: "Откройте базу и выберите один короткий материал, прежде чем собирать новые сигналы.",
    quizIntro: (label) => `Сделайте один быстрый чек по «${label}», без лишних выводов и самопроверок.`,
    practiceFallback: "Выберите одно мягкое действие и остановитесь в тот момент, когда его еще легко повторить завтра.",
    reflectionFallback: "Закройте день короткой заметкой: что помогло и что завтра лучше оставить полегче.",
    openStep: (title) => `Открыть шаг сессии: ${title}`,
  },
};

export function buildDailySession({
  content,
  language,
  logs,
  programProgress,
  progressEntry,
  reviewDigestNextStep,
  reviewDigestTone,
  reviewPackets,
  today,
}: BuildDailySessionInput): DailySession {
  const copy = dailySessionCopy[language];
  const lessonItem =
    recommendContentForToday(content, {
      activeProgramCategory: today.activeProgram?.category ?? null,
      priorityDomain: today.currentPriority.domain,
      reviewDigestNextStep,
      reviewDigestTone,
    })[0]?.item ?? content.find((item) => !item.completed) ?? content[0] ?? null;
  const quizLog = pickQuizLog(today);
  const completedStepIds = new Set<DailySessionStepId>(progressEntry?.completedStepIds ?? []);

  if (quizLog && hasLogToday(logs, today.date, quizLog.type)) {
    completedStepIds.add("quiz");
  }

  if (hasPracticeSignalToday(today, logs, programProgress)) {
    completedStepIds.add("practice");
  }

  if (reviewPackets.some((packet) => packet.createdAt.startsWith(today.date))) {
    completedStepIds.add("reflection");
  }

  const activeId =
    dailySessionStepIds.find((stepId) => !completedStepIds.has(stepId)) ?? dailySessionStepIds[dailySessionStepIds.length - 1];
  const learnCard = today.actionCards.find((card) => card.kind === "Learn");
  const checkInCard = today.actionCards.find((card) => card.kind === "Check-in");
  const practiceCard = today.actionCards.find((card) => card.kind === "Practice");
  const reflectCard = today.actionCards.find((card) => card.kind === "Reflect");

  const steps: DailySessionStep[] = dailySessionStepIds.map((stepId) => {
    const state = completedStepIds.has(stepId) ? "done" : stepId === activeId ? "active" : "ready";

    if (stepId === "lesson") {
      const title = copy.stepTitles.lesson;
      const lessonTitle = lessonItem ? localizedTitle(lessonItem, language) : null;

      return {
        id: stepId,
        title,
        body: lessonTitle ? copy.lessonIntro(lessonTitle) : learnCard?.description ?? copy.lessonFallback,
        cta: lessonItem ? copy.ctas.lesson : copy.ctas.library,
        state,
        statusLabel: copy.states[state],
        openLabel: copy.openStep(title),
      };
    }

    if (stepId === "quiz") {
      const title = copy.stepTitles.quiz;
      const quizLabel = quizLog?.label ?? today.quickLogs[0]?.label ?? null;

      return {
        id: stepId,
        title,
        body: quizLabel ? copy.quizIntro(quizLabel) : checkInCard?.description ?? copy.quizIntro("signal"),
        cta: copy.ctas.quiz,
        state,
        statusLabel: copy.states[state],
        openLabel: copy.openStep(title),
      };
    }

    if (stepId === "practice") {
      const title = copy.stepTitles.practice;

      return {
        id: stepId,
        title,
        body: practiceCard?.description ?? copy.practiceFallback,
        cta: today.activeProgram ? copy.ctas.practice : copy.ctas.track,
        state,
        statusLabel: copy.states[state],
        openLabel: copy.openStep(title),
      };
    }

    const title = copy.stepTitles.reflection;

    return {
      id: stepId,
      title,
      body: reflectCard?.description ?? copy.reflectionFallback,
      cta: copy.ctas.reflection,
      state,
      statusLabel: copy.states[state],
      openLabel: copy.openStep(title),
    };
  });

  return {
    title: copy.title,
    body: copy.body,
    progressLabel: copy.progressLabel(completedStepIds.size, dailySessionStepIds.length),
    lessonItemId: lessonItem?.id ?? null,
    quizLog,
    steps,
  };
}

export function markDailySessionStepComplete(
  store: DailySessionProgressStore,
  date: string,
  stepId: DailySessionStepId,
  updatedAt: string,
): DailySessionProgressStore {
  const completedStepIds = Array.from(new Set([...(store[date]?.completedStepIds ?? []), stepId]));
  const nextStore: DailySessionProgressStore = {
    ...store,
    [date]: {
      completedStepIds,
      updatedAt,
    },
  };

  const keptDates = Object.keys(nextStore).sort().slice(-14);

  return keptDates.reduce<DailySessionProgressStore>((accumulator, key) => {
    accumulator[key] = nextStore[key];
    return accumulator;
  }, {});
}

export function isDailySessionProgressStore(value: unknown): value is DailySessionProgressStore {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(
    (entry) =>
      isRecord(entry) &&
      typeof entry.updatedAt === "string" &&
      Array.isArray(entry.completedStepIds) &&
      entry.completedStepIds.every((stepId) => isDailySessionStepId(stepId)),
  );
}

function pickQuizLog(today: TodayPayload) {
  const preferredTypes = {
    baseline: ["confidence", "libido", "energy"],
    recovery: ["sleep_quality", "energy", "confidence"],
    confidence: ["confidence", "libido", "energy"],
    pelvic_floor: ["pelvic_floor_done", "confidence", "energy"],
    environment: ["sleep_quality", "energy", "confidence"],
    learning: ["confidence", "energy", "libido"],
    safety: ["symptom_checkin", "confidence", "energy"],
  }[today.currentPriority.domain];

  for (const type of preferredTypes) {
    const match = today.quickLogs.find((log) => log.type === type);

    if (match) {
      return match;
    }
  }

  return today.quickLogs[0] ?? null;
}

function hasPracticeSignalToday(today: TodayPayload, logs: LogEntry[], programProgress: ProgramProgress | null) {
  const dayIndex = today.activeProgram?.dayIndex;

  if (dayIndex != null && programProgress && programProgress.programId === today.activeProgram?.id) {
    const dayKey = String(dayIndex);
    const completedTaskIds = programProgress.completedTaskIdsByDay?.[dayKey] ?? [];

    if (completedTaskIds.length > 0) {
      return true;
    }

    if (
      programProgress.completedDayIndexes.includes(dayIndex) ||
      (programProgress.restDayIndexes ?? []).includes(dayIndex) ||
      (programProgress.skippedDayIndexes ?? []).includes(dayIndex)
    ) {
      return true;
    }
  }

  return logs.some(
    (log) =>
      log.occurredAt.startsWith(today.date) &&
      (log.type === "pelvic_floor_done" || log.type === "pump_done") &&
      log.value === true,
  );
}

function hasLogToday(logs: LogEntry[], date: string, type: QuickLogDefinition["type"]) {
  return logs.some((log) => log.occurredAt.startsWith(date) && log.type === type);
}

function localizedTitle(item: ContentItem, language: AppLanguage) {
  return language === "ru" ? item.translatedTitleRu ?? item.title : item.title;
}

function isDailySessionStepId(value: unknown): value is DailySessionStepId {
  return typeof value === "string" && dailySessionStepIds.includes(value as DailySessionStepId);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
