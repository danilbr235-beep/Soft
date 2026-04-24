import type { CoachReviewDigest } from "@pmhc/rules";
import type { AppLanguage, TodayPayload } from "@pmhc/types";
import type { MorningNudgeReview } from "./morningNudgeReview";
import type { MorningRoutineReview } from "./morningRoutineReview";
import type { ReviewSignalChange } from "./reviewSignalChange";

export type AdaptiveDayGuidanceState = "recovery" | "narrow" | "protect_morning" | "steady";

export type CoachAdaptiveNudge = {
  id: "simplify";
  state: AdaptiveDayGuidanceState;
  tone: string;
  title: string;
  body: string;
  nextStep: string;
};

const titles: Record<AppLanguage, string> = {
  en: "Should I simplify today?",
  ru: "Стоит ли упростить день?",
};

const toneCopy: Record<AppLanguage, Record<AdaptiveDayGuidanceState, string>> = {
  en: {
    recovery: "Recovery-first day",
    narrow: "Keep today narrow",
    protect_morning: "Protect the morning rail",
    steady: "No extra complexity today",
  },
  ru: {
    recovery: "День в recovery-режиме",
    narrow: "День лучше держать узким",
    protect_morning: "Собери утренний рельс",
    steady: "Сегодня без лишней сложности",
  },
};

const bodyCopy: Record<AppLanguage, Record<AdaptiveDayGuidanceState, string>> = {
  en: {
    recovery:
      "Yes. The current read is cautious enough that the whole day should stay smaller, not just one task.",
    narrow:
      "Keep today narrow. The signal is still thin enough that extra effort will add noise faster than clarity.",
    protect_morning:
      "Simplify the day around the morning loop. The next useful gain is a cleaner morning rail, not a busier plan.",
    steady:
      "No need to shrink the day further. The better move is to keep it plain and avoid adding tests or extra settings.",
  },
  ru: {
    recovery:
      "Да. Текущий обзор достаточно осторожный, так что лучше упростить весь день, а не только одну задачу.",
    narrow:
      "День лучше держать узким. Сигнала пока мало, и лишние действия добавят шума быстрее, чем ясности.",
    protect_morning:
      "Сейчас полезнее упростить день вокруг утреннего цикла. Следующий выигрыш здесь — собрать утро, а не добавлять новые задачи.",
    steady:
      "Сильнее упрощать день уже не нужно. Полезнее просто не усложнять его новыми тестами и лишними настройками.",
  },
};

const nextStepCopy: Record<AppLanguage, Record<Exclude<AdaptiveDayGuidanceState, "protect_morning">, string>> = {
  en: {
    recovery: "Keep one recovery-first action, one check-in, and skip any urge to test progress today.",
    narrow: "Land the morning anchor, log two calm scores, and stop there unless the day stays quiet.",
    steady: "Repeat the same light plan and let consistency do the work instead of optimization.",
  },
  ru: {
    recovery:
      "Оставь один щадящий шаг, один check-in и не превращай сегодня в проверку на результат.",
    narrow:
      "Сделай утренний якорь, отметь две спокойные оценки и на этом остановись, если день идет ровно.",
    steady:
      "Повтори тот же легкий план и дай регулярности поработать вместо новых подкруток.",
  },
};

const reminderHoldNote: Record<AppLanguage, string> = {
  en: "The morning reminder already changed recently, so leave its timing and tone alone today.",
  ru: "Утренний сигнал уже недавно менялся, так что сегодня лучше не трогать его время и тон.",
};

const weeklyNarrowStepCopy: Record<AppLanguage, string> = {
  en: "Weekly read also says: keep the plan narrow until the next few logs clarify the mixed signal.",
  ru: "Недельный обзор тоже говорит: держи план узким, пока следующие записи не уточнят смешанный сигнал.",
};

const weeklyRecoveryStepCopy: Record<AppLanguage, string> = {
  en: "Weekly read also says: protect recovery before adding any new challenge.",
  ru: "Недельный обзор тоже говорит: сначала защити восстановление, а новую нагрузку добавишь позже.",
};

export function buildCoachAdaptiveNudge({
  language,
  morningNudgeReview,
  morningRoutineReview,
  reviewSignalChange,
  reviewDigest,
  today,
}: {
  language: AppLanguage;
  morningNudgeReview: MorningNudgeReview;
  morningRoutineReview: MorningRoutineReview;
  reviewSignalChange?: ReviewSignalChange | null;
  reviewDigest: CoachReviewDigest;
  today: TodayPayload;
}): CoachAdaptiveNudge {
  const guidanceState = selectGuidanceState({
    morningRoutineReview,
    reviewSignalChange,
    reviewDigest,
    today,
  });
  const reminderNote = morningNudgeReview.guidanceState === "hold" ? reminderHoldNote[language] : "";
  const weeklyNote = buildWeeklyChangeNote(language, guidanceState, reviewSignalChange);
  const baseNextStep =
    guidanceState === "protect_morning" ? morningRoutineReview.nextStep : nextStepCopy[language][guidanceState];
  const weeklyNextStep = buildWeeklyNextStep(language, reviewSignalChange);

  return {
    id: "simplify",
    state: guidanceState,
    tone: toneCopy[language][guidanceState],
    title: titles[language],
    body: [bodyCopy[language][guidanceState], weeklyNote, reminderNote].filter(Boolean).join(" "),
    nextStep: [baseNextStep, weeklyNextStep].filter(Boolean).join(" "),
  };
}

function selectGuidanceState({
  morningRoutineReview,
  reviewSignalChange,
  reviewDigest,
  today,
}: {
  morningRoutineReview: MorningRoutineReview;
  reviewSignalChange?: ReviewSignalChange | null;
  reviewDigest: CoachReviewDigest;
  today: TodayPayload;
}): AdaptiveDayGuidanceState {
  const hasHighAlert = today.alerts.some(
    (alert) => alert.severity === "medical_attention" || alert.severity === "high_priority",
  );
  const weeklyRecovery =
    reviewSignalChange?.toneId === "recovery" || reviewSignalChange?.nextStepId === "protect_recovery";
  const weeklyMixed = reviewSignalChange?.toneId === "mixed" || reviewSignalChange?.nextStepId === "watch_mix";

  if (hasHighAlert || reviewDigest.tone === "recovery" || today.currentPriority.domain === "safety" || weeklyRecovery) {
    return "recovery";
  }

  if (
    morningRoutineReview.toneId === "reset" ||
    morningRoutineReview.nextStepId === "pair_checkin" ||
    morningRoutineReview.nextStepId === "open_guide_same_morning"
  ) {
    return "protect_morning";
  }

  if (
    reviewDigest.tone === "baseline_building" ||
    morningRoutineReview.toneId === "building" ||
    today.currentPriority.confidence === "low" ||
    weeklyMixed
  ) {
    return "narrow";
  }

  return "steady";
}

function buildWeeklyChangeNote(
  language: AppLanguage,
  guidanceState: AdaptiveDayGuidanceState,
  reviewSignalChange?: ReviewSignalChange | null,
) {
  if (!reviewSignalChange) {
    return "";
  }

  if (guidanceState === "recovery" && reviewSignalChange.toneId !== "recovery") {
    return language === "en"
      ? `Weekly change: ${reviewSignalChange.pattern}. Today's caution still wins, so keep the day recovery-first.`
      : `Изменение за неделю: ${reviewSignalChange.pattern}. Сегодняшний осторожный сигнал важнее, поэтому день лучше оставить recovery-first.`;
  }

  if (reviewSignalChange.toneId === "recovery") {
    return language === "en"
      ? `Weekly change: ${reviewSignalChange.pattern}. ${reviewSignalChange.nextStep}`
      : `Изменение за неделю: ${reviewSignalChange.pattern}. ${reviewSignalChange.nextStep}`;
  }

  if (reviewSignalChange.toneId === "mixed") {
    return language === "en"
      ? `Weekly change: ${reviewSignalChange.pattern}. Keep today narrow until the next logs clarify the mixed signal.`
      : `Изменение за неделю: ${reviewSignalChange.pattern}. Держи день узким, пока следующие записи не уточнят смешанный сигнал.`;
  }

  if (reviewSignalChange.toneId === "building") {
    return language === "en"
      ? `Weekly change: ${reviewSignalChange.pattern}. Keep the day simple enough that the new signal stays readable.`
      : `Изменение за неделю: ${reviewSignalChange.pattern}. Оставь день достаточно простым, чтобы новый сигнал оставался читаемым.`;
  }

  return language === "en"
    ? `Weekly change: ${reviewSignalChange.pattern}.`
    : `Изменение за неделю: ${reviewSignalChange.pattern}.`;
}

function buildWeeklyNextStep(language: AppLanguage, reviewSignalChange?: ReviewSignalChange | null) {
  if (!reviewSignalChange) {
    return "";
  }

  if (reviewSignalChange.nextStepId === "protect_recovery") {
    return weeklyRecoveryStepCopy[language];
  }

  if (reviewSignalChange.nextStepId === "watch_mix") {
    return weeklyNarrowStepCopy[language];
  }

  return "";
}
