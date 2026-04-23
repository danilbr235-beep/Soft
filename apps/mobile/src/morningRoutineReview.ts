import type { AppLanguage } from "@pmhc/types";
import { morningRoutineStepIds, type MorningRoutineProgressStore, type MorningRoutineStepId } from "./morningRoutineProgress";

export type MorningRoutineReviewTone = "building" | "steady" | "reset";
export type MorningRoutineReviewReason =
  | "no_signal"
  | "first_full_day"
  | "checkin_gap"
  | "guide_gap"
  | "partial_only"
  | "routine_holding";
export type MorningRoutineReviewNextStep =
  | "protect_anchor"
  | "repeat_full_loop"
  | "pair_checkin"
  | "open_guide_same_morning"
  | "keep_same_loop";

export type MorningRoutineReview = {
  toneId: MorningRoutineReviewTone;
  reasonId: MorningRoutineReviewReason;
  nextStepId: MorningRoutineReviewNextStep;
  title: string;
  body: string;
  tone: string;
  reason: string;
  nextStepTitle: string;
  nextStep: string;
  meta: string;
  stepLines: string[];
  fullDays: number;
  partialDays: number;
  streak: number;
};

type LocalizedCopy = {
  title: string;
  body: string;
  nextStepTitle: string;
  tones: Record<MorningRoutineReviewTone, string>;
  reasons: Record<MorningRoutineReviewReason, string>;
  nextSteps: Record<MorningRoutineReviewNextStep, string>;
  stepLabels: Record<MorningRoutineStepId, string>;
  meta: (fullDays: number, partialDays: number, streak: number) => string;
  stepLine: (label: string, count: number) => string;
};

const copy: Record<AppLanguage, LocalizedCopy> = {
  en: {
    title: "Morning routine review",
    body: "A short 7-day read of whether the morning loop is staying repeatable.",
    nextStepTitle: "Morning next step",
    tones: {
      building: "Building consistency",
      steady: "Routine is holding",
      reset: "Tighten the loop",
    },
    reasons: {
      no_signal: "There is still very little morning routine signal, so the first step should stay minimal.",
      first_full_day: "At least one full morning is already in place. Repeat the same short loop before adding more.",
      checkin_gap: "The wake-and-light anchor shows up more often than the morning check-in, so the loop still breaks early.",
      guide_gap: "The anchor and check-in are showing up, but the short guide falls out more often than the rest.",
      partial_only: "Pieces of the routine are appearing, but not as one repeatable three-step block yet.",
      routine_holding: "The short morning loop is landing often enough to keep it steady instead of making it more ambitious.",
    },
    nextSteps: {
      protect_anchor: "Land the wake-and-light anchor first. Add the other two steps only after that starts to stick.",
      repeat_full_loop: "Repeat the same three-step morning tomorrow before changing the routine.",
      pair_checkin: "Pair the quick morning log right after the anchor instead of adding a new step.",
      open_guide_same_morning: "Open the short guide on the same morning you do the check-in.",
      keep_same_loop: "Keep the same three-step morning loop for a few more days and let consistency build.",
    },
    stepLabels: {
      anchor: "Anchor",
      checkin: "Check-in",
      guide: "Guide",
    },
    meta: (fullDays, partialDays, streak) =>
      `Full mornings: ${fullDays}/7 - Partial mornings: ${partialDays} - Streak: ${formatEnglishDayCount(streak)}`,
    stepLine: (label, count) => `${label}: ${count}/7 mornings`,
  },
  ru: {
    title: "Обзор утренней рутины",
    body: "Короткий взгляд на последние 7 дней: получается ли держать утренний цикл повторяемым.",
    nextStepTitle: "Следующий шаг утром",
    tones: {
      building: "Собираем регулярность",
      steady: "Рутина держится",
      reset: "Нужно чуть плотнее собрать цикл",
    },
    reasons: {
      no_signal: "По утренней рутине сигнала пока мало, поэтому первый шаг лучше оставить совсем простым.",
      first_full_day:
        "Хотя бы одно полное утро уже получилось. Лучше повторить тот же короткий цикл еще раз, а не добавлять новое.",
      checkin_gap:
        "Подъем и свет появляются чаще, чем спокойный чек-ин, поэтому цикл пока обрывается слишком рано.",
      guide_gap: "Якорь и чек-ин уже появляются, но короткий гид выпадает чаще остальных шагов.",
      partial_only: "Части рутины уже появляются, но пока не складываются в один повторяемый трехшаговый блок.",
      routine_holding:
        "Короткий утренний цикл уже держится достаточно регулярно. Сейчас полезнее закрепить его, а не усложнять.",
    },
    nextSteps: {
      protect_anchor: "Сначала просто держи подъем и дневной свет. Остальные два шага добавляй только после этого.",
      repeat_full_loop: "Завтра повтори тот же трехшаговый цикл целиком, не меняя рутину.",
      pair_checkin: "Привяжи быстрый чек-ин сразу к утреннему якорю, вместо того чтобы добавлять новый шаг.",
      open_guide_same_morning: "Открывай короткий гид в то же утро, когда делаешь чек-ин.",
      keep_same_loop: "Оставь тот же трехшаговый цикл еще на несколько дней и дай регулярности закрепиться.",
    },
    stepLabels: {
      anchor: "Якорь",
      checkin: "Чек-ин",
      guide: "Гид",
    },
    meta: (fullDays, partialDays, streak) =>
      `Полных утр: ${fullDays}/7 - Частичных утр: ${partialDays} - Серия: ${formatRussianDayCount(streak)}`,
    stepLine: (label, count) => `${label}: ${count}/7 утр`,
  },
};

export function buildMorningRoutineReview({
  date,
  language,
  progressStore,
}: {
  date: string;
  language: AppLanguage;
  progressStore: MorningRoutineProgressStore;
}): MorningRoutineReview {
  const languageCopy = copy[language];
  const last7Dates = Array.from({ length: 7 }, (_, index) => shiftDate(date, -index));
  const stepCounts = morningRoutineStepIds.reduce<Record<MorningRoutineStepId, number>>(
    (accumulator, stepId) => {
      accumulator[stepId] = countStepCompletion(progressStore, last7Dates, stepId);
      return accumulator;
    },
    {
      anchor: 0,
      checkin: 0,
      guide: 0,
    },
  );
  const fullDays = last7Dates.filter((currentDate) => isMorningRoutineDayComplete(progressStore[currentDate])).length;
  const partialDays = last7Dates.filter((currentDate) => isMorningRoutineDayPartial(progressStore[currentDate])).length;
  const streak = countCurrentFullMorningStreak(progressStore, date);
  const summary = selectMorningRoutineSummary({
    fullDays,
    partialDays,
    stepCounts,
    streak,
  });

  return {
    toneId: summary.tone,
    reasonId: summary.reason,
    nextStepId: summary.nextStep,
    title: languageCopy.title,
    body: languageCopy.body,
    tone: languageCopy.tones[summary.tone],
    reason: languageCopy.reasons[summary.reason],
    nextStepTitle: languageCopy.nextStepTitle,
    nextStep: languageCopy.nextSteps[summary.nextStep],
    meta: languageCopy.meta(fullDays, partialDays, streak),
    stepLines: morningRoutineStepIds.map((stepId) =>
      languageCopy.stepLine(languageCopy.stepLabels[stepId], stepCounts[stepId]),
    ),
    fullDays,
    partialDays,
    streak,
  };
}

function selectMorningRoutineSummary({
  fullDays,
  partialDays,
  stepCounts,
  streak,
}: {
  fullDays: number;
  partialDays: number;
  stepCounts: Record<MorningRoutineStepId, number>;
  streak: number;
}) {
  if (fullDays >= 4 || (fullDays >= 3 && streak >= 2)) {
    return {
      tone: "steady",
      reason: "routine_holding",
      nextStep: "keep_same_loop",
    } satisfies {
      tone: MorningRoutineReviewTone;
      reason: MorningRoutineReviewReason;
      nextStep: MorningRoutineReviewNextStep;
    };
  }

  if (fullDays >= 1) {
    return {
      tone: "building",
      reason: "first_full_day",
      nextStep: "repeat_full_loop",
    } satisfies {
      tone: MorningRoutineReviewTone;
      reason: MorningRoutineReviewReason;
      nextStep: MorningRoutineReviewNextStep;
    };
  }

  if (partialDays === 0) {
    return {
      tone: "building",
      reason: "no_signal",
      nextStep: "protect_anchor",
    } satisfies {
      tone: MorningRoutineReviewTone;
      reason: MorningRoutineReviewReason;
      nextStep: MorningRoutineReviewNextStep;
    };
  }

  if (stepCounts.checkin === 0 || stepCounts.checkin < stepCounts.anchor) {
    return {
      tone: "reset",
      reason: "checkin_gap",
      nextStep: "pair_checkin",
    } satisfies {
      tone: MorningRoutineReviewTone;
      reason: MorningRoutineReviewReason;
      nextStep: MorningRoutineReviewNextStep;
    };
  }

  if (stepCounts.guide < stepCounts.checkin) {
    return {
      tone: "reset",
      reason: "guide_gap",
      nextStep: "open_guide_same_morning",
    } satisfies {
      tone: MorningRoutineReviewTone;
      reason: MorningRoutineReviewReason;
      nextStep: MorningRoutineReviewNextStep;
    };
  }

  return {
    tone: "building",
    reason: "partial_only",
    nextStep: "repeat_full_loop",
  } satisfies {
    tone: MorningRoutineReviewTone;
    reason: MorningRoutineReviewReason;
    nextStep: MorningRoutineReviewNextStep;
  };
}

function countStepCompletion(
  store: MorningRoutineProgressStore,
  dates: string[],
  stepId: MorningRoutineStepId,
) {
  return dates.filter((date) => store[date]?.completedStepIds.includes(stepId)).length;
}

function countCurrentFullMorningStreak(store: MorningRoutineProgressStore, date: string) {
  let streak = 0;

  while (isMorningRoutineDayComplete(store[shiftDate(date, -streak)])) {
    streak += 1;
  }

  return streak;
}

function isMorningRoutineDayComplete(entry: MorningRoutineProgressStore[string] | undefined) {
  return morningRoutineStepIds.every((stepId) => entry?.completedStepIds.includes(stepId));
}

function isMorningRoutineDayPartial(entry: MorningRoutineProgressStore[string] | undefined) {
  if (!entry) {
    return false;
  }

  const completedCount = morningRoutineStepIds.filter((stepId) => entry.completedStepIds.includes(stepId)).length;
  return completedCount > 0 && completedCount < morningRoutineStepIds.length;
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
    return `${count} день`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} дня`;
  }

  return `${count} дней`;
}
