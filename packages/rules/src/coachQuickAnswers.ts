import type { Alert, AppLanguage, TodayPayload } from "@pmhc/types";
import { explainPriority } from "./todayRules";

export type CoachQuestionId = "priority" | "alert" | "data" | "next_step";

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
      title: "Почему этот фокус?",
    },
    alert: {
      title: "Что значит это предупреждение?",
      fallbackBody:
        "Сейчас активных предупреждений нет. Это не доказательство, что всё идеально; просто по текущим логам Today не видит осторожного сигнала.",
      fallbackNextStep: "Держите план лёгким и продолжайте спокойный трекинг.",
    },
    data: {
      title: "Насколько этому можно доверять?",
    },
    next_step: {
      title: "Что сделать дальше?",
      body: "Начните с самого маленького полезного шага, а не с проверки себя на результат.",
    },
  },
};

export function buildCoachQuickAnswers(today: TodayPayload, language: AppLanguage = "en"): CoachQuickAnswer[] {
  const copy = labels[language];
  const explanation = explainPriority(today.currentPriority, language);
  const alert = highestPriorityAlert(today.alerts);

  return [
    {
      id: "priority",
      title: copy.priority.title,
      body: explanation.explanation,
      nextStep: explanation.nextStep,
    },
    alert
      ? {
          id: "alert",
          title: copy.alert.title,
          body: `${alert.title}: ${alert.message}`,
          nextStep:
            language === "ru"
              ? "Держите трекинг осторожным и сегодня не повышайте интенсивность."
              : "Keep tracking conservative and do not increase intensity today.",
          severity: alert.severity,
        }
      : {
          id: "alert",
          title: copy.alert.title,
          body: copy.alert.fallbackBody ?? "",
          nextStep: copy.alert.fallbackNextStep,
        },
    {
      id: "data",
      title: copy.data.title,
      body: explanation.dataNote,
      nextStep: explanation.confidenceNote,
    },
    {
      id: "next_step",
      title: copy.next_step.title,
      body: copy.next_step.body ?? "",
      nextStep: explanation.avoidToday ? `${explanation.nextStep} ${explanation.avoidToday}` : explanation.nextStep,
    },
  ];
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
