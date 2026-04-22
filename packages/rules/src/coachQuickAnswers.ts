import type { Alert, AppLanguage, TodayPayload } from "@pmhc/types";
import { explainPriority } from "./todayRules";

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
      title: "РџРѕС‡РµРјСѓ СЌС‚РѕС‚ С„РѕРєСѓСЃ?",
    },
    alert: {
      title: "Р§С‚Рѕ Р·РЅР°С‡РёС‚ СЌС‚Рѕ РїСЂРµРґСѓРїСЂРµР¶РґРµРЅРёРµ?",
      fallbackBody:
        "РЎРµР№С‡Р°СЃ Р°РєС‚РёРІРЅС‹С… РїСЂРµРґСѓРїСЂРµР¶РґРµРЅРёР№ РЅРµС‚. Р­С‚Рѕ РЅРµ РґРѕРєР°Р·Р°С‚РµР»СЊСЃС‚РІРѕ, С‡С‚Рѕ РІСЃС‘ РёРґРµР°Р»СЊРЅРѕ; РїСЂРѕСЃС‚Рѕ РїРѕ С‚РµРєСѓС‰РёРј Р»РѕРіР°Рј Today РЅРµ РІРёРґРёС‚ РѕСЃС‚РѕСЂРѕР¶РЅРѕРіРѕ СЃРёРіРЅР°Р»Р°.",
      fallbackNextStep: "Р”РµСЂР¶РёС‚Рµ РїР»Р°РЅ Р»С‘РіРєРёРј Рё РїСЂРѕРґРѕР»Р¶Р°Р№С‚Рµ СЃРїРѕРєРѕР№РЅС‹Р№ С‚СЂРµРєРёРЅРі.",
    },
    data: {
      title: "РќР°СЃРєРѕР»СЊРєРѕ СЌС‚РѕРјСѓ РјРѕР¶РЅРѕ РґРѕРІРµСЂСЏС‚СЊ?",
    },
    next_step: {
      title: "Р§С‚Рѕ СЃРґРµР»Р°С‚СЊ РґР°Р»СЊС€Рµ?",
      body: "РќР°С‡РЅРёС‚Рµ СЃ СЃР°РјРѕРіРѕ РјР°Р»РµРЅСЊРєРѕРіРѕ РїРѕР»РµР·РЅРѕРіРѕ С€Р°РіР°, Р° РЅРµ СЃ РїСЂРѕРІРµСЂРєРё СЃРµР±СЏ РЅР° СЂРµР·СѓР»СЊС‚Р°С‚.",
    },
  },
};

export function buildCoachQuickAnswers(
  today: TodayPayload,
  language: AppLanguage = "en",
  reviewDigest: CoachReviewDigest | null = null,
): CoachQuickAnswer[] {
  const copy = labels[language];
  const explanation = explainPriority(today.currentPriority, language);
  const alert = highestPriorityAlert(today.alerts);
  const priorityDigestNote = reviewDigest ? digestPriorityNote(reviewDigest, language) : "";
  const dataDigestNote = reviewDigest ? digestConfidenceNote(reviewDigest, language) : "";
  const digestNextStep = reviewDigest ? digestNextStepText(reviewDigest, language) : null;
  const alertDigestFallback = reviewDigest ? digestAlertFallback(reviewDigest, language) : "";

  return [
    {
      id: "priority",
      title: copy.priority.title,
      body: [explanation.explanation, priorityDigestNote].filter(Boolean).join(" "),
      nextStep: digestNextStep ?? explanation.nextStep,
    },
    alert
      ? {
          id: "alert",
          title: copy.alert.title,
          body: [`${alert.title}: ${alert.message}`, alertDigestFallback].filter(Boolean).join(" "),
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
      body: [explanation.dataNote, dataDigestNote].filter(Boolean).join(" "),
      nextStep: explanation.confidenceNote,
    },
    {
      id: "next_step",
      title: copy.next_step.title,
      body: copy.next_step.body ?? "",
      nextStep:
        digestNextStep ?? (explanation.avoidToday ? `${explanation.nextStep} ${explanation.avoidToday}` : explanation.nextStep),
    },
  ];
}

function defaultAlertStep(language: AppLanguage) {
  return language === "ru"
    ? "Держите трекинг осторожным и сегодня не повышайте интенсивность."
    : "Keep tracking conservative and do not increase intensity today.";
}

function digestPriorityNote(reviewDigest: CoachReviewDigest, language: AppLanguage) {
  if (language === "ru") {
    return {
      baseline_building: "Общий обзор пока все еще просит спокойного baseline-режима и сбора сигнала.",
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
      high: "Уверенность общего обзора высокая, но это все равно не повод повышать нагрузку резко.",
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
      log_two_scores: "Сначала отметь две спокойные оценки, а уже потом решай, нужен ли сегодня еще шаг.",
      keep_consistency: "Оставь один запланированный шаг и одну короткую заметку, без лишних проверок.",
      protect_recovery: "Оставь на сегодня один щадящий шаг и один чек-ин.",
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
