import type { ActionCard, AppLanguage, TodayMode } from "@pmhc/types";
import type { AdaptiveDayGuidanceState } from "./coachAdaptiveNudge";

export type DaySimplificationSource = "today" | "programs";

export type DaySimplificationEntry = {
  appliedAt: string;
  source: DaySimplificationSource;
};

export type DaySimplificationStore = Record<string, DaySimplificationEntry>;

export type DaySimplificationState = {
  active: boolean;
  canApply: boolean;
  source: DaySimplificationSource | null;
  effectiveTodayMode: TodayMode;
  actionCardCap: number | null;
  taskCap: number | null;
  applyLabel: string | null;
  restoreLabel: string | null;
  statusTitle: string | null;
};

export function buildDaySimplificationState({
  baseTodayMode,
  date,
  guidanceState,
  language,
  store,
}: {
  baseTodayMode: TodayMode;
  date: string;
  guidanceState: AdaptiveDayGuidanceState;
  language: AppLanguage;
  store: DaySimplificationStore;
}): DaySimplificationState {
  const entry = store[date] ?? null;
  const active = entry != null;

  return {
    active,
    canApply: guidanceState !== "steady",
    source: entry?.source ?? null,
    effectiveTodayMode: active ? "Light" : baseTodayMode,
    actionCardCap: active ? actionCardCaps[guidanceState] : null,
    taskCap: active ? taskCaps[guidanceState] : null,
    applyLabel: !active && guidanceState !== "steady" ? labels[language].apply : null,
    restoreLabel: active ? labels[language].restore : null,
    statusTitle: active ? labels[language].active : null,
  };
}

export function limitTodayActionCards(actionCards: ActionCard[], state: DaySimplificationState) {
  if (state.actionCardCap == null) {
    return actionCards;
  }

  return actionCards.slice(0, state.actionCardCap);
}

export function limitProgramTasksForDay<T extends { id: string }>(
  tasks: T[],
  completedTaskIds: string[],
  state: DaySimplificationState,
) {
  if (state.taskCap == null) {
    return tasks;
  }

  const completedIds = new Set(completedTaskIds);
  const openTaskIds = tasks.filter((task) => !completedIds.has(task.id)).slice(0, state.taskCap).map((task) => task.id);
  const visibleOpenTaskIds = new Set(openTaskIds);

  return tasks.filter((task) => completedIds.has(task.id) || visibleOpenTaskIds.has(task.id));
}

export function describeTodaySimplification({
  hiddenCount,
  language,
  visibleCount,
}: {
  hiddenCount: number;
  language: AppLanguage;
  visibleCount: number;
}) {
  if (language === "ru") {
    return {
      summary: `На сегодня оставлено ${visibleCount} ${russianActionWord(visibleCount)}.`,
      hidden:
        hiddenCount > 0
          ? `Еще ${hiddenCount} ${russianHiddenActionWord(hiddenCount)} скрыто на потом.`
          : "Другие шаги на сегодня уже убраны.",
    };
  }

  return {
    summary: `Showing ${visibleCount} priority ${visibleCount === 1 ? "action" : "actions"} for today.`,
    hidden:
      hiddenCount > 0
        ? `${hiddenCount} more ${hiddenCount === 1 ? "action is" : "actions are"} hidden for later.`
        : "The rest of today is already cleared down.",
  };
}

export function describeProgramSimplification({
  hiddenCount,
  language,
  visibleCount,
}: {
  hiddenCount: number;
  language: AppLanguage;
  visibleCount: number;
}) {
  if (language === "ru") {
    return {
      summary: `В плане на сегодня оставлено ${visibleCount} ${russianTaskWord(visibleCount)}.`,
      hidden:
        hiddenCount > 0
          ? `Еще ${hiddenCount} ${russianHiddenTaskWord(hiddenCount)} скрыто на потом.`
          : "Лишние задачи на сегодня уже убраны.",
    };
  }

  return {
    summary: `Showing ${visibleCount} ${visibleCount === 1 ? "task" : "tasks"} in the lighter day plan.`,
    hidden:
      hiddenCount > 0
        ? `${hiddenCount} more ${hiddenCount === 1 ? "task is" : "tasks are"} hidden for later.`
        : "The rest of the plan is already cleared down.",
  };
}

export function isDaySimplificationStore(value: unknown): value is DaySimplificationStore {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.appliedAt === "string" &&
        (entry.source === "today" || entry.source === "programs"),
    )
  );
}

const labels: Record<AppLanguage, { apply: string; restore: string; active: string }> = {
  en: {
    apply: "Use lighter day",
    restore: "Return to full day",
    active: "Lighter day is on",
  },
  ru: {
    apply: "Включить щадящий день",
    restore: "Вернуть обычный день",
    active: "Щадящий день включен",
  },
};

const actionCardCaps: Record<AdaptiveDayGuidanceState, number> = {
  recovery: 2,
  narrow: 2,
  protect_morning: 2,
  steady: 2,
};

const taskCaps: Record<AdaptiveDayGuidanceState, number> = {
  recovery: 1,
  narrow: 2,
  protect_morning: 2,
  steady: 2,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function russianActionWord(count: number) {
  return count === 1 ? "приоритетное действие" : count < 5 ? "приоритетных действия" : "приоритетных действий";
}

function russianHiddenActionWord(count: number) {
  return count === 1 ? "действие" : count < 5 ? "действия" : "действий";
}

function russianTaskWord(count: number) {
  return count === 1 ? "задача" : count < 5 ? "задачи" : "задач";
}

function russianHiddenTaskWord(count: number) {
  return count === 1 ? "задача" : count < 5 ? "задачи" : "задач";
}
