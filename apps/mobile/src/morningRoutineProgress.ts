import type { AppLanguage } from "@pmhc/types";

export const morningRoutineStepIds = ["anchor", "checkin", "guide"] as const;

export type MorningRoutineStepId = (typeof morningRoutineStepIds)[number];

export type MorningRoutineProgressEntry = {
  completedStepIds: MorningRoutineStepId[];
  updatedAt: string;
};

export type MorningRoutineProgressStore = Record<string, MorningRoutineProgressEntry>;

export type MorningRoutineMetric = {
  id: "today" | "streak" | "adherence";
  label: string;
  value: string;
};

const copy = {
  en: {
    today: "Today",
    streak: "Streak",
    adherence: "7-day adherence",
    day: (count: number) => `${count} day${count === 1 ? "" : "s"}`,
    todayValue: (done: number, total: number) => `${done} of ${total}`,
    adherenceValue: (done: number, total: number) => `${done}/${total}`,
  },
  ru: {
    today: "Сегодня",
    streak: "Серия",
    adherence: "7 дней",
    day: (count: number) => `${count} ${pluralizeRuDay(count)}`,
    todayValue: (done: number, total: number) => `${done} из ${total}`,
    adherenceValue: (done: number, total: number) => `${done}/${total}`,
  },
} as const;

export function markMorningRoutineStepComplete(
  store: MorningRoutineProgressStore,
  date: string,
  stepId: MorningRoutineStepId,
  updatedAt: string,
): MorningRoutineProgressStore {
  const completedStepIds = Array.from(new Set([...(store[date]?.completedStepIds ?? []), stepId]));
  const nextStore: MorningRoutineProgressStore = {
    ...store,
    [date]: {
      completedStepIds,
      updatedAt,
    },
  };

  const keptDates = Object.keys(nextStore).sort().slice(-30);

  return keptDates.reduce<MorningRoutineProgressStore>((accumulator, key) => {
    accumulator[key] = nextStore[key];
    return accumulator;
  }, {});
}

export function buildMorningRoutineMetrics(
  store: MorningRoutineProgressStore,
  date: string,
  language: AppLanguage,
): MorningRoutineMetric[] {
  const languageCopy = copy[language];
  const todayCompletedSteps = store[date]?.completedStepIds.length ?? 0;
  const completedDaysLast7 = countCompletedDays(store, date, 7);
  const currentStreak = countCurrentStreak(store, date);

  return [
    {
      id: "today",
      label: languageCopy.today,
      value: languageCopy.todayValue(todayCompletedSteps, morningRoutineStepIds.length),
    },
    {
      id: "streak",
      label: languageCopy.streak,
      value: languageCopy.day(currentStreak),
    },
    {
      id: "adherence",
      label: languageCopy.adherence,
      value: languageCopy.adherenceValue(completedDaysLast7, 7),
    },
  ];
}

export function isMorningRoutineProgressStore(value: unknown): value is MorningRoutineProgressStore {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(
    (entry) =>
      isRecord(entry) &&
      typeof entry.updatedAt === "string" &&
      Array.isArray(entry.completedStepIds) &&
      entry.completedStepIds.every((stepId) => isMorningRoutineStepId(stepId)),
  );
}

function countCompletedDays(store: MorningRoutineProgressStore, date: string, days: number) {
  let total = 0;

  for (let offset = 0; offset < days; offset += 1) {
    const currentDate = shiftDate(date, -offset);

    if (isMorningRoutineDayComplete(store[currentDate])) {
      total += 1;
    }
  }

  return total;
}

function countCurrentStreak(store: MorningRoutineProgressStore, date: string) {
  const todayComplete = isMorningRoutineDayComplete(store[date]);
  const startDate = todayComplete ? date : shiftDate(date, -1);

  if (!isMorningRoutineDayComplete(store[startDate])) {
    return 0;
  }

  let streak = 0;

  while (isMorningRoutineDayComplete(store[shiftDate(startDate, -streak)])) {
    streak += 1;
  }

  return streak;
}

function isMorningRoutineDayComplete(entry: MorningRoutineProgressEntry | undefined) {
  return morningRoutineStepIds.every((stepId) => entry?.completedStepIds.includes(stepId));
}

function isMorningRoutineStepId(value: unknown): value is MorningRoutineStepId {
  return typeof value === "string" && morningRoutineStepIds.includes(value as MorningRoutineStepId);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function shiftDate(date: string, days: number) {
  const nextDate = new Date(`${date}T00:00:00.000Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function pluralizeRuDay(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "день";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "дня";
  }

  return "дней";
}
