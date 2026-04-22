import type { ActionCard, AppLanguage, CurrentPriority, TodayPayload } from "@pmhc/types";

export type TodayReviewDigestTone = "baseline_building" | "steady" | "recovery";
export type TodayReviewDigestNextStep = "log_two_scores" | "keep_consistency" | "protect_recovery" | "repeat_small_loop";

type GuidanceKind = "baseline_building" | "steady" | "recovery";

type TodayReviewGuidance = {
  tone: TodayReviewDigestTone;
  nextStep: TodayReviewDigestNextStep;
  language: AppLanguage;
};

export function applyReviewDigestToToday(today: TodayPayload, guidance: TodayReviewGuidance): TodayPayload {
  const kind = selectGuidanceKind(guidance);

  return {
    ...today,
    currentPriority: steerPriority(today.currentPriority, kind, guidance.language),
    actionCards: steerActionCards(today.actionCards, kind, guidance.language),
  };
}

function selectGuidanceKind(guidance: TodayReviewGuidance): GuidanceKind {
  if (guidance.tone === "recovery" || guidance.nextStep === "protect_recovery") {
    return "recovery";
  }

  if (
    guidance.tone === "baseline_building" ||
    guidance.nextStep === "log_two_scores" ||
    guidance.nextStep === "repeat_small_loop"
  ) {
    return "baseline_building";
  }

  return "steady";
}

function steerPriority(priority: CurrentPriority, kind: GuidanceKind, language: AppLanguage): CurrentPriority {
  const ru = language === "ru";

  if (kind === "baseline_building") {
    if (priority.domain === "safety") {
      return priority;
    }

    return {
      ...priority,
      recommendedAction: ru
        ? "Сначала отметь две спокойные оценки, а уже потом решай, нужно ли сегодня что-то еще."
        : "Start with two calm scores before anything more ambitious.",
    };
  }

  if (kind === "recovery") {
    return {
      ...priority,
      recommendedAction:
        priority.domain === "safety"
          ? ru
            ? "Отметь симптомы и оставь на сегодня только один щадящий шаг."
            : "Log symptoms and keep the rest of today to one recovery-first action."
          : ru
            ? "Оставь сегодня один щадящий шаг и один чек-ин."
            : "Keep today to one recovery-first action and one check-in.",
      avoidToday:
        priority.avoidToday ??
        (ru
          ? "Не добавляй лишнюю интенсивность, пока общий сигнал все еще просит восстановления."
          : "Do not add extra intensity while the broader read is still recovery-first."),
    };
  }

  if (priority.domain === "safety") {
    return priority;
  }

  return {
    ...priority,
    recommendedAction: ru
      ? "Оставь один запланированный шаг и короткую заметку, без лишних проверок."
      : "Keep one planned action and one short reflection. No need to add extra checks.",
  };
}

function steerActionCards(actionCards: ActionCard[], kind: GuidanceKind, language: AppLanguage): ActionCard[] {
  const config = actionCardConfigs[language][kind];
  const cardsById = new Map(actionCards.map((card) => [card.id, card]));
  const orderedCards = config.order
    .map((id) => cardsById.get(id))
    .filter((card): card is ActionCard => card != null)
    .map((card) => ({
      ...card,
      ...config.overrides[card.id],
    }));
  const remainingCards = actionCards
    .filter((card) => !config.order.includes(card.id))
    .map((card) => ({
      ...card,
      ...config.overrides[card.id],
    }));

  return [...orderedCards, ...remainingCards];
}

const actionCardConfigs: Record<
  AppLanguage,
  Record<
    GuidanceKind,
    {
      order: string[];
      overrides: Record<string, Partial<ActionCard>>;
    }
  >
> = {
  en: {
    baseline_building: {
      order: ["check-in", "learn", "practice", "reflect"],
      overrides: {
        "check-in": {
          title: "Two-score reset",
          description: "Log confidence and energy first, then decide whether today needs anything more.",
          cta: "Log first",
        },
        learn: {
          title: "What counts as enough signal",
          description: "Use one short explainer to stay grounded instead of overchecking.",
          cta: "Read why",
        },
        practice: {
          title: "Tiny supporting action",
          description: "Only add one small action after the first two scores are logged.",
          cta: "Keep it small",
        },
        reflect: {
          title: "Short note for later",
          description: "Leave one sentence about what felt easier or harder today.",
          cta: "Note it",
        },
      },
    },
    recovery: {
      order: ["practice", "check-in", "learn", "reflect"],
      overrides: {
        practice: {
          title: "Recovery reset",
          description: "Use one short recovery-first action, then stop before the day turns into a test.",
          cta: "Keep it light",
        },
        "check-in": {
          title: "Comfort check-in",
          description: "Log comfort, energy, or symptoms before adding anything new.",
          cta: "Log first",
        },
        learn: {
          title: "Why recovery still fits",
          description: "Read the short reminder on why lighter guidance is still the better call.",
          cta: "Read why",
        },
        reflect: {
          title: "Boundary note",
          description: "Note one thing to keep lighter if the same signal shows up again.",
          cta: "Save boundary",
        },
      },
    },
    steady: {
      order: ["practice", "reflect", "learn", "check-in"],
      overrides: {
        practice: {
          title: "Planned practice",
          description: "Keep the planned action small, repeatable, and comfortably within range.",
          cta: "Stay steady",
        },
        reflect: {
          title: "Consistency note",
          description: "Record what helped steadiness so tomorrow stays simple.",
          cta: "Reflect",
        },
        learn: {
          title: "Why steadiness matters",
          description: "Use one short explainer to reinforce the pattern that is already holding.",
          cta: "Read more",
        },
        "check-in": {
          title: "Optional score check",
          description: "If you log anything else, keep it to one quick score instead of a full sweep.",
          cta: "Log only if needed",
        },
      },
    },
  },
  ru: {
    baseline_building: {
      order: ["check-in", "learn", "practice", "reflect"],
      overrides: {
        "check-in": {
          title: "Два спокойных сигнала",
          description: "Сначала отметь уверенность и энергию, а потом реши, нужно ли сегодня что-то еще.",
          cta: "Сначала лог",
        },
        learn: {
          title: "Что уже считается сигналом",
          description: "Короткое объяснение поможет не уйти в лишние проверки.",
          cta: "Понять почему",
        },
        practice: {
          title: "Маленький поддерживающий шаг",
          description: "Добавляй только одно небольшое действие после первых двух отметок.",
          cta: "Без спешки",
        },
        reflect: {
          title: "Короткая заметка на потом",
          description: "Оставь одну фразу о том, что сегодня далось легче или тяжелее.",
          cta: "Записать",
        },
      },
    },
    recovery: {
      order: ["practice", "check-in", "learn", "reflect"],
      overrides: {
        practice: {
          title: "Щадящий сброс",
          description: "Сделай один короткий щадящий шаг и не превращай день в проверку себя.",
          cta: "Полегче",
        },
        "check-in": {
          title: "Чек-ин на комфорт",
          description: "Сначала отметь комфорт, энергию или симптомы, а уже потом решай про остальное.",
          cta: "Сначала лог",
        },
        learn: {
          title: "Почему сейчас лучше щадящий режим",
          description: "Короткое напоминание, почему более легкий режим пока остается верным шагом.",
          cta: "Понять почему",
        },
        reflect: {
          title: "Заметка о границе",
          description: "Запиши одну границу, которая поможет и в следующий похожий день.",
          cta: "Записать",
        },
      },
    },
    steady: {
      order: ["practice", "reflect", "learn", "check-in"],
      overrides: {
        practice: {
          title: "Запланированный шаг",
          description: "Оставь практику небольшой, повторяемой и в спокойном диапазоне.",
          cta: "Держать ритм",
        },
        reflect: {
          title: "Заметка о стабильности",
          description: "Запиши, что сегодня помогло удержать ровный ритм.",
          cta: "Отметить",
        },
        learn: {
          title: "Почему ровность сейчас важна",
          description: "Короткое объяснение закрепит паттерн, который уже держится.",
          cta: "Почитать",
        },
        "check-in": {
          title: "Оценка по желанию",
          description: "Если хочешь добавить лог, ограничься одной быстрой оценкой вместо полного прохода.",
          cta: "Только если нужно",
        },
      },
    },
  },
};
