import type { ActionCard, AppLanguage } from "@pmhc/types";
import type { AdaptiveDayGuidanceState } from "./coachAdaptiveNudge";

type TodayAdaptiveActionCardsArgs = {
  actionCards: ActionCard[];
  guidanceState: AdaptiveDayGuidanceState;
  language: AppLanguage;
};

export function buildAdaptiveTodayActionCards({
  actionCards,
  guidanceState,
  language,
}: TodayAdaptiveActionCardsArgs): ActionCard[] {
  const config = configs[language][guidanceState];
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

const configs: Record<
  AppLanguage,
  Record<
    AdaptiveDayGuidanceState,
    {
      order: string[];
      overrides: Record<string, Partial<ActionCard>>;
    }
  >
> = {
  en: {
    recovery: {
      order: ["check-in", "practice", "learn", "reflect"],
      overrides: {
        "check-in": {
          title: "Log the cautious signal first",
          description: "Start with comfort, energy, or symptoms before deciding whether the rest of the plan should shrink further.",
          cta: "Check in first",
        },
        practice: {
          title: "One recovery-first step",
          description: "Keep practice to one contained recovery action and stop there.",
          cta: "One light step",
        },
      },
    },
    narrow: {
      order: ["check-in", "practice", "learn", "reflect"],
      overrides: {
        practice: {
          title: "Stop after one small action",
          description: "If the first signals stay calm, add one small action and leave the rest for later.",
          cta: "Only one step",
        },
        reflect: {
          title: "One-line note",
          description: "Keep reflection to one line so the day stays useful without turning into admin.",
          cta: "Leave one line",
        },
      },
    },
    protect_morning: {
      order: ["check-in", "learn", "practice", "reflect"],
      overrides: {
        "check-in": {
          title: "Morning rail first",
          description: "Let the anchor and the first quick log land before you widen the day.",
          cta: "Land the rail",
        },
        learn: {
          title: "Guide on the same morning",
          description: "Use the short guide while the morning rail is active instead of treating it as later reading.",
          cta: "Open the guide",
        },
        practice: {
          title: "Practice can wait",
          description: "Hold heavier practice until the morning loop is fully in place.",
          cta: "Wait until after the rail",
        },
      },
    },
    steady: {
      order: ["practice", "reflect", "learn", "check-in"],
      overrides: {},
    },
  },
  ru: {
    recovery: {
      order: ["check-in", "practice", "learn", "reflect"],
      overrides: {
        "check-in": {
          title: "Сначала отметь осторожный сигнал",
          description: "Начни с комфорта, энергии или симптомов, а уже потом решай, нужно ли еще сильнее сужать день.",
          cta: "Сначала check-in",
        },
        practice: {
          title: "Один щадящий шаг",
          description: "Оставь практику одним коротким щадящим действием и на этом остановись.",
          cta: "Один легкий шаг",
        },
      },
    },
    narrow: {
      order: ["check-in", "practice", "learn", "reflect"],
      overrides: {
        practice: {
          title: "Остановись после одного маленького шага",
          description: "Если первые сигналы спокойные, добавь один маленький шаг и остальное оставь на потом.",
          cta: "Только один шаг",
        },
        reflect: {
          title: "Одна строка заметки",
          description: "Оставь заметку в одну строку, чтобы день оставался полезным, а не превращался в отчет.",
          cta: "Оставить строку",
        },
      },
    },
    protect_morning: {
      order: ["check-in", "learn", "practice", "reflect"],
      overrides: {
        "check-in": {
          title: "Сначала собери утренний рельс",
          description: "Дай якорю и первому быстрому логу встать на место, прежде чем расширять день.",
          cta: "Собрать рельс",
        },
        learn: {
          title: "Гид в то же утро",
          description: "Открой короткий гид в то же утро, пока утренний рельс уже запущен.",
          cta: "Открыть гид",
        },
        practice: {
          title: "Практика может подождать",
          description: "Более тяжелую практику лучше отложить, пока утренний цикл не собран целиком.",
          cta: "Сначала утро",
        },
      },
    },
    steady: {
      order: ["practice", "reflect", "learn", "check-in"],
      overrides: {},
    },
  },
};
