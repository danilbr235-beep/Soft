import type { CoachReviewDigest } from "@pmhc/rules";
import type { AppLanguage, TodayPayload } from "@pmhc/types";
import type { MorningNudgeReview } from "./morningNudgeReview";
import type { MorningRoutineReview } from "./morningRoutineReview";

export type CoachAdaptiveNudge = {
  id: "simplify";
  title: string;
  body: string;
  nextStep: string;
};

type GuidanceState = "recovery" | "narrow" | "protect_morning" | "steady";

const titles: Record<AppLanguage, string> = {
  en: "Should I simplify today?",
  ru: "Стоит ли упростить день?",
};

const bodyCopy: Record<AppLanguage, Record<GuidanceState, string>> = {
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

const nextStepCopy: Record<AppLanguage, Record<Exclude<GuidanceState, "protect_morning">, string>> = {
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

export function buildCoachAdaptiveNudge({
  language,
  morningNudgeReview,
  morningRoutineReview,
  reviewDigest,
  today,
}: {
  language: AppLanguage;
  morningNudgeReview: MorningNudgeReview;
  morningRoutineReview: MorningRoutineReview;
  reviewDigest: CoachReviewDigest;
  today: TodayPayload;
}): CoachAdaptiveNudge {
  const guidanceState = selectGuidanceState({
    morningRoutineReview,
    reviewDigest,
    today,
  });
  const reminderNote = morningNudgeReview.guidanceState === "hold" ? reminderHoldNote[language] : "";

  return {
    id: "simplify",
    title: titles[language],
    body: [bodyCopy[language][guidanceState], reminderNote].filter(Boolean).join(" "),
    nextStep:
      guidanceState === "protect_morning"
        ? morningRoutineReview.nextStep
        : nextStepCopy[language][guidanceState],
  };
}

function selectGuidanceState({
  morningRoutineReview,
  reviewDigest,
  today,
}: {
  morningRoutineReview: MorningRoutineReview;
  reviewDigest: CoachReviewDigest;
  today: TodayPayload;
}): GuidanceState {
  const hasHighAlert = today.alerts.some(
    (alert) => alert.severity === "medical_attention" || alert.severity === "high_priority",
  );

  if (hasHighAlert || reviewDigest.tone === "recovery" || today.currentPriority.domain === "safety") {
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
    today.currentPriority.confidence === "low"
  ) {
    return "narrow";
  }

  return "steady";
}
