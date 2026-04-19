import type {
  ActionCard,
  Alert,
  ContentItem,
  CurrentPriority,
  LogEntry,
  QuickLogDefinition,
  QuickLogType,
  RuleEngineInput,
  TodayPayload,
} from "@pmhc/types";

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

const quickLogLabels: Record<QuickLogType, string> = {
  morning_erection: "Morning",
  libido: "Libido",
  confidence: "Confidence",
  energy: "Energy",
  sleep_quality: "Sleep",
  pelvic_floor_done: "Pelvic floor",
  pump_done: "Pump",
  symptom_checkin: "Symptoms",
  sex_happened: "Intimacy",
};

export function buildTodayPayload(input: RuleEngineInput): TodayPayload {
  const safetySignal = hasSafetySignal(input);
  const lowSleepStreak = countRecentLowScores(input.latestLogs, "sleep_quality", 4) >= 3;
  const lowData = input.latestLogs.length < 3;

  const currentPriority = choosePriority({ input, safetySignal, lowSleepStreak, lowData });
  const alerts = chooseAlerts(input, safetySignal, lowSleepStreak);
  const actionCards = chooseActionCards(currentPriority.domain);
  const quickLogs = chooseQuickLogs(currentPriority.domain, input.profile.mode);

  return {
    date: new Date().toISOString().slice(0, 10),
    todayMode: safetySignal || lowData ? "Light" : input.profile.mode === "Pro" ? "Focus" : "Standard",
    syncStatus: "synced",
    activeProgram: input.activeProgram,
    currentPriority,
    dailyState: buildDailyState(input.latestLogs, lowData),
    alerts,
    actionCards,
    quickLogs,
    liveUpdates: buildLiveUpdates(input.contentItems),
    insights: buildInsights(input.latestLogs, lowData),
  };
}

function choosePriority(args: {
  input: RuleEngineInput;
  safetySignal: boolean;
  lowSleepStreak: boolean;
  lowData: boolean;
}): CurrentPriority {
  if (args.safetySignal) {
    return {
      domain: "safety",
      title: "Keep today conservative",
      whyItMatters: "Recent symptom signals mean the safest useful move is to reduce intensity and track clearly.",
      recommendedAction: "Log symptoms and choose only gentle recovery actions today.",
      avoidToday: "Avoid intense or aggressive protocols until the signal is clearer.",
      confidence: "medium",
    };
  }

  if (args.lowSleepStreak) {
    return {
      domain: "recovery",
      title: "Recovery comes first today",
      whyItMatters: "Sleep has been low several times recently, so readiness guidance should become lighter.",
      recommendedAction: "Use a short recovery practice and keep tracking simple.",
      avoidToday: "Avoid stacking extra experiments on a low-recovery day.",
      confidence: "medium",
    };
  }

  if (args.lowData) {
    return {
      domain: "baseline",
      title: "Build your baseline",
      whyItMatters: "There is not enough stable data yet for strong recommendations.",
      recommendedAction: "Log three quick signals today: morning, libido, and confidence.",
      confidence: "low",
    };
  }

  return {
    domain: args.input.profile.primaryGoal === "pelvic_floor" ? "pelvic_floor" : "confidence",
    title: "Keep the plan steady",
    whyItMatters: "Your data is stable enough for a small focused action without adding noise.",
    recommendedAction: "Complete one planned practice and one short reflection.",
    confidence: "medium",
  };
}

function chooseAlerts(input: RuleEngineInput, safetySignal: boolean, lowSleepStreak: boolean): Alert[] {
  const alerts: Alert[] = [...input.recentAlerts];

  if (safetySignal) {
    alerts.push({
      id: "safety-symptoms",
      severity: "medical_attention",
      title: "Symptom review recommended",
      message: "Keep tracking conservative and consider professional guidance if symptoms persist or feel acute.",
      module: "safety",
    });
  }

  if (lowSleepStreak) {
    alerts.push({
      id: "sleep-recovery-caution",
      severity: "caution",
      title: "Recovery signal is low",
      message: "A lighter day is more useful than pushing intensity.",
      module: "today",
    });
  }

  return alerts.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function chooseActionCards(domain: CurrentPriority["domain"]): ActionCard[] {
  const practiceTitle = domain === "recovery" ? "Downshift practice" : "Short practice";

  const cards: ActionCard[] = [
    {
      id: "practice",
      kind: "Practice",
      title: practiceTitle,
      description: "A contained action that supports the current priority.",
      cta: "Start",
    },
    {
      id: "check-in",
      kind: "Check-in",
      title: "One-minute check-in",
      description: "Capture the signal without turning the day into a dashboard.",
      cta: "Log",
    },
    {
      id: "learn",
      kind: "Learn",
      title: "Relevant explainer",
      description: "Read the short context behind today's recommendation.",
      cta: "Read",
    },
    {
      id: "reflect",
      kind: "Reflect",
      title: "Evening note",
      description: "Record what changed, what helped, and what to keep light.",
      cta: "Reflect",
    },
  ];

  return domain === "baseline" ? [cards[1], cards[2], cards[0], cards[3]] : cards;
}

function chooseQuickLogs(domain: CurrentPriority["domain"], mode: RuleEngineInput["profile"]["mode"]): QuickLogDefinition[] {
  const base: QuickLogType[] = ["morning_erection", "libido", "confidence"];
  const recovery: QuickLogType[] = ["sleep_quality", "energy", "symptom_checkin"];
  const practice: QuickLogType[] = ["pelvic_floor_done", "pump_done", "sex_happened"];

  if (domain === "baseline") {
    return base.map(toQuickLogDefinition);
  }

  const ordered = domain === "recovery" || domain === "safety" ? [...recovery, ...base] : [...base, ...recovery];
  const withPractice = mode === "Pro" ? [...ordered, ...practice] : ordered;

  return withPractice.slice(0, mode === "Pro" ? 8 : 5).map(toQuickLogDefinition);
}

function toQuickLogDefinition(type: QuickLogType): QuickLogDefinition {
  return {
    type,
    label: quickLogLabels[type],
    input: type === "symptom_checkin" ? "symptom" : type.endsWith("_done") || type === "morning_erection" || type === "sex_happened" ? "boolean" : "score",
  };
}

function buildDailyState(logs: LogEntry[], lowData: boolean) {
  const sleep = latestNumeric(logs, "sleep_quality");
  const energy = latestNumeric(logs, "energy");
  const confidence = latestNumeric(logs, "confidence");
  const libido = latestNumeric(logs, "libido");

  return [
    {
      id: "readiness",
      label: "Readiness",
      value: lowData ? "Baseline" : scoreLabel(avg([sleep, energy, confidence])),
      direction: "unknown" as const,
      status: lowData ? "collecting first signals" : "based on recent manual logs",
    },
    {
      id: "sleep",
      label: "Sleep",
      value: scoreLabel(sleep),
      direction: sleep != null && sleep < 5 ? ("down" as const) : ("flat" as const),
      status: sleep == null ? "not logged yet" : sleep < 5 ? "needs support" : "usable",
    },
    {
      id: "confidence",
      label: "Confidence",
      value: scoreLabel(confidence),
      direction: "flat" as const,
      status: confidence == null ? "not logged yet" : "logged",
    },
    {
      id: "Libido",
      label: "Libido",
      value: scoreLabel(libido),
      direction: "flat" as const,
      status: libido == null ? "optional signal" : "logged",
    },
  ];
}

function buildLiveUpdates(contentItems: ContentItem[]) {
  const item = contentItems[0];

  return [
    {
      id: item?.id ?? "starter-learning",
      title: item?.title ?? "New: baseline tracking without overchecking",
      sourceLabel: item?.sourceName ?? "Reviewed starter note",
      category: "learning" as const,
    },
  ];
}

function buildInsights(logs: LogEntry[], lowData: boolean) {
  if (lowData) {
    return [
      {
        id: "low-data",
        title: "No pattern yet",
        summary: "A few calm logs are more useful than guessing from one day.",
        confidence: "low" as const,
      },
    ];
  }

  const lowSleepCount = countRecentLowScores(logs, "sleep_quality", 4);

  return [
    {
      id: "sleep-confidence",
      title: lowSleepCount > 0 ? "Sleep may be affecting readiness" : "Signals look stable",
      summary: lowSleepCount > 0 ? "Recent low sleep entries should lower today's intensity." : "Keep the next action small and consistent.",
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

    const value = log.value as Record<string, unknown>;
    return value.pain === true || value.numbness === true || value.blood === true || value.injuryConcern === true;
  });
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

function severityRank(severity: Alert["severity"]) {
  return {
    info: 0,
    caution: 1,
    high_priority: 2,
    medical_attention: 3,
  }[severity];
}
