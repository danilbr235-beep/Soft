import type {
  ActionCard,
  Alert,
  CoachExplanation,
  ContentItem,
  CurrentPriority,
  LogEntry,
  QuickLogDefinition,
  QuickLogType,
  AppLanguage,
  RuleEngineInput,
  TodayPayload,
} from "@pmhc/types";
import { hasSymptomRedFlag } from "@pmhc/safety";

export const supportedQuickLogs: QuickLogType[] = [
  "morning_erection",
  "libido",
  "confidence",
  "energy",
  "sleep_quality",
  "pelvic_floor_done",
  "pump_done",
  "symptom_checkin",
  "sex_happened",
];

const quickLogLabels: Record<AppLanguage, Record<QuickLogType, string>> = {
  en: {
    morning_erection: "Morning",
    libido: "Libido",
    confidence: "Confidence",
    energy: "Energy",
    sleep_quality: "Sleep",
    pelvic_floor_done: "Pelvic floor",
    pump_done: "Pump",
    symptom_checkin: "Symptoms",
    sex_happened: "Intimacy",
  },
  ru: {
    morning_erection: "Утро",
    libido: "Либидо",
    confidence: "Уверенность",
    energy: "Энергия",
    sleep_quality: "Сон",
    pelvic_floor_done: "Тазовое дно",
    pump_done: "Помпа",
    symptom_checkin: "Симптомы",
    sex_happened: "Близость",
  },
};

export function buildTodayPayload(input: RuleEngineInput): TodayPayload {
  const safetySignal = hasSafetySignal(input);
  const lowSleepStreak = countRecentLowScores(input.latestLogs, "sleep_quality", 4) >= 3;
  const pumpCaution = hasRecentPumpUse(input.latestLogs);
  const lowData = input.latestLogs.length < 3;

  const currentPriority = choosePriority({ input, safetySignal, lowSleepStreak, pumpCaution, lowData });
  const alerts = chooseAlerts(input, safetySignal, lowSleepStreak, pumpCaution);
  const language = input.profile.language;
  const actionCards = chooseActionCards(currentPriority.domain, language);
  const quickLogs = chooseQuickLogs(currentPriority.domain, input.profile.mode, language);

  return {
    date: new Date().toISOString().slice(0, 10),
    todayMode: safetySignal || lowData ? "Light" : input.profile.mode === "Pro" ? "Focus" : "Standard",
    syncStatus: "synced",
    activeProgram: input.activeProgram,
    currentPriority,
    dailyState: buildDailyState(input.latestLogs, lowData, language),
    alerts,
    actionCards,
    quickLogs,
    liveUpdates: buildLiveUpdates(input.contentItems, language),
    insights: buildInsights(input.latestLogs, lowData, language),
  };
}

export function explainPriority(priority: CurrentPriority, language: AppLanguage = "en"): CoachExplanation {
  const ru = language === "ru";

  return {
    title: priority.title,
    explanation: priority.whyItMatters,
    dataNote:
      priority.confidence === "low"
        ? ru
          ? "Пока недостаточно трендовых данных, поэтому ответ остается осторожным и помогает собрать базовую линию."
          : "There is not enough trend data yet, so this answer stays cautious and focused on baseline building."
        : ru
          ? "Это объяснение использует последние логи и текущий rule-priority, а не диагноз."
          : "This explanation uses recent logs and the current rule priority, not a diagnosis.",
    confidenceNote: confidenceNote(priority.confidence, language),
    nextStep: priority.recommendedAction,
    avoidToday: priority.avoidToday,
    safetyNote: ru
      ? "Это образовательная поддержка для трекинга, не диагноз и не совет для срочной помощи."
      : "This is educational tracking support, not a diagnosis or urgent care advice.",
    confidence: priority.confidence,
  };
}

function choosePriority(args: {
  input: RuleEngineInput;
  safetySignal: boolean;
  lowSleepStreak: boolean;
  pumpCaution: boolean;
  lowData: boolean;
}): CurrentPriority {
  const ru = args.input.profile.language === "ru";

  if (args.safetySignal) {
    return {
      domain: "safety",
      title: ru ? "Сегодня держим всё осторожно" : "Keep today conservative",
      whyItMatters: ru
        ? "Последние симптомы говорят, что самый полезный безопасный шаг - снизить интенсивность и логировать ясно."
        : "Recent symptom signals mean the safest useful move is to reduce intensity and track clearly.",
      recommendedAction: ru
        ? "Залогируйте симптомы и выбирайте только мягкое восстановление сегодня."
        : "Log symptoms and choose only gentle recovery actions today.",
      avoidToday: ru
        ? "Избегайте интенсивных или агрессивных протоколов, пока сигнал не станет яснее."
        : "Avoid intense or aggressive protocols until the signal is clearer.",
      confidence: "medium",
    };
  }

  if (args.lowSleepStreak) {
    return {
      domain: "recovery",
      title: ru ? "Сначала восстановление" : "Recovery comes first today",
      whyItMatters: ru
        ? "Сон несколько раз был низким, поэтому рекомендации по готовности должны стать легче."
        : "Sleep has been low several times recently, so readiness guidance should become lighter.",
      recommendedAction: ru
        ? "Сделайте короткую практику восстановления и держите трекинг простым."
        : "Use a short recovery practice and keep tracking simple.",
      avoidToday: ru
        ? "Не добавляйте новые эксперименты в день низкого восстановления."
        : "Avoid stacking extra experiments on a low-recovery day.",
      confidence: "medium",
    };
  }

  if (args.pumpCaution) {
    return {
      domain: "recovery",
      title: ru ? "Сегодня помпа только мягко" : "Keep pump work light today",
      whyItMatters: ru
        ? "Недавний лог помпы - сигнал не гнаться за интенсивностью и внимательно следить за комфортом."
        : "A recent pump log is a signal to avoid chasing intensity and watch comfort closely.",
      recommendedAction: ru
        ? "Сделайте recovery check-in и держите любую практику мягкой сегодня."
        : "Use a recovery check-in and keep any practice gentle today.",
      avoidToday: ru
        ? "Избегайте повторной помпы или сочетания интенсивных протоколов сегодня."
        : "Avoid repeat pump work or stacking intense protocols today.",
      confidence: "medium",
    };
  }

  if (args.lowData) {
    return {
      domain: "baseline",
      title: ru ? "Соберите базовую линию" : "Build your baseline",
      whyItMatters: ru
        ? "Пока недостаточно стабильных данных для сильных рекомендаций."
        : "There is not enough stable data yet for strong recommendations.",
      recommendedAction: ru
        ? "Сегодня залогируйте три быстрых сигнала: утро, либидо и уверенность."
        : "Log three quick signals today: morning, libido, and confidence.",
      confidence: "low",
    };
  }

  return {
    domain: args.input.profile.primaryGoal === "pelvic_floor" ? "pelvic_floor" : "confidence",
    title: ru ? "Держите план ровным" : "Keep the plan steady",
    whyItMatters: ru
      ? "Данных достаточно для небольшого фокусного действия без лишнего шума."
      : "Your data is stable enough for a small focused action without adding noise.",
    recommendedAction: ru
      ? "Завершите одну запланированную практику и короткую рефлексию."
      : "Complete one planned practice and one short reflection.",
    confidence: "medium",
  };
}

function chooseAlerts(input: RuleEngineInput, safetySignal: boolean, lowSleepStreak: boolean, pumpCaution: boolean): Alert[] {
  const alerts: Alert[] = [...input.recentAlerts];
  const ru = input.profile.language === "ru";

  if (safetySignal) {
    alerts.push({
      id: "safety-symptoms",
      severity: "medical_attention",
      title: ru ? "Рекомендуется пересмотр симптомов" : "Symptom review recommended",
      message: ru
        ? "Держите трекинг осторожным и рассмотрите профессиональную консультацию, если симптомы сохраняются или ощущаются остро."
        : "Keep tracking conservative and consider professional guidance if symptoms persist or feel acute.",
      module: "safety",
    });
  }

  if (lowSleepStreak) {
    alerts.push({
      id: "sleep-recovery-caution",
      severity: "caution",
      title: ru ? "Сигнал восстановления низкий" : "Recovery signal is low",
      message: ru ? "Более легкий день полезнее, чем давление на интенсивность." : "A lighter day is more useful than pushing intensity.",
      module: "today",
    });
  }

  if (pumpCaution) {
    alerts.push({
      id: "pump-intensity-caution",
      severity: "caution",
      title: ru ? "Держите интенсивность осторожной" : "Keep intensity conservative",
      message: ru
        ? "Лог помпы не должен вести к повторным или агрессивным протоколам сегодня."
        : "A pump log should not lead to repeated or aggressive protocols today.",
      module: "today",
    });
  }

  return alerts.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function chooseActionCards(domain: CurrentPriority["domain"], language: AppLanguage): ActionCard[] {
  const ru = language === "ru";
  const practiceTitle = domain === "recovery" ? (ru ? "Практика снижения темпа" : "Downshift practice") : ru ? "Короткая практика" : "Short practice";

  const cards: ActionCard[] = [
    {
      id: "practice",
      kind: "Practice",
      title: practiceTitle,
      description: ru ? "Небольшое действие, которое поддерживает текущий приоритет." : "A contained action that supports the current priority.",
      cta: ru ? "Начать" : "Start",
    },
    {
      id: "check-in",
      kind: "Check-in",
      title: ru ? "Чек-ин на минуту" : "One-minute check-in",
      description: ru ? "Поймайте сигнал, не превращая день в дашборд." : "Capture the signal without turning the day into a dashboard.",
      cta: ru ? "Лог" : "Log",
    },
    {
      id: "learn",
      kind: "Learn",
      title: ru ? "Релевантное объяснение" : "Relevant explainer",
      description: ru ? "Прочитайте короткий контекст к сегодняшней рекомендации." : "Read the short context behind today's recommendation.",
      cta: ru ? "Читать" : "Read",
    },
    {
      id: "reflect",
      kind: "Reflect",
      title: ru ? "Вечерняя заметка" : "Evening note",
      description: ru ? "Запишите, что изменилось, что помогло и что стоит держать легче." : "Record what changed, what helped, and what to keep light.",
      cta: ru ? "Отразить" : "Reflect",
    },
  ];

  return domain === "baseline" ? [cards[1], cards[2], cards[0], cards[3]] : cards;
}

function chooseQuickLogs(domain: CurrentPriority["domain"], mode: RuleEngineInput["profile"]["mode"], language: AppLanguage): QuickLogDefinition[] {
  const base: QuickLogType[] = ["morning_erection", "libido", "confidence"];
  const recovery: QuickLogType[] = ["sleep_quality", "energy", "symptom_checkin"];
  const practice: QuickLogType[] = ["pelvic_floor_done", "pump_done", "sex_happened"];

  if (domain === "baseline") {
    const baselineLogs: QuickLogType[] = [...base, "symptom_checkin"];
    return baselineLogs.map((logType) => toQuickLogDefinition(logType, language));
  }

  const ordered = domain === "recovery" || domain === "safety" ? [...recovery, ...base] : [...base, ...recovery];
  const withPractice = mode === "Pro" ? [...ordered, ...practice] : ordered;

  return withPractice.slice(0, mode === "Pro" ? 8 : 5).map((logType) => toQuickLogDefinition(logType, language));
}

function toQuickLogDefinition(type: QuickLogType, language: AppLanguage): QuickLogDefinition {
  return {
    type,
    label: quickLogLabels[language][type],
    input: type === "symptom_checkin" ? "symptom" : type.endsWith("_done") || type === "morning_erection" || type === "sex_happened" ? "boolean" : "score",
  };
}

function buildDailyState(logs: LogEntry[], lowData: boolean, language: AppLanguage) {
  const sleep = latestNumeric(logs, "sleep_quality");
  const energy = latestNumeric(logs, "energy");
  const confidence = latestNumeric(logs, "confidence");
  const libido = latestNumeric(logs, "libido");
  const ru = language === "ru";

  return [
    {
      id: "readiness",
      label: ru ? "Готовность" : "Readiness",
      value: lowData ? (ru ? "База" : "Baseline") : scoreLabel(avg([sleep, energy, confidence])),
      direction: "unknown" as const,
      status: lowData ? (ru ? "собираем первые сигналы" : "collecting first signals") : ru ? "по последним ручным логам" : "based on recent manual logs",
    },
    {
      id: "sleep",
      label: ru ? "Сон" : "Sleep",
      value: scoreLabel(sleep),
      direction: sleep != null && sleep < 5 ? ("down" as const) : ("flat" as const),
      status: sleep == null ? (ru ? "пока не логировали" : "not logged yet") : sleep < 5 ? (ru ? "нужна поддержка" : "needs support") : ru ? "подходит" : "usable",
    },
    {
      id: "confidence",
      label: ru ? "Уверенность" : "Confidence",
      value: scoreLabel(confidence),
      direction: "flat" as const,
      status: confidence == null ? (ru ? "пока не логировали" : "not logged yet") : ru ? "залогировано" : "logged",
    },
    {
      id: "Libido",
      label: ru ? "Либидо" : "Libido",
      value: scoreLabel(libido),
      direction: "flat" as const,
      status: libido == null ? (ru ? "дополнительный сигнал" : "optional signal") : ru ? "залогировано" : "logged",
    },
  ];
}

function buildLiveUpdates(contentItems: ContentItem[], language: AppLanguage) {
  const item = contentItems[0];
  const ru = language === "ru";

  return [
    {
      id: item?.id ?? "starter-learning",
      title: (ru ? item?.translatedTitleRu : item?.title) ?? item?.title ?? (ru ? "Новое: базовый трекинг без перепроверок" : "New: baseline tracking without overchecking"),
      sourceLabel: item?.sourceName ?? (ru ? "Проверенная стартовая заметка" : "Reviewed starter note"),
      category: "learning" as const,
    },
  ];
}

function buildInsights(logs: LogEntry[], lowData: boolean, language: AppLanguage) {
  const ru = language === "ru";

  if (lowData) {
    return [
      {
        id: "low-data",
        title: ru ? "Паттерна пока нет" : "No pattern yet",
        summary: ru ? "Несколько спокойных логов полезнее, чем догадки по одному дню." : "A few calm logs are more useful than guessing from one day.",
        confidence: "low" as const,
      },
    ];
  }

  const lowSleepCount = countRecentLowScores(logs, "sleep_quality", 4);

  return [
    {
      id: "sleep-confidence",
      title: lowSleepCount > 0
        ? ru
          ? "Сон может влиять на готовность"
          : "Sleep may be affecting readiness"
        : ru
          ? "Сигналы выглядят стабильными"
          : "Signals look stable",
      summary: lowSleepCount > 0
        ? ru
          ? "Недавние низкие оценки сна должны снизить сегодняшнюю интенсивность."
          : "Recent low sleep entries should lower today's intensity."
        : ru
          ? "Держите следующее действие маленьким и регулярным."
          : "Keep the next action small and consistent.",
      confidence: lowSleepCount > 0 ? ("medium" as const) : ("low" as const),
    },
  ];
}

function hasSafetySignal(input: RuleEngineInput) {
  if (input.profile.conservativeGuidance) {
    return true;
  }

  return input.latestLogs.some((log) => {
    if (log.type !== "symptom_checkin" || log.value == null || typeof log.value !== "object") {
      return false;
    }

    return hasSymptomRedFlag(log.value);
  });
}

function hasRecentPumpUse(logs: LogEntry[]) {
  return logs.some((log) => log.type === "pump_done" && log.value === true);
}

function countRecentLowScores(logs: LogEntry[], type: QuickLogType, threshold: number) {
  return logs.filter((log) => log.type === type && typeof log.value === "number" && log.value <= threshold).length;
}

function latestNumeric(logs: LogEntry[], type: QuickLogType) {
  const entry = [...logs].reverse().find((log) => log.type === type && typeof log.value === "number");
  return typeof entry?.value === "number" ? entry.value : null;
}

function avg(values: Array<number | null>) {
  const numeric = values.filter((value): value is number => value != null);
  if (numeric.length === 0) {
    return null;
  }
  return Math.round(numeric.reduce((sum, value) => sum + value, 0) / numeric.length);
}

function scoreLabel(value: number | null) {
  return value == null ? "--" : `${value}/10`;
}

function confidenceNote(confidence: CurrentPriority["confidence"], language: AppLanguage) {
  if (language === "ru") {
    return {
      low: "Низкая уверенность: нужно еще несколько стабильных логов, прежде чем более сильные рекомендации будут полезны.",
      medium: "Средняя уверенность: рекомендация осторожная и основана на последних сигналах.",
      high: "Высокая уверенность: рекомендация все равно образовательная и должна оставаться в пределах комфорта и безопасности.",
    }[confidence];
  }

  return {
    low: "Low confidence: a few more consistent logs are needed before stronger guidance is useful.",
    medium: "Medium confidence: the guidance is conservative and based on recent signals.",
    high: "High confidence: the guidance is still educational and should stay within your comfort and safety limits.",
  }[confidence];
}

function severityRank(severity: Alert["severity"]) {
  return {
    info: 0,
    caution: 1,
    high_priority: 2,
    medical_attention: 3,
  }[severity];
}
