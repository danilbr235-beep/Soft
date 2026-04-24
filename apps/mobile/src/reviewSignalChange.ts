import { hasSymptomRedFlag } from "@pmhc/safety";
import type { AppLanguage, LogEntry, ProgramHistoryEntry, QuickLogType } from "@pmhc/types";

export type ReviewSignalChangeTone = "building" | "steady" | "recovery" | "mixed";
export type ReviewSignalChangeReason =
  | "more_signal"
  | "recovery_shift"
  | "score_shift"
  | "little_changed";
export type ReviewSignalChangeNextStep =
  | "keep_logging"
  | "protect_recovery"
  | "watch_mix"
  | "hold_steady";

export type ReviewSignalChange = {
  title: string;
  body: string;
  toneId: ReviewSignalChangeTone;
  reasonId: ReviewSignalChangeReason;
  nextStepId: ReviewSignalChangeNextStep;
  tone: string;
  pattern: string;
  reason: string;
  nextStepTitle: string;
  nextStep: string;
  meta: string;
  changeLines: string[];
};

type LocalizedCopy = {
  title: string;
  body: string;
  nextStepTitle: string;
  tones: Record<ReviewSignalChangeTone, string>;
  patterns: Record<ReviewSignalChangeReason, string>;
  reasons: Record<ReviewSignalChangeReason, string>;
  nextSteps: Record<ReviewSignalChangeNextStep, string>;
  meta: (currentLogs: number, previousLogs: number) => string;
  noChangeLine: string;
  scoreLabels: Record<Exclude<QuickLogType, "morning_erection" | "pelvic_floor_done" | "pump_done" | "sex_happened" | "symptom_checkin">, string>;
  logsLine: (currentLogs: number, previousLogs: number) => string;
  scoreLine: (label: string, currentAverage: number | null, previousAverage: number | null) => string;
  symptomLine: (currentCount: number, previousCount: number) => string;
  cycleLine: (currentCount: number, previousCount: number) => string;
  noScoreYet: string;
};

type ChangeLine = {
  id: string;
  kind: "positive" | "negative" | "recovery";
  text: string;
  priority: number;
};

const windowDays = 7;
const msPerDay = 24 * 60 * 60 * 1000;
const trackedScoreTypes: Array<"sleep_quality" | "energy" | "confidence" | "libido"> = [
  "sleep_quality",
  "energy",
  "confidence",
  "libido",
];

const copy: Record<AppLanguage, LocalizedCopy> = {
  en: {
    title: "What changed this week",
    body: "A direct comparison between the last 7 days and the 7 days before them.",
    nextStepTitle: "Next weekly read",
    tones: {
      building: "More usable signal",
      steady: "Week looks similar",
      recovery: "Recovery picture tightened",
      mixed: "Mixed weekly shifts",
    },
    patterns: {
      more_signal: "Pattern: this week added more usable signal",
      recovery_shift: "Pattern: this week tightened the recovery picture",
      score_shift: "Pattern: some scores moved, but not all in the same direction",
      little_changed: "Pattern: this week looks close to the one before it",
    },
    reasons: {
      more_signal:
        "The current week carries more usable tracking signal than the week before, so it is easier to read without forcing conclusions.",
      recovery_shift:
        "The current week brought a more cautious recovery picture, so the weekly read should stay conservative.",
      score_shift:
        "Some signals moved across the two weeks, but not as one clean trend yet.",
      little_changed:
        "The last 7 days look close to the previous 7-day window, so there is no strong weekly swing to react to.",
    },
    nextSteps: {
      keep_logging: "Keep the same calm logging loop for a few more days before changing the plan.",
      protect_recovery: "Treat the new weekly shift as a recovery-first signal and keep the next step smaller.",
      watch_mix: "Watch the next few logs before deciding which direction matters more.",
      hold_steady: "Keep the current routine steady and wait for a clearer weekly difference.",
    },
    meta: (currentLogs, previousLogs) => `This week: ${formatEnglishLogCount(currentLogs)} - Previous week: ${formatEnglishLogCount(previousLogs)}`,
    noChangeLine: "No strong difference between the last two weeks yet.",
    scoreLabels: {
      sleep_quality: "Sleep",
      energy: "Energy",
      confidence: "Confidence",
      libido: "Libido",
    },
    logsLine: (currentLogs, previousLogs) =>
      `Logs: ${formatEnglishLogCount(currentLogs)} this week vs ${formatEnglishLogCount(previousLogs)} last week`,
    scoreLine: (label, currentAverage, previousAverage) =>
      `${label}: ${formatAverageLabel(currentAverage, "en")} this week vs ${formatAverageLabel(previousAverage, "en")} last week`,
    symptomLine: (currentCount, previousCount) =>
      `Symptoms: ${formatEnglishCheckinCount(currentCount)} this week vs ${formatEnglishCheckinCount(previousCount)} last week`,
    cycleLine: (currentCount, previousCount) =>
      `Cycles: ${formatEnglishCycleCount(currentCount)} this week vs ${formatEnglishCycleCount(previousCount)} last week`,
    noScoreYet: "no score",
  },
  ru: {
    title: "Что изменилось за неделю",
    body: "Прямое сравнение последних 7 дней с семью днями до них.",
    nextStepTitle: "Следующий недельный вывод",
    tones: {
      building: "Сигнала стало больше",
      steady: "Неделя выглядит похоже",
      recovery: "Картина по восстановлению стала осторожнее",
      mixed: "За неделю сдвиги смешанные",
    },
    patterns: {
      more_signal: "Паттерн: на этой неделе стало больше полезного сигнала",
      recovery_shift: "Паттерн: на этой неделе картина стала осторожнее",
      score_shift: "Паттерн: часть оценок сдвинулась, но не в одну сторону",
      little_changed: "Паттерн: эта неделя пока похожа на предыдущую",
    },
    reasons: {
      more_signal:
        "На этой неделе появилось больше пригодного для чтения трекинг-сигнала, поэтому обзор можно читать спокойнее и без догадок.",
      recovery_shift:
        "На этой неделе картина по восстановлению стала осторожнее, поэтому итог лучше держать консервативным.",
      score_shift:
        "Между двумя неделями некоторые сигналы сдвинулись, но пока не сложились в один ясный тренд.",
      little_changed:
        "Последние 7 дней пока выглядят близко к предыдущему окну, поэтому сильного недельного сдвига нет.",
    },
    nextSteps: {
      keep_logging: "Оставь тот же спокойный цикл логов еще на несколько дней, прежде чем менять план.",
      protect_recovery: "Считай этот недельный сдвиг сигналом в сторону восстановления и оставь следующий шаг легче.",
      watch_mix: "Посмотри на несколько следующих логов, прежде чем решать, какой сдвиг здесь важнее.",
      hold_steady: "Оставь текущую рутину без изменений и дождись более явной разницы между неделями.",
    },
    meta: (currentLogs, previousLogs) =>
      `Эта неделя: ${formatRussianLogCount(currentLogs)} - Предыдущая неделя: ${formatRussianLogCount(previousLogs)}`,
    noChangeLine: "Пока между двумя неделями нет сильной разницы.",
    scoreLabels: {
      sleep_quality: "Сон",
      energy: "Энергия",
      confidence: "Уверенность",
      libido: "Либидо",
    },
    logsLine: (currentLogs, previousLogs) =>
      `Логи: ${formatRussianLogCount(currentLogs)} на этой неделе против ${formatRussianLogCount(previousLogs)} на прошлой`,
    scoreLine: (label, currentAverage, previousAverage) =>
      `${label}: ${formatAverageLabel(currentAverage, "ru")} на этой неделе против ${formatAverageLabel(previousAverage, "ru")} на прошлой`,
    symptomLine: (currentCount, previousCount) =>
      `Симптомы: ${formatRussianCheckinCount(currentCount)} на этой неделе против ${formatRussianCheckinCount(previousCount)} на прошлой`,
    cycleLine: (currentCount, previousCount) =>
      `Циклы: ${formatRussianCycleCount(currentCount)} на этой неделе против ${formatRussianCycleCount(previousCount)} на прошлой`,
    noScoreYet: "оценок не было",
  },
};

export function buildReviewSignalChange({
  language,
  logs,
  now = new Date(),
  programHistory,
}: {
  language: AppLanguage;
  logs: LogEntry[];
  now?: Date;
  programHistory: ProgramHistoryEntry[];
}): ReviewSignalChange {
  const languageCopy = copy[language];
  const currentWindow = logsInRange(logs, now, 0, windowDays);
  const previousWindow = logsInRange(logs, now, windowDays, windowDays * 2);
  const currentCycles = cyclesInRange(programHistory, now, 0, windowDays);
  const previousCycles = cyclesInRange(programHistory, now, windowDays, windowDays * 2);
  const changeLines: ChangeLine[] = [];
  let positiveCount = 0;
  let negativeCount = 0;
  let recoveryCount = 0;

  const currentSymptoms = currentWindow.filter((log) => log.type === "symptom_checkin");
  const previousSymptoms = previousWindow.filter((log) => log.type === "symptom_checkin");
  const currentHasRedFlag = currentSymptoms.some((log) => hasSymptomRedFlag(log.value));
  const previousHasRedFlag = previousSymptoms.some((log) => hasSymptomRedFlag(log.value));

  if (currentSymptoms.length !== previousSymptoms.length || currentHasRedFlag !== previousHasRedFlag) {
    const kind = currentHasRedFlag || currentSymptoms.length > previousSymptoms.length ? "recovery" : "positive";
    changeLines.push({
      id: "symptoms",
      kind,
      text: languageCopy.symptomLine(currentSymptoms.length, previousSymptoms.length),
      priority: 10,
    });
    if (kind === "recovery") {
      recoveryCount += 1;
    } else {
      positiveCount += 1;
    }
  }

  for (const type of trackedScoreTypes) {
    const currentSummary = summarizeScore(currentWindow, type);
    const previousSummary = summarizeScore(previousWindow, type);
    const delta = scoreDelta(currentSummary.average, previousSummary.average);
    const hasAnySignal = currentSummary.count > 0 || previousSummary.count > 0;
    const changed =
      hasAnySignal &&
      (currentSummary.count === 0 ||
        previousSummary.count === 0 ||
        delta >= 1 ||
        delta <= -1);

    if (!changed) {
      continue;
    }

    const kind =
      type === "sleep_quality" || type === "energy"
        ? delta < 0 || (currentSummary.count > 0 && previousSummary.count === 0 && currentSummary.average != null && currentSummary.average <= 4)
          ? "recovery"
          : delta > 0 || previousSummary.count === 0
            ? "positive"
            : "negative"
        : delta > 0 || previousSummary.count === 0
          ? "positive"
          : "negative";

    changeLines.push({
      id: type,
      kind,
      text: languageCopy.scoreLine(languageCopy.scoreLabels[type], currentSummary.average, previousSummary.average),
      priority:
        type === "sleep_quality" ? 9 :
        type === "energy" ? 8 :
        type === "confidence" ? 7 :
        6,
    });

    if (kind === "recovery") {
      recoveryCount += 1;
    } else if (kind === "positive") {
      positiveCount += 1;
    } else {
      negativeCount += 1;
    }
  }

  if (
    currentWindow.length !== previousWindow.length &&
    (Math.abs(currentWindow.length - previousWindow.length) >= 2 || currentWindow.length === 0 || previousWindow.length === 0)
  ) {
    const kind = currentWindow.length > previousWindow.length ? "positive" : "negative";
    changeLines.push({
      id: "logs",
      kind,
      text: languageCopy.logsLine(currentWindow.length, previousWindow.length),
      priority: 5,
    });
    if (kind === "positive") {
      positiveCount += 1;
    } else {
      negativeCount += 1;
    }
  }

  if (currentCycles.length > previousCycles.length) {
    changeLines.push({
      id: "cycles",
      kind: "positive",
      text: languageCopy.cycleLine(currentCycles.length, previousCycles.length),
      priority: 4,
    });
    positiveCount += 1;
  }

  const topLines = changeLines
    .sort((left, right) => right.priority - left.priority)
    .slice(0, 4)
    .map((line) => line.text);

  const summary = selectSummary({
    hasChanges: topLines.length > 0,
    negativeCount,
    positiveCount,
    recoveryCount,
  });

  return {
    title: languageCopy.title,
    body: languageCopy.body,
    toneId: summary.tone,
    reasonId: summary.reason,
    nextStepId: summary.nextStep,
    tone: languageCopy.tones[summary.tone],
    pattern: languageCopy.patterns[summary.reason],
    reason: languageCopy.reasons[summary.reason],
    nextStepTitle: languageCopy.nextStepTitle,
    nextStep: languageCopy.nextSteps[summary.nextStep],
    meta: languageCopy.meta(currentWindow.length, previousWindow.length),
    changeLines: topLines.length > 0 ? topLines : [languageCopy.noChangeLine],
  };
}

function selectSummary({
  hasChanges,
  negativeCount,
  positiveCount,
  recoveryCount,
}: {
  hasChanges: boolean;
  negativeCount: number;
  positiveCount: number;
  recoveryCount: number;
}) {
  if (recoveryCount > 0) {
    return {
      tone: "recovery",
      reason: "recovery_shift",
      nextStep: "protect_recovery",
    } satisfies {
      tone: ReviewSignalChangeTone;
      reason: ReviewSignalChangeReason;
      nextStep: ReviewSignalChangeNextStep;
    };
  }

  if (!hasChanges) {
    return {
      tone: "steady",
      reason: "little_changed",
      nextStep: "hold_steady",
    } satisfies {
      tone: ReviewSignalChangeTone;
      reason: ReviewSignalChangeReason;
      nextStep: ReviewSignalChangeNextStep;
    };
  }

  if (positiveCount > 0 && negativeCount === 0) {
    return {
      tone: "building",
      reason: "more_signal",
      nextStep: "keep_logging",
    } satisfies {
      tone: ReviewSignalChangeTone;
      reason: ReviewSignalChangeReason;
      nextStep: ReviewSignalChangeNextStep;
    };
  }

  return {
    tone: "mixed",
    reason: "score_shift",
    nextStep: "watch_mix",
  } satisfies {
    tone: ReviewSignalChangeTone;
    reason: ReviewSignalChangeReason;
    nextStep: ReviewSignalChangeNextStep;
  };
}

function logsInRange(logs: LogEntry[], now: Date, startDaysAgo: number, endDaysAgo: number) {
  const nowMs = now.getTime();
  const start = nowMs - endDaysAgo * msPerDay;
  const end = nowMs - startDaysAgo * msPerDay;

  return logs.filter((log) => {
    const occurredAt = Date.parse(log.occurredAt);
    return Number.isFinite(occurredAt) && occurredAt >= start && occurredAt < end;
  });
}

function cyclesInRange(history: ProgramHistoryEntry[], now: Date, startDaysAgo: number, endDaysAgo: number) {
  const nowMs = now.getTime();
  const start = nowMs - endDaysAgo * msPerDay;
  const end = nowMs - startDaysAgo * msPerDay;

  return history.filter((entry) => {
    const completedAt = Date.parse(entry.completedAt);
    return Number.isFinite(completedAt) && completedAt >= start && completedAt < end;
  });
}

function summarizeScore(logs: LogEntry[], type: QuickLogType) {
  const values = logs
    .filter((log) => log.type === type && typeof log.value === "number")
    .map((log) => Number(log.value));

  return {
    count: values.length,
    average: values.length > 0 ? roundToTenth(values.reduce((sum, value) => sum + value, 0) / values.length) : null,
  };
}

function scoreDelta(currentAverage: number | null, previousAverage: number | null) {
  if (currentAverage == null || previousAverage == null) {
    return 0;
  }

  return roundToTenth(currentAverage - previousAverage);
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}

function formatAverageLabel(value: number | null, language: AppLanguage) {
  if (value == null) {
    return language === "ru" ? "оценок не было" : "no score";
  }

  return `${value.toFixed(1)} avg`;
}

function formatEnglishLogCount(count: number) {
  return `${count} log${count === 1 ? "" : "s"}`;
}

function formatEnglishCheckinCount(count: number) {
  return `${count} check-in${count === 1 ? "" : "s"}`;
}

function formatEnglishCycleCount(count: number) {
  return `${count} finish${count === 1 ? "" : "es"}`;
}

function formatRussianLogCount(count: number) {
  return `${count} ${russianLogWord(count)}`;
}

function formatRussianCheckinCount(count: number) {
  return `${count} ${russianCheckinWord(count)}`;
}

function formatRussianCycleCount(count: number) {
  return `${count} ${russianCycleWord(count)}`;
}

function russianLogWord(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "логов";
  }

  if (last === 1) {
    return "лог";
  }

  if (last >= 2 && last <= 4) {
    return "лога";
  }

  return "логов";
}

function russianCheckinWord(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "чек-инов";
  }

  if (last === 1) {
    return "чек-ин";
  }

  if (last >= 2 && last <= 4) {
    return "чек-ина";
  }

  return "чек-инов";
}

function russianCycleWord(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "завершений";
  }

  if (last === 1) {
    return "завершение";
  }

  if (last >= 2 && last <= 4) {
    return "завершения";
  }

  return "завершений";
}
