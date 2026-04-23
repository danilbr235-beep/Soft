import type { AppLanguage } from "@pmhc/types";
import type { CoachAdaptiveNudge } from "./coachAdaptiveNudge";
import type { DaySimplificationState } from "./daySimplification";

export type DaySimplificationGuidance = {
  title: string;
  tone: string;
  body: string;
  lines: string[];
  ctaLabel: string | null;
  statusLabel: string;
  action: "apply" | "restore" | null;
};

export function buildDaySimplificationGuidance({
  actionCardCount,
  adaptiveDayGuidance,
  daySimplification,
  language,
  programTaskCount,
}: {
  actionCardCount: number;
  adaptiveDayGuidance: CoachAdaptiveNudge;
  daySimplification: DaySimplificationState;
  language: AppLanguage;
  programTaskCount: number;
}): DaySimplificationGuidance {
  const copy = guidanceCopy[language];
  const actionCap = daySimplification.actionCardCap ?? Math.min(actionCardCount, fallbackActionCap);
  const taskCap = daySimplification.taskCap ?? Math.min(programTaskCount, fallbackTaskCap);
  const lines = [
    copy.mode(daySimplification.effectiveTodayMode),
    copy.todayCap(actionCap, actionCardCount),
    copy.programCap(taskCap, programTaskCount),
  ];

  if (daySimplification.active) {
    return {
      action: "restore",
      body: copy.activeBody,
      ctaLabel: daySimplification.restoreLabel,
      lines,
      statusLabel: copy.activeStatus,
      title: adaptiveDayGuidance.title,
      tone: daySimplification.statusTitle ?? adaptiveDayGuidance.tone,
    };
  }

  if (daySimplification.canApply && daySimplification.applyLabel) {
    return {
      action: "apply",
      body: adaptiveDayGuidance.body,
      ctaLabel: daySimplification.applyLabel,
      lines,
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
    activeBody: string;
    activeStatus: string;
    mode: (label: string) => string;
    notNeededBody: string;
    notNeededStatus: string;
    programCap: (visible: number, total: number) => string;
    readyStatus: string;
    todayCap: (visible: number, total: number) => string;
  }
> = {
  en: {
    activeBody: "The lighter day preset is already active across Today and Programs for this date.",
    activeStatus: "Current day already runs in the lighter preset.",
    mode: (label) => `Mode: ${label}`,
    notNeededBody: "No extra day simplification is needed right now. Keep the plan plain without trimming it further.",
    notNeededStatus: "No lighter preset needed right now.",
    programCap: (visible, total) => `Programs: up to ${visible} of ${total} tasks stay visible.`,
    readyStatus: "A lighter preset is ready if you want the app to trim today's scope for you.",
    todayCap: (visible, total) => `Today: up to ${visible} of ${total} priority actions stay visible.`,
  },
  ru: {
    activeBody: "Щадящий день уже включен для этой даты и действует сразу в Today и Programs.",
    activeStatus: "Сейчас день уже идет в щадящем пресете.",
    mode: (label) => `Режим: ${label}`,
    notNeededBody: "Сильнее упрощать день сейчас не нужно. Лучше просто оставить план спокойным и без лишних добавок.",
    notNeededStatus: "Щадящий пресет сейчас не нужен.",
    programCap: (visible, total) => `Programs: видно до ${visible} из ${total} задач.`,
    readyStatus: "Щадящий пресет уже готов, если хочешь, чтобы приложение само сузило день.",
    todayCap: (visible, total) => `Today: видно до ${visible} из ${total} приоритетных шагов.`,
  },
};
