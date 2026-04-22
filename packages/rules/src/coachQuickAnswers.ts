import type { Alert, AppLanguage, CurrentPriority, TodayPayload } from "@pmhc/types";

export type CoachQuestionId = "priority" | "alert" | "data" | "next_step";
export type CoachReviewDigest = {
  tone: "baseline_building" | "steady" | "recovery";
  confidence: "low" | "medium" | "high";
  nextStep: "log_two_scores" | "keep_consistency" | "protect_recovery" | "repeat_small_loop";
};

export type CoachQuickAnswer = {
  id: CoachQuestionId;
  title: string;
  body: string;
  nextStep?: string;
  severity?: Alert["severity"];
};

const labels: Record<
  AppLanguage,
  Record<CoachQuestionId, { title: string; fallbackBody?: string; fallbackNextStep?: string; body?: string }>
> = {
  en: {
    priority: {
      title: "Why this priority?",
    },
    alert: {
      title: "What does this alert mean?",
      fallbackBody:
        "No active alerts right now. That does not prove everything is perfect; it only means Today has no caution signal from the current logs.",
      fallbackNextStep: "Keep the plan light and keep logging normally.",
    },
    data: {
      title: "How certain is this?",
    },
    next_step: {
      title: "What should I do next?",
      body: "Start with the smallest useful action, not a performance test.",
    },
  },
  ru: {
    priority: {
      title: "Почему такой фокус?",
    },
    alert: {
      title: "Что значит это предупреждение?",
      fallbackBody:
        "Сейчас активных предупреждений нет. Это не значит, что все идеально; просто по текущим логам нет отдельного caution-сигнала.",
      fallbackNextStep: "Оставь план легким и продолжай спокойно отмечать логи.",
    },
    data: {
      title: "Насколько этому можно доверять?",
    },
    next_step: {
      title: "Что сделать дальше?",
      body: "Начни с самого маленького полезного шага, а не с попытки проверить себя на результат.",
    },
  },
};

export function buildCoachQuickAnswers(
  today: TodayPayload,
  language: AppLanguage = "en",
  reviewDigest: CoachReviewDigest | null = null,
): CoachQuickAnswer[] {
  const copy = labels[language];
  const alert = highestPriorityAlert(today.alerts);
  const priorityDigestNote = reviewDigest ? digestPriorityNote(reviewDigest, language) : "";
  const dataDigestNote = reviewDigest ? digestConfidenceNote(reviewDigest, language) : "";
  const digestNextStep = reviewDigest ? digestNextStepText(reviewDigest, language) : null;
  const alertDigestFallback = reviewDigest ? digestAlertFallback(reviewDigest, language) : "";
  const priorityBody = priorityBodyText(today.currentPriority, language);
  const priorityNextStep = digestNextStep ?? priorityActionText(today.currentPriority, language);

  return [
    {
      id: "priority",
      title: copy.priority.title,
      body: [priorityBody, priorityDigestNote].filter(Boolean).join(" "),
      nextStep: priorityNextStep,
    },
    alert
      ? {
          id: "alert",
          title: copy.alert.title,
          body: [alertBodyText(alert, language), alertDigestFallback].filter(Boolean).join(" "),
          nextStep: digestNextStep ?? defaultAlertStep(language),
          severity: alert.severity,
        }
      : {
          id: "alert",
          title: copy.alert.title,
          body: [copy.alert.fallbackBody ?? "", alertDigestFallback].filter(Boolean).join(" "),
          nextStep: digestNextStep ?? copy.alert.fallbackNextStep,
        },
    {
      id: "data",
      title: copy.data.title,
      body: [confidenceBodyText(today.currentPriority.confidence, language), dataDigestNote].filter(Boolean).join(" "),
      nextStep: confidenceNextStep(today.currentPriority.confidence, language),
    },
    {
      id: "next_step",
      title: copy.next_step.title,
      body: copy.next_step.body ?? "",
      nextStep: digestNextStep ?? nextStepActionText(today.currentPriority, language),
    },
  ];
}

function priorityBodyText(priority: CurrentPriority, language: AppLanguage) {
  if (language === "en") {
    return priority.whyItMatters;
  }

  return {
    baseline: "Данных пока мало, поэтому сегодня полезнее спокойно собрать базовый сигнал, а не делать сильные выводы.",
    recovery: "Сейчас важнее бережный режим и восстановление, чем попытка добавить интенсивность или нагрузку.",
    confidence: "Лучше выбрать один спокойный шаг, который поддержит уверенность, чем пытаться решить все сразу.",
    pelvic_floor: "Сейчас полезнее мягкая и регулярная практика без давления и попытки ускорить прогресс.",
    environment: "Небольшая настройка среды сегодня даст больше пользы, чем лишний эксперимент с нагрузкой.",
    learning: "Короткое понятное объяснение сейчас полезнее, чем попытка угадать, что означает один сигнал.",
    safety: "Последние сигналы просят сегодня держать все осторожно и не усиливать нагрузку.",
  }[priority.domain];
}

function priorityActionText(priority: CurrentPriority, language: AppLanguage) {
  if (language === "en") {
    return priority.recommendedAction;
  }

  return {
    baseline: "Собери два-три спокойных сигнала и только потом решай, нужен ли сегодня еще один шаг.",
    recovery: "Оставь на сегодня один щадящий шаг и короткий check-in без лишней нагрузки.",
    confidence: "Сделай один небольшой шаг для уверенности и коротко отметь, как это ощущалось.",
    pelvic_floor: "Оставь практику короткой и мягкой, без попытки делать больше ради результата.",
    environment: "Сделай одну маленькую настройку среды и не усложняй день новыми проверками.",
    learning: "Прочитай короткое объяснение и не превращай день в цепочку новых тестов.",
    safety: "Сохрани только бережный режим и ясный symptom check-in без добавления интенсивности.",
  }[priority.domain];
}

function nextStepActionText(priority: CurrentPriority, language: AppLanguage) {
  const base = priorityActionText(priority, language);

  if (language === "en") {
    return priority.avoidToday ? `${base} ${priority.avoidToday}` : base;
  }

  return priority.avoidToday ? `${base} Сегодня лучше не делать так: ${priority.avoidToday}` : base;
}

function alertBodyText(alert: Alert, language: AppLanguage) {
  if (language === "en") {
    return `${alert.title}: ${alert.message}`;
  }

  return {
    medical_attention:
      "Есть symptom-сигнал, который просит сегодня держать все особенно осторожно и при необходимости рассмотреть профессиональную консультацию.",
    high_priority: "Есть сильный caution-сигнал. Сегодня лучше не усиливать план и не добавлять нагрузку.",
    caution: "Есть осторожный сигнал. Сейчас полезнее упростить день, чем пытаться надавить на прогресс.",
    info: "Есть информационный сигнал. Его стоит учесть, но без резких выводов и лишнего давления.",
  }[alert.severity];
}

function confidenceBodyText(confidence: CurrentPriority["confidence"], language: AppLanguage) {
  if (language === "en") {
    return {
      low: "There is not enough trend data yet, so this answer stays cautious and focused on baseline building.",
      medium: "This answer is based on recent signals, but it still stays intentionally conservative.",
      high: "The recent pattern is clearer, but the answer still stays inside a conservative educational frame.",
    }[confidence];
  }

  return {
    low: "Данных по тренду пока мало, поэтому ответ остается осторожным и больше помогает собрать базовую линию.",
    medium: "Последних сигналов уже хватает для ориентира, но ответ все равно остается консервативным.",
    high: "Картина стала яснее, но это все равно не повод резко повышать нагрузку или делать сильные выводы.",
  }[confidence];
}

function confidenceNextStep(confidence: CurrentPriority["confidence"], language: AppLanguage) {
  if (language === "en") {
    return {
      low: "Low confidence: a few more consistent logs are needed before stronger guidance is useful.",
      medium: "Medium confidence: the guidance is conservative and based on recent signals.",
      high: "High confidence: the guidance is still educational and should stay within your comfort and safety limits.",
    }[confidence];
  }

  return {
    low: "Низкая уверенность: сначала стоит накопить еще несколько спокойных логов.",
    medium: "Средняя уверенность: этого хватает для мягкого следующего шага, но не для резких выводов.",
    high: "Высокая уверенность: сигнал стал стабильнее, но лучше все равно держаться в пределах комфорта.",
  }[confidence];
}

function defaultAlertStep(language: AppLanguage) {
  return language === "ru"
    ? "Оставь трекинг осторожным и сегодня не повышай интенсивность."
    : "Keep tracking conservative and do not increase intensity today.";
}

function digestPriorityNote(reviewDigest: CoachReviewDigest, language: AppLanguage) {
  if (language === "ru") {
    return {
      baseline_building: "Общий обзор все еще ведет день в спокойный baseline-режим и сбор сигнала.",
      steady: "Общий обзор пока поддерживает ровный и безрывковый темп.",
      recovery: "Общий обзор все еще ведет день в щадящий recovery-first режим.",
    }[reviewDigest.tone];
  }

  return {
    baseline_building: "The broader review still points to a baseline-building day.",
    steady: "The broader review still supports a steady, low-drama day.",
    recovery: "The broader review is still pushing today toward a recovery-first read.",
  }[reviewDigest.tone];
}

function digestConfidenceNote(reviewDigest: CoachReviewDigest, language: AppLanguage) {
  if (language === "ru") {
    return {
      low: "Уверенность общего обзора пока низкая, поэтому ответ остается маленьким и signal-first.",
      medium: "Уверенность общего обзора средняя, поэтому следующий шаг остается осторожным.",
      high: "Уверенность общего обзора высокая, но это все равно не повод резко повышать нагрузку.",
    }[reviewDigest.confidence];
  }

  return {
    low: "The broader review confidence is still low, so the answer stays signal-first.",
    medium: "The broader review confidence is medium, so the next step stays conservative.",
    high: "The broader review confidence is high, but that still does not justify a sharp jump in intensity.",
  }[reviewDigest.confidence];
}

function digestNextStepText(reviewDigest: CoachReviewDigest, language: AppLanguage) {
  if (language === "ru") {
    return {
      log_two_scores: "Сначала отметь две спокойные оценки, а уже потом решай, нужен ли сегодня еще один шаг.",
      keep_consistency: "Оставь один запланированный шаг и одну короткую заметку, без лишних проверок.",
      protect_recovery: "Оставь сегодня один щадящий шаг и один check-in.",
      repeat_small_loop: "Повтори короткий baseline-цикл вместо попытки добавить интенсивность.",
    }[reviewDigest.nextStep];
  }

  return {
    log_two_scores: "Start with two calm scores before deciding whether today needs anything more.",
    keep_consistency: "Keep one planned action and one short reflection. No need to add extra checks.",
    protect_recovery: "Keep today to one recovery-first action and one check-in.",
    repeat_small_loop: "Repeat a short baseline loop instead of adding intensity.",
  }[reviewDigest.nextStep];
}

function digestAlertFallback(reviewDigest: CoachReviewDigest, language: AppLanguage) {
  if (reviewDigest.tone === "steady") {
    return "";
  }

  if (language === "ru") {
    return reviewDigest.tone === "recovery"
      ? "Даже без активного alert общий обзор все еще просит щадящий режим."
      : "Даже без активного alert общий обзор говорит, что данных пока мало и день стоит держать простым.";
  }

  return reviewDigest.tone === "recovery"
    ? "Even without an active alert, the broader review still points to a recovery-first day."
    : "Even without an active alert, the broader review still says the signal is thin and the day should stay simple.";
}

function highestPriorityAlert(alerts: Alert[]) {
  return [...alerts].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0] ?? null;
}

function severityRank(severity: Alert["severity"]) {
  return {
    info: 0,
    caution: 1,
    high_priority: 2,
    medical_attention: 3,
  }[severity];
}
