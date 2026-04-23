import type { AppLanguage } from "@pmhc/types";
import type { CoachAdaptiveNudge } from "./coachAdaptiveNudge";
import type { DaySimplificationState } from "./daySimplification";
import type { DaySimplificationReview } from "./daySimplificationReview";

export type DaySimplificationGuidance = {
  title: string;
  tone: string;
  body: string;
  nextStep: string;
  lines: string[];
  ctaLabel: string | null;
  statusLabel: string;
  action: "apply" | "restore" | null;
};

export function buildDaySimplificationGuidance({
  actionCardCount,
  adaptiveDayGuidance,
  daySimplification,
  daySimplificationReview,
  language,
  programTaskCount,
}: {
  actionCardCount: number;
  adaptiveDayGuidance: CoachAdaptiveNudge;
  daySimplification: DaySimplificationState;
  daySimplificationReview: DaySimplificationReview;
  language: AppLanguage;
  programTaskCount: number;
}): DaySimplificationGuidance {
  const copy = guidanceCopy[language];
  const actionCap = daySimplification.actionCardCap ?? Math.min(actionCardCount, fallbackActionCap);
  const taskCap = daySimplification.taskCap ?? Math.min(programTaskCount, fallbackTaskCap);
  const lines = buildLines({
    actionCardCount,
    actionCap,
    copy,
    daySimplification,
    daySimplificationReview,
    programTaskCount,
    taskCap,
  });

  if (daySimplification.active) {
    if (daySimplificationReview.nextStepId === "return_when_quiet") {
      return {
        action: "restore",
        body: copy.restoreReadyBody,
        ctaLabel: daySimplification.restoreLabel,
        lines,
        nextStep: daySimplificationReview.nextStep,
        statusLabel: copy.restoreReadyStatus,
        title: adaptiveDayGuidance.title,
        tone: daySimplificationReview.tone,
      };
    }

    if (daySimplificationReview.nextStepId === "watch_repeat") {
      return {
        action: null,
        body: copy.watchBody,
        ctaLabel: null,
        lines,
        nextStep: daySimplificationReview.nextStep,
        statusLabel: copy.watchStatus,
        title: adaptiveDayGuidance.title,
        tone: daySimplificationReview.tone,
      };
    }

    return {
      action: null,
      body: copy.keepBody,
      ctaLabel: null,
      lines,
      nextStep: daySimplificationReview.nextStep,
      statusLabel: copy.keepStatus,
      title: adaptiveDayGuidance.title,
      tone: daySimplificationReview.tone,
    };
  }

  if (daySimplification.canApply && daySimplification.applyLabel) {
    return {
      action: "apply",
      body: adaptiveDayGuidance.body,
      ctaLabel: daySimplification.applyLabel,
      lines,
      nextStep: adaptiveDayGuidance.nextStep,
      statusLabel: copy.readyStatus,
      title: adaptiveDayGuidance.title,
      tone: adaptiveDayGuidance.tone,
    };
  }

  return {
    action: null,
    body: copy.notNeededBody,
    ctaLabel: null,
    lines,
    nextStep: adaptiveDayGuidance.nextStep,
    statusLabel: copy.notNeededStatus,
    title: adaptiveDayGuidance.title,
    tone: adaptiveDayGuidance.tone,
  };
}

const fallbackActionCap = 2;
const fallbackTaskCap = 2;

const guidanceCopy: Record<
  AppLanguage,
  {
    keepBody: string;
    keepStatus: string;
    mode: (label: string) => string;
    notNeededBody: string;
    notNeededStatus: string;
    programCap: (visible: number, total: number) => string;
    readyStatus: string;
    restoreReadyBody: string;
    restoreReadyStatus: string;
    todayCap: (visible: number, total: number) => string;
    watchBody: string;
    watchStatus: string;
    weekPattern: (activeDays: number, streak: number) => string;
  }
> = {
  en: {
    keepBody:
      "This week is still leaning compressed. Keep the lighter preset on and let the next day or two stay small.",
    keepStatus: "Lighter day still looks useful right now.",
    mode: (label) => `Mode: ${label}`,
    notNeededBody: "No extra day simplification is needed right now. Keep the plan plain without trimming it further.",
    notNeededStatus: "No lighter preset needed right now.",
    programCap: (visible, total) => `Programs: up to ${visible} of ${total} tasks stay visible.`,
    readyStatus: "A lighter preset is ready if you want the app to trim today's scope for you.",
    restoreReadyBody:
      "This looks like a one-day support reset. If today's signal feels quiet again, you can return to the full day.",
    restoreReadyStatus: "Current lighter day looks optional now.",
    todayCap: (visible, total) => `Today: up to ${visible} of ${total} priority actions stay visible.`,
    watchBody:
      "The lighter preset has shown up from more than one angle this week. Keep it on for today and watch whether the same compression repeats.",
    watchStatus: "Weekly pattern still needs another quiet day before restoring the full plan.",
    weekPattern: (activeDays, streak) =>
      `Week pattern: ${activeDays}/7 lighter days - Streak: ${formatEnglishDayCount(streak)}`,
  },
  ru: {
    keepBody:
      "Эта неделя все еще идет в сжатом режиме. Оставь щадящий день включенным и дай следующим одному-двум дням пройти спокойнее.",
    keepStatus: "Щадящий день сейчас все еще выглядит полезным.",
    mode: (label) => `Режим: ${label}`,
    notNeededBody: "Сильнее упрощать день сейчас не нужно. Лучше просто оставить план спокойным и без лишних добавок.",
    notNeededStatus: "Щадящий пресет сейчас не нужен.",
    programCap: (visible, total) => `Programs: видно до ${visible} из ${total} задач.`,
    readyStatus: "Щадящий пресет уже готов, если хочешь, чтобы приложение само сузило день.",
    restoreReadyBody:
      "Похоже, это был разовый поддерживающий щадящий день. Если сигнал снова тихий, можно спокойно вернуть обычный день.",
    restoreReadyStatus: "Щадящий день сейчас уже скорее опционален.",
    todayCap: (visible, total) => `Today: видно до ${visible} из ${total} приоритетных шагов.`,
    watchBody:
      "Щадящий пресет уже включался с нескольких сторон за эту неделю. Оставь его на сегодня и посмотри, повторится ли такое сжатие снова.",
    watchStatus: "Недельному паттерну нужен еще один спокойный день, прежде чем возвращать полный план.",
    weekPattern: (activeDays, streak) =>
      `Паттерн недели: ${activeDays}/7 щадящих дней - Серия: ${formatRussianDayCount(streak)}`,
  },
};

function buildLines({
  actionCardCount,
  actionCap,
  copy,
  daySimplification,
  daySimplificationReview,
  programTaskCount,
  taskCap,
}: {
  actionCardCount: number;
  actionCap: number;
  copy: (typeof guidanceCopy)[AppLanguage];
  daySimplification: DaySimplificationState;
  daySimplificationReview: DaySimplificationReview;
  programTaskCount: number;
  taskCap: number;
}) {
  const lines = [
    copy.mode(daySimplification.effectiveTodayMode),
    copy.todayCap(actionCap, actionCardCount),
    copy.programCap(taskCap, programTaskCount),
  ];

  if (daySimplificationReview.activeDays > 0) {
    lines.push(copy.weekPattern(daySimplificationReview.activeDays, daySimplificationReview.streak));
  }

  if (daySimplificationReview.sourceLine) {
    lines.push(daySimplificationReview.sourceLine);
  }

  return lines;
}

function formatEnglishDayCount(count: number) {
  return `${count} day${count === 1 ? "" : "s"}`;
}

function formatRussianDayCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} день`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} дня`;
  }

  return `${count} дней`;
}
