import type { AppLanguage, ProgramDayPlan } from "@pmhc/types";

export type ProgramDayGuidanceState = "recovery" | "narrow" | "protect_morning" | "steady";

export type ProgramDayGuidanceSummary = {
  tone: string;
  body: string;
  taskCapText: string;
  orderedTaskIds: string[];
};

export function buildProgramDayGuidanceSummary({
  dayPlan,
  guidanceState,
  language,
}: {
  dayPlan: ProgramDayPlan;
  guidanceState: ProgramDayGuidanceState;
  language: AppLanguage;
}): ProgramDayGuidanceSummary {
  const config = configs[language][guidanceState];

  return {
    tone: config.tone,
    body: config.body,
    taskCapText: config.taskCapText,
    orderedTaskIds: orderTasks(dayPlan, config.kindOrder),
  };
}

function orderTasks(dayPlan: ProgramDayPlan, kindOrder: ProgramDayPlan["tasks"][number]["kind"][]) {
  return [...dayPlan.tasks]
    .sort((left, right) => {
      const leftRank = kindOrder.indexOf(left.kind);
      const rightRank = kindOrder.indexOf(right.kind);

      if (leftRank === rightRank) {
        return 0;
      }

      if (leftRank === -1) {
        return 1;
      }

      if (rightRank === -1) {
        return -1;
      }

      return leftRank - rightRank;
    })
    .map((task) => task.id);
}

const configs: Record<
  AppLanguage,
  Record<
    ProgramDayGuidanceState,
    {
      tone: string;
      body: string;
      taskCapText: string;
      kindOrder: ProgramDayPlan["tasks"][number]["kind"][];
    }
  >
> = {
  en: {
    recovery: {
      tone: "Recovery-first plan",
      body: "Keep the plan to the calmest useful task first and let the rest stay optional.",
      taskCapText: "Recommended cap: one task unless the day clearly stays calm.",
      kindOrder: ["recovery", "check_in", "reflect", "learn", "practice"],
    },
    narrow: {
      tone: "Keep the plan narrow",
      body: "Start with the first signal and let one small task be enough for today.",
      taskCapText: "Recommended cap: one task after the opening check-in.",
      kindOrder: ["check_in", "practice", "reflect", "learn", "recovery"],
    },
    protect_morning: {
      tone: "Morning-first plan",
      body: "Let the morning rail land before heavier practice. The early structure matters more than volume.",
      taskCapText: "Recommended cap: morning check-in plus one same-morning guide or tiny task.",
      kindOrder: ["check_in", "learn", "practice", "reflect", "recovery"],
    },
    steady: {
      tone: "Steady plan",
      body: "Keep the plan plain and repeatable. No need to squeeze extra work into the day.",
      taskCapText: "Recommended cap: two tasks if the day stays comfortable.",
      kindOrder: ["practice", "reflect", "learn", "check_in", "recovery"],
    },
  },
  ru: {
    recovery: {
      tone: "План в recovery-режиме",
      body: "Сначала оставь самый спокойный полезный шаг, а остальное пусть останется опциональным.",
      taskCapText: "Рекомендуемый предел: одна задача, если день сам не остается спокойным.",
      kindOrder: ["recovery", "check_in", "reflect", "learn", "practice"],
    },
    narrow: {
      tone: "План лучше держать узким",
      body: "Начни с первого сигнала и считай, что одного маленького шага на сегодня уже достаточно.",
      taskCapText: "Рекомендуемый предел: одна задача после стартового check-in.",
      kindOrder: ["check_in", "practice", "reflect", "learn", "recovery"],
    },
    protect_morning: {
      tone: "Сначала утренний рельс",
      body: "Сначала дай утреннему рельсу собраться, а уже потом думай о более тяжелой практике.",
      taskCapText: "Рекомендуемый предел: утренний check-in и еще один короткий same-morning шаг.",
      kindOrder: ["check_in", "learn", "practice", "reflect", "recovery"],
    },
    steady: {
      tone: "Ровный план",
      body: "Оставь план простым и повторяемым. Не нужно выжимать из дня лишнюю нагрузку.",
      taskCapText: "Рекомендуемый предел: две задачи, если день идет комфортно.",
      kindOrder: ["practice", "reflect", "learn", "check_in", "recovery"],
    },
  },
};
