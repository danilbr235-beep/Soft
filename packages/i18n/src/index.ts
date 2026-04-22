import type { AppLanguage, QuickLogType, TodayMode } from "@pmhc/types";
import type { ProgramDayPhase } from "@pmhc/types";

export type LocalizedTab = "Today" | "Track" | "Learn" | "Programs" | "Coach" | "Settings";

type ActionKindCopy = Record<"Learn" | "Check-in" | "Practice" | "Reflect", string>;
type TrackFilterCopy = Record<"all" | "scores" | "symptoms" | "routines", string>;
type LearnCategoryCopy = Record<
  "all" | "baseline" | "recovery" | "sleep" | "pelvic_floor" | "confidence" | "tracking" | "safety" | "privacy" | "general",
  string
>;
type LearnRecommendationReasonCopy = Record<"priority" | "program" | "safety" | "starter", string>;
type TodayStatusCopy = {
  labels: Record<"mode" | "sync" | "privacy" | "program", string>;
  modes: Record<TodayMode, string>;
  sync: Record<"synced" | "pending" | "offline", string>;
  privacy: Record<"vaultOn" | "discreet" | "standard", string>;
};
type WeeklySnapshotStatusCopy = Record<"no_data" | "low_data" | "steady" | "changed" | "caution", string>;
type PatternHintLabelCopy = Record<"sleep_energy" | "sleep_confidence" | "confidence_libido" | "low_data", string>;
type PatternDirectionCopy = Record<"together" | "opposite" | "unknown", string>;
type PatternConfidenceCopy = Record<"low" | "medium", string>;
type ProgramDetailLabelCopy = Record<"status" | "focus" | "pace" | "stage", string>;
type ProgramDetailChecklistStateCopy = Record<"not_started" | "in_progress" | "done" | "rest_day", string>;
type ProgramDetailFocusCopy = Record<"observe" | "practice" | "recover", string>;
type ProgramDetailPaceCopy = Record<"light" | "steady" | "downshift", string>;
type ProgramDetailCompletionBandCopy = Record<"starting" | "building" | "closing" | "complete", string>;
type ProgramAdjustmentKindCopy = Record<"downshift" | "recovery" | "baseline" | "steady" | "closeout", string>;
type ProgramAdjustmentNextStepCopy = Record<
  "take_rest_day" | "keep_one_task" | "start_with_check_in" | "close_day_gently" | "review_boundary",
  string
>;
type ProgramCompletionStateCopy = Record<"steady_finish" | "mixed_finish" | "recovery_finish", string>;
type ProgramCompletionNextStepCopy = Record<"choose_next_light" | "rebuild_baseline" | "keep_recovery_light", string>;
type ProgramNextPathPriorityCopy = Record<"primary" | "secondary", string>;
type ProgramNextPathReasonCopy = Record<
  "baseline_rebuild" | "sleep_support" | "body_consistency" | "confidence_layer" | "recovery_guardrail",
  string
>;
type ProgramReviewFocusCopy = Record<
  "build_on_stability" | "rebuild_with_short_cycles" | "protect_recovery",
  string
>;
type ProgramReviewTrendCopy = Record<
  "toward_stability" | "holding_pattern" | "toward_recovery",
  string
>;

function russianCycleWord(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "циклов";
  }

  if (last === 1) {
    return "цикл";
  }

  if (last >= 2 && last <= 4) {
    return "цикла";
  }

  return "циклов";
}

export type LanguageCopy = {
  common: {
    language: string;
    back: string;
    next: string;
    yes: string;
    no: string;
    notNow: string;
    useEnglish: string;
    useRussian: string;
    minutes: (count: number) => string;
  };
  onboarding: {
    heroEyebrow: string;
    heroTitle: string;
    heroBody: string;
    beforeTitle: string;
    beforeLine1: string;
    beforeLine2: string;
    start: string;
    stepOneEyebrow: string;
    stepOneTitle: string;
    stepOneBody: string;
    stepTwoEyebrow: string;
    stepTwoTitle: string;
    stepTwoBody: string;
    stepThreeEyebrow: string;
    stepThreeTitle: string;
    stepThreeBody: string;
    generateToday: string;
    goals: Record<"sexual_confidence" | "pelvic_floor" | "recovery" | "sleep_environment", string>;
    baselines: Record<"low" | "mixed" | "stable", string>;
    modes: Record<"Simple" | "Pro", string>;
    conservative: string;
  };
  nav: {
    labels: Record<LocalizedTab, string>;
    openLabels: Record<LocalizedTab, string>;
  };
  today: {
    title: string;
    noActiveProgram: string;
    actionKinds: ActionKindCopy;
    currentPriority: string;
    confidence: (level: string) => string;
    askCoachWhy: string;
    quickLog: string;
    liveUpdate: string;
    insight: string;
    status: TodayStatusCopy;
  };
  track: {
    title: string;
    subtitle: string;
    snapshotTitle: string;
    snapshotCounts: (logsToday: number, logsThisWeek: number) => string;
    noTrendYet: string;
    scoreDetail: (average: number, latest: number) => string;
    noScoreData: string;
    weeklySnapshotTitle: string;
    weeklySnapshotBody: string;
    weeklyAverage: (average: number) => string;
    weeklyScoreMeta: (count: number, status: string) => string;
    weeklySymptomValue: (count: number) => string;
    weeklySymptomMeta: (status: string) => string;
    weeklyStatusLabels: WeeklySnapshotStatusCopy;
    patternHintsTitle: string;
    patternHintsBody: string;
    patternHintLabels: PatternHintLabelCopy;
    patternDirectionLabels: PatternDirectionCopy;
    patternConfidenceLabels: PatternConfidenceCopy;
    patternHintObservedBody: (direction: string) => string;
    patternHintLowDataBody: string;
    patternHintMeta: (pairedDays: number, confidence: string) => string;
    safetyNoteTitle: string;
    safetyNoteBody: string;
    syncQueue: string;
    pendingWrites: (count: number) => string;
    synced: string;
    syncAction: string;
    programReviewTitle: string;
    programReviewBody: string;
    recentLogs: string;
    filterTitle: string;
    filterLabels: TrackFilterCopy;
    noLogs: string;
    noFilteredLogs: string;
    editAction: string;
    deleteAction: string;
    editLog: (label: string) => string;
    deleteLog: (label: string) => string;
    exportTitle: string;
    exportBody: string;
    exportAction: string;
    exportReady: (count: number) => string;
    allClear: string;
  };
  learn: {
    title: string;
    subtitle: string;
    recommended: string;
    allContent: string;
    categories: string;
    categoryLabels: LearnCategoryCopy;
    openDetail: (title: string) => string;
    filterCategory: (label: string) => string;
    backToLibrary: string;
    detailMeta: (duration: string, source: string) => string;
    recommendedReason: LearnRecommendationReasonCopy;
    noCategoryItems: string;
    save: string;
    saved: string;
    unsave: string;
    markComplete: string;
    completed: string;
  };
  programs: {
    title: string;
    subtitle: string;
    programTitles: Record<string, string>;
    active: string;
    noActiveProgram: string;
    noActiveDay: string;
    dayOf: (day: number, total: number) => string;
    percentComplete: (percent: number) => string;
    completeToday: string;
    completeProgramDay: string;
    restToday: string;
    restProgramDay: string;
    skipToday: string;
    skipProgramDay: string;
    pauseProgram: string;
    resumeProgram: string;
    completedDays: (count: number) => string;
    restDays: (count: number) => string;
    skippedDays: (count: number) => string;
    remainingDays: (count: number) => string;
    phaseLabels: Record<ProgramDayPhase, string>;
    nextCandidates: string;
    recommendedNextPaths: string;
    candidates: string[];
    nextPathIntro: ProgramCompletionStateCopy;
    nextPathPriorityLabels: ProgramNextPathPriorityCopy;
    nextPathReasons: ProgramNextPathReasonCopy;
    startProgram: string;
    startRecommendedProgram: (title: string) => string;
    historyTitle: string;
    historyBody: string;
    historyContinuedWith: (title: string) => string;
    reviewTitle: string;
    reviewBody: string;
    reviewFocuses: ProgramReviewFocusCopy;
    reviewTrendTitle: string;
    reviewTrendLabels: ProgramReviewTrendCopy;
    reviewTotals: (cycles: number, completed: number, rest: number, skipped: number) => string;
    reviewLatest: (title: string) => string;
    dayPlanTitle: string;
    pausedTitle: string;
    pausedBody: string;
    openDetail: string;
    backToPrograms: string;
    detailOverview: string;
    detailSummaryTitle: string;
    detailLabels: ProgramDetailLabelCopy;
    detailChecklistStates: ProgramDetailChecklistStateCopy;
    detailFocusLabels: ProgramDetailFocusCopy;
    detailPaceLabels: ProgramDetailPaceCopy;
    detailCompletionBands: ProgramDetailCompletionBandCopy;
    detailConservativeNotes: ProgramDetailPaceCopy;
    detailNextMilestone: (day: number) => string;
    detailFinalMilestone: string;
    adjustmentTitle: string;
    adjustmentKinds: ProgramAdjustmentKindCopy;
    adjustmentBodies: ProgramAdjustmentKindCopy;
    adjustmentReason: (reason: string) => string;
    adjustmentAvoid: (text: string) => string;
    adjustmentTarget: (count: number) => string;
    adjustmentNextStepTitle: string;
    adjustmentNextSteps: ProgramAdjustmentNextStepCopy;
    completionTitle: string;
    completionStates: ProgramCompletionStateCopy;
    completionBodies: ProgramCompletionStateCopy;
    completionReason: (reason: string) => string;
    completionReview: (completed: number, rest: number, skipped: number) => string;
    completionNextStepTitle: string;
    completionNextSteps: ProgramCompletionNextStepCopy;
    taskProgress: (done: number, total: number) => string;
    markTaskDone: (title: string) => string;
    markTaskOpen: (title: string) => string;
    taskDone: string;
    taskOpen: string;
    taskTitles: Record<string, string>;
    taskDescriptions: Record<string, string>;
    planSummaries: Record<string, string>;
  };
  coach: {
    title: string;
    subtitle: string;
    whyPriority: string;
    certainty: string;
    keepLight: string;
    boundary: string;
    quickQuestions: string;
    openQuestion: (title: string) => string;
    nextStep: string;
  };
  settings: {
    title: string;
    subtitle: string;
    languageTitle: string;
    languageBody: string;
    privacyVault: string;
    vaultStatus: (vaultEnabled: boolean, discreetEnabled: boolean) => string;
    turnVaultOff: string;
    turnVaultOn: string;
    vaultOn: string;
    vaultOff: string;
    lockDemoVault: string;
    pinTitle: string;
    pinBody: string;
    pinPlaceholder: string;
    savePin: string;
    updatePin: string;
    clearPin: string;
    pinIsSet: string;
    pinNotSet: string;
    autoLockTitle: string;
    autoLockStatus: (minutes: number) => string;
    medicalBoundary: string;
    medicalBoundaryBody: string;
    reset: string;
  };
  privacyLock: {
    eyebrow: string;
    title: string;
    body: string;
    unlock: string;
    pinPrompt: string;
    pinPlaceholder: string;
    unlockWithPin: string;
    wrongPin: string;
  };
  quickLog: {
    labels: Record<QuickLogType, string>;
    subtitle: string;
    saveLabel: (label: string, option: string | number) => string;
  };
};

const quickLogLabelsEn: Record<QuickLogType, string> = {
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

const quickLogLabelsRu: Record<QuickLogType, string> = {
  morning_erection: "Утро",
  libido: "Либидо",
  confidence: "Уверенность",
  energy: "Энергия",
  sleep_quality: "Сон",
  pelvic_floor_done: "Тазовое дно",
  pump_done: "Помпа",
  symptom_checkin: "Симптомы",
  sex_happened: "Близость",
};

const programTitlesEn: Record<string, string> = {
  "confidence-reset-14": "14-day confidence reset",
  "pelvic-floor-starter": "Pelvic floor consistency starter",
  "clarity-baseline-7": "7-day clarity baseline",
  "sleep-environment-reset": "Sleep and environment reset",
  "conservative-recovery": "Conservative recovery mode",
};

const programTitlesRu: Record<string, string> = {
  "confidence-reset-14": "14 дней спокойной уверенности",
  "pelvic-floor-starter": "Мягкая регулярность для тазового дна",
  "clarity-baseline-7": "7 дней базовой линии",
  "sleep-environment-reset": "Сон и восстановление",
  "conservative-recovery": "Осторожное восстановление",
};

const taskTitlesEn: Record<string, string> = {
  "baseline-check": "Baseline check",
  "downshift-practice": "Downshift practice",
  "evening-reflection": "Evening note",
  "comfort-check": "Comfort check",
  "gentle-practice": "Gentle consistency practice",
  "room-cue": "Room cue",
  "wind-down-check": "Wind-down check",
  "symptom-check": "Symptom check",
  "recovery-only": "Recovery-only action",
  "boundary-note": "Boundary note",
  "recovery-reset": "Recovery reset",
  "confidence-map": "Confidence map",
  "body-reset": "Body reset",
  "tiny-action": "Tiny action",
  "weekly-review": "Weekly review",
  "next-week-boundary": "Next-week boundary",
};

const taskDescriptionsEn: Record<string, string> = {
  "baseline-check": "Log the signal without turning it into a verdict.",
  "downshift-practice": "Do one calm reset before any bigger experiment.",
  "evening-reflection": "Record what helped and what should stay light.",
  "comfort-check": "Notice comfort first. If anything feels off, keep the day lighter.",
  "gentle-practice": "Use an easy set. Stop well before strain.",
  "room-cue": "Pick one small cue that makes sleep easier tonight.",
  "wind-down-check": "Rate energy and stress before the evening gets crowded.",
  "symptom-check": "Log the signal plainly and keep the rest of the day gentle.",
  "recovery-only": "Choose a low-intensity action that does not chase performance.",
  "boundary-note": "Write what to avoid today so the plan stays conservative.",
  "recovery-reset": "Use one short downshift action before adding more data.",
  "confidence-map": "Name the situation and the signal without turning it into a verdict.",
  "body-reset": "Use one calm reset before any bigger experiment.",
  "tiny-action": "Choose one small action that supports steadiness today.",
  "weekly-review": "Look for one pattern without forcing a conclusion.",
  "next-week-boundary": "Name one thing to keep light next week.",
};

const taskTitlesRu: Record<string, string> = {
  "baseline-check": "Проверка без оценки",
  "downshift-practice": "Снизить темп",
  "evening-reflection": "Короткая заметка вечером",
  "comfort-check": "Проверка комфорта",
  "gentle-practice": "Мягкая практика",
  "room-cue": "Один сигнал для сна",
  "wind-down-check": "Вечерний чек-ин",
  "symptom-check": "Проверка симптомов",
  "recovery-only": "Только восстановление",
  "boundary-note": "Заметка о границах",
  "recovery-reset": "Короткий сброс напряжения",
  "confidence-map": "Карта уверенности",
  "body-reset": "Сброс напряжения",
  "tiny-action": "Маленькое действие",
  "weekly-review": "Итог недели",
  "next-week-boundary": "Граница на следующую неделю",
};

const taskDescriptionsRu: Record<string, string> = {
  "baseline-check": "Отметьте один сигнал спокойно, без выводов о себе.",
  "downshift-practice": "Сделайте короткий сброс перед любыми новыми экспериментами.",
  "evening-reflection": "Запишите, что помогло, а что завтра лучше оставить полегче.",
  "comfort-check": "Сначала комфорт. Если что-то настораживает, сегодня выбираем мягкий режим.",
  "gentle-practice": "Легкий подход без напряжения. Остановитесь раньше, чем появится усталость.",
  "room-cue": "Выберите один простой сигнал, который поможет лечь спокойнее.",
  "wind-down-check": "Отметьте энергию и стресс до того, как вечер станет шумным.",
  "symptom-check": "Запишите сигнал прямо и спокойно, без попытки продавить день.",
  "recovery-only": "Выберите низкоинтенсивное действие без гонки за результатом.",
  "boundary-note": "Запишите, чего сегодня лучше не делать, чтобы план остался осторожным.",
  "recovery-reset": "Сделайте короткое восстановительное действие до новых логов.",
  "confidence-map": "Назовите ситуацию и сигнал без вывода о себе.",
  "body-reset": "Сделайте один спокойный сброс перед любым большим экспериментом.",
  "tiny-action": "Выберите маленький шаг, который сегодня поддержит устойчивость.",
  "weekly-review": "Найдите один паттерн, но не заставляйте себя делать вывод.",
  "next-week-boundary": "Назовите одну вещь, которую на следующей неделе лучше оставить полегче.",
};

const planSummariesEn: Record<string, string> = {
  "confidence-reset-14": "A short loop: check the signal, downshift the body, and close the day without overchecking.",
  "pelvic-floor-starter": "Keep the work gentle and consistent. Comfort matters more than intensity.",
  "clarity-baseline-7": "Collect a few calm signals and keep the next action small.",
  "sleep-environment-reset": "Make recovery easier tonight with one room cue and one wind-down signal.",
  "conservative-recovery": "Stay light today: track clearly, reduce intensity, and avoid chasing a result.",
};

const planSummariesRu: Record<string, string> = {
  "confidence-reset-14": "Небольшой цикл на день: заметить сигнал, сбавить напряжение и закрыть день без перепроверок.",
  "pelvic-floor-starter": "Мягко и регулярно. Комфорт важнее интенсивности.",
  "clarity-baseline-7": "Соберите несколько спокойных сигналов и держите следующий шаг маленьким.",
  "sleep-environment-reset": "Сегодня упрощаем восстановление: один сигнал для комнаты и один спокойный переход ко сну.",
  "conservative-recovery": "Сегодня легче: ясный трекинг, меньше интенсивности и без гонки за результатом.",
};

const copies: Record<AppLanguage, LanguageCopy> = {
  en: {
    common: {
      language: "Language",
      back: "Back",
      next: "Next",
      yes: "Yes",
      no: "No",
      notNow: "Not now",
      useEnglish: "Use English",
      useRussian: "Use Russian",
      minutes: (count) => `${count} min`,
    },
    onboarding: {
      heroEyebrow: "Private by design",
      heroTitle: "A calm daily coach for recovery, confidence, and tracking.",
      heroBody: "Start with a light baseline. The app explains patterns, supports routines, and keeps sensitive details discreet.",
      beforeTitle: "Before you start",
      beforeLine1: "This is educational tracking support. It does not diagnose, treat, or replace urgent care.",
      beforeLine2: "You control what gets logged. Sensitive sections can stay behind a vault lock later.",
      start: "Start privately",
      stepOneEyebrow: "Step 1 of 4",
      stepOneTitle: "Choose the main focus.",
      stepOneBody: "This sets the first program and the first Today priority.",
      stepTwoEyebrow: "Step 2 of 4",
      stepTwoTitle: "Set a simple baseline.",
      stepTwoBody: "Use a rough starting point. You can refine it with quick logs later.",
      stepThreeEyebrow: "Step 3 of 4",
      stepThreeTitle: "Choose operating style.",
      stepThreeBody: "Simple keeps Today lighter. Pro adds more detail once you want it.",
      generateToday: "Generate Today",
      goals: {
        sexual_confidence: "Confidence",
        pelvic_floor: "Pelvic floor",
        recovery: "Recovery",
        sleep_environment: "Sleep setup",
      },
      baselines: {
        low: "Low energy / high stress",
        mixed: "Mixed signals",
        stable: "Mostly stable",
      },
      modes: {
        Simple: "Simple mode",
        Pro: "Pro mode",
      },
      conservative: "Use conservative guidance",
    },
    nav: {
      labels: {
        Today: "Today",
        Track: "Track",
        Learn: "Learn",
        Programs: "Programs",
        Coach: "Coach",
        Settings: "Settings",
      },
      openLabels: {
        Today: "Open Today",
        Track: "Open Track",
        Learn: "Open Learn",
        Programs: "Open Programs",
        Coach: "Open Coach",
        Settings: "Open Settings",
      },
    },
    today: {
      title: "Today",
      noActiveProgram: "No active program",
      actionKinds: {
        Learn: "Learn",
        "Check-in": "Check-in",
        Practice: "Practice",
        Reflect: "Reflect",
      },
      currentPriority: "Current priority",
      confidence: (level) => `${level} confidence`,
      askCoachWhy: "Ask Coach why",
      quickLog: "Quick log",
      liveUpdate: "Live update",
      insight: "Insight",
      status: {
        labels: {
          mode: "Mode",
          sync: "Sync",
          privacy: "Privacy",
          program: "Program",
        },
        modes: {
          Light: "Light",
          Standard: "Standard",
          Focus: "Focus",
        },
        sync: {
          synced: "Up to date",
          pending: "Pending sync",
          offline: "Offline",
        },
        privacy: {
          vaultOn: "Vault on",
          discreet: "Discreet",
          standard: "Standard",
        },
      },
    },
    track: {
      title: "Track",
      subtitle: "Fast manual logging, built for low friction.",
      snapshotTitle: "Baseline snapshot",
      snapshotCounts: (logsToday, logsThisWeek) => `${logsToday} today - ${logsThisWeek} last 7 days`,
      noTrendYet: "No trend yet. A few calm logs will make this useful.",
      scoreDetail: (average, latest) => `Average ${average}/10 - latest ${latest}/10`,
      noScoreData: "No data yet",
      weeklySnapshotTitle: "Weekly snapshot",
      weeklySnapshotBody: "A cautious seven-day view. It shows signals, not causes.",
      weeklyAverage: (average) => `${average}/10 avg`,
      weeklyScoreMeta: (count, status) => `${count} ${count === 1 ? "log" : "logs"} - ${status}`,
      weeklySymptomValue: (count) => `${count} ${count === 1 ? "check-in" : "check-ins"}`,
      weeklySymptomMeta: (status) => status,
      weeklyStatusLabels: {
        no_data: "No data yet",
        low_data: "Needs more data",
        steady: "Steady",
        changed: "Changed",
        caution: "Caution signal",
      },
      patternHintsTitle: "Pattern hints",
      patternHintsBody: "Gentle notes from paired logs. Use them as prompts to watch, not proof.",
      patternHintLabels: {
        sleep_energy: "Sleep and energy",
        sleep_confidence: "Sleep and confidence",
        confidence_libido: "Confidence and libido",
        low_data: "More paired logs needed",
      },
      patternDirectionLabels: {
        together: "in the same direction",
        opposite: "in different directions",
        unknown: "without a clear direction",
      },
      patternConfidenceLabels: {
        low: "low confidence",
        medium: "medium confidence",
      },
      patternHintObservedBody: (direction) =>
        `These signals moved ${direction} on paired days. Use this as a note to watch.`,
      patternHintLowDataBody: "Need more paired logs before this section can say anything useful.",
      patternHintMeta: (pairedDays, confidence) => `${pairedDays} paired days - ${confidence}`,
      safetyNoteTitle: "Safety note",
      safetyNoteBody: "A recent symptom log has a caution signal. Keep tracking conservative and avoid intense protocols today.",
      syncQueue: "Sync queue",
      pendingWrites: (count) => `${count} pending local write${count === 1 ? "" : "s"}`,
      synced: "All local writes are synced.",
      syncAction: "Sync demo writes",
      programReviewTitle: "Program review",
      programReviewBody: "A compact read of recent finished cycles, separate from daily logs.",
      recentLogs: "Recent logs",
      filterTitle: "Filter history",
      filterLabels: {
        all: "All",
        scores: "Scores",
        symptoms: "Symptoms",
        routines: "Routines",
      },
      noLogs: "No logs yet. Add one signal and Today will update.",
      noFilteredLogs: "No logs for this filter yet.",
      editAction: "Edit",
      deleteAction: "Delete",
      editLog: (label) => `Edit ${label} log`,
      deleteLog: (label) => `Delete ${label} log`,
      exportTitle: "Data export",
      exportBody: "Prepare a local JSON preview for the currently filtered history.",
      exportAction: "Prepare JSON export",
      exportReady: (count) => `Export ready: ${count} log${count === 1 ? "" : "s"}`,
      allClear: "All clear",
    },
    learn: {
      title: "Learn",
      subtitle: "Curated material tied to the current state, not a random link library.",
      recommended: "Recommended for today",
      allContent: "All content",
      categories: "Categories",
      categoryLabels: {
        all: "All",
        baseline: "Baseline",
        recovery: "Recovery",
        sleep: "Sleep",
        pelvic_floor: "Pelvic floor",
        confidence: "Confidence",
        tracking: "Tracking",
        safety: "Safety",
        privacy: "Privacy",
        general: "General",
      },
      openDetail: (title) => `Open ${title}`,
      filterCategory: (label) => `Filter Learn content: ${label}`,
      backToLibrary: "Back to library",
      detailMeta: (duration, source) => `${duration} - ${source}`,
      recommendedReason: {
        priority: "Because it matches today's priority",
        program: "Because it supports your active program",
        safety: "A conservative safety read for today",
        starter: "A useful starter read for low-data days",
      },
      noCategoryItems: "No reads in this category yet.",
      save: "Save",
      saved: "Saved",
      unsave: "Unsave",
      markComplete: "Mark complete",
      completed: "Completed",
    },
    programs: {
      title: "Programs",
      subtitle: "Guided plans stay conservative until there is enough signal.",
      programTitles: programTitlesEn,
      active: "Active",
      noActiveProgram: "No active program",
      noActiveDay: "No active day",
      dayOf: (day, total) => `Day ${day} of ${total}`,
      percentComplete: (percent) => `${percent}% complete`,
      completeToday: "Complete today",
      completeProgramDay: "Complete program day",
      restToday: "Take rest day",
      restProgramDay: "Take a program rest day",
      skipToday: "Skip today",
      skipProgramDay: "Skip program day",
      pauseProgram: "Pause program",
      resumeProgram: "Resume program",
      completedDays: (count) => `${count} completed`,
      restDays: (count) => `${count} rest`,
      skippedDays: (count) => `${count} skipped`,
      remainingDays: (count) => `${count} left`,
      phaseLabels: {
        baseline: "Baseline day",
        practice: "Practice day",
        recovery: "Recovery day",
      },
      nextCandidates: "Next candidates",
      recommendedNextPaths: "Recommended next paths",
      candidates: ["Pelvic floor consistency starter", "Sleep and environment reset", "Confidence reset"],
      nextPathIntro: {
        steady_finish: "You closed this cycle cleanly. The next move can stay structured and light.",
        mixed_finish: "Use the useful signal, then return to a calmer base before adding more intensity.",
        recovery_finish: "Recent caution signals still point the next step toward comfort-first paths.",
      },
      nextPathPriorityLabels: {
        primary: "Start here",
        secondary: "Also fits",
      },
      nextPathReasons: {
        baseline_rebuild: "A short baseline loop can rebuild signal without pressure.",
        sleep_support: "Sleep and recovery support can make the next cycle easier to sustain.",
        body_consistency: "A gentle consistency block can reinforce what held up without chasing volume.",
        confidence_layer: "A light confidence loop keeps structure without jumping intensity.",
        recovery_guardrail: "Recovery mode protects comfort while the signal stays cautious.",
      },
      startProgram: "Start this program",
      startRecommendedProgram: (title) => `Start ${title}`,
      historyTitle: "Recent cycles",
      historyBody: "Finished programs stay here after you move into the next cycle.",
      historyContinuedWith: (title) => `Continued with: ${title}`,
      reviewTitle: "Cycle review",
      reviewBody: "A quick read across your recent finished programs.",
      reviewFocuses: {
        build_on_stability: "Recent cycles look steadier. The next block can build on consistency without chasing volume.",
        rebuild_with_short_cycles: "Recent cycles suggest shorter, calmer rebuilds are still the better fit than pushing intensity.",
        protect_recovery: "Recent history still leans toward recovery-first guardrails before adding anything more demanding.",
      },
      reviewTrendTitle: "Recent direction",
      reviewTrendLabels: {
        toward_stability: "The recent sequence is trending toward steadier finishes.",
        holding_pattern: "The recent sequence is holding a mixed pattern rather than clearly improving or worsening.",
        toward_recovery: "The recent sequence is drifting toward more cautious recovery-heavy finishes.",
      },
      reviewTotals: (cycles, completed, rest, skipped) =>
        `${cycles} cycle${cycles === 1 ? "" : "s"} tracked - ${completed} completed, ${rest} rest, ${skipped} skipped.`,
      reviewLatest: (title) => `Latest completed cycle: ${title}`,
      dayPlanTitle: "Today's plan",
      pausedTitle: "Program paused for now",
      pausedBody: "The current day is kept in place. Resume when you want to continue without losing context.",
      openDetail: "Open plan details",
      backToPrograms: "Back to program",
      detailOverview: "Plan details",
      detailSummaryTitle: "Progress summary",
      detailLabels: {
        status: "Status",
        focus: "Focus",
        pace: "Pace",
        stage: "Stage",
      },
      detailChecklistStates: {
        not_started: "Not started",
        in_progress: "In progress",
        done: "Done for today",
        rest_day: "Rest day",
      },
      detailFocusLabels: {
        observe: "Observe first",
        practice: "Practice lightly",
        recover: "Recover first",
      },
      detailPaceLabels: {
        light: "Keep it light",
        steady: "Steady pace",
        downshift: "Downshift day",
      },
      detailCompletionBands: {
        starting: "Starting point",
        building: "Building consistency",
        closing: "Final stretch",
        complete: "Program complete",
      },
      detailConservativeNotes: {
        light: "Start with observation and one calm action. There is no need to force volume today.",
        steady: "Keep the work small and repeatable. Stop before strain so the plan stays sustainable.",
        downshift: "Use today to reduce intensity, protect comfort, and keep the next step conservative.",
      },
      detailNextMilestone: (day) => `Next milestone: day ${day}`,
      detailFinalMilestone: "This is the final scheduled day in the current program.",
      adjustmentTitle: "Adjustment for today",
      adjustmentKinds: {
        downshift: "Downshift the plan",
        recovery: "Keep the plan light",
        baseline: "Start small",
        steady: "Stay with the current pace",
        closeout: "Close the program gently",
      },
      adjustmentBodies: {
        downshift: "Today's signals point to a lighter version of the program.",
        recovery: "The rules are leaning toward recovery, so the plan should stay small and repeatable.",
        baseline: "There still is not enough signal for intensity. Use the plan to observe, not to prove anything.",
        steady: "No caution signal is asking for a bigger change. Keep the plan consistent and stop before strain.",
        closeout: "You are at the end of the current plan. Finish neatly instead of adding extra work.",
      },
      adjustmentReason: (reason) => `Based on: ${reason}`,
      adjustmentAvoid: (text) => `Avoid today: ${text}`,
      adjustmentTarget: (count) =>
        count <= 0 ? "No more tasks needed today." : count === 1 ? "Aim for at most one more task today." : `Aim for up to ${count} more tasks, then stop.`,
      adjustmentNextStepTitle: "Next conservative step",
      adjustmentNextSteps: {
        take_rest_day: "Use the rest-day button and let the program stay light today.",
        keep_one_task: "Pick the smallest remaining task and leave the rest for later.",
        start_with_check_in: "Start with the check-in task and wait for the next signal before adding more.",
        close_day_gently: "Finish the current task if needed, then close the day without adding extras.",
        review_boundary: "Close the day and note one boundary to keep the next step conservative.",
      },
      completionTitle: "Program wrap-up",
      completionStates: {
        steady_finish: "A steady finish",
        mixed_finish: "A mixed but useful finish",
        recovery_finish: "Finish in recovery mode",
      },
      completionBodies: {
        steady_finish: "The cycle is closed. Keep the next step measured instead of stacking extra work onto a good finish.",
        mixed_finish: "This cycle still produced useful signal. Use the pattern, then rebuild from a light baseline instead of judging the misses.",
        recovery_finish: "The cycle is complete, but the recent signals still call for a conservative recovery window before anything more demanding.",
      },
      completionReason: (reason) => `Finish context: ${reason}`,
      completionReview: (completed, rest, skipped) => `Completed ${completed}, rest ${rest}, skipped ${skipped}.`,
      completionNextStepTitle: "Conservative next step",
      completionNextSteps: {
        choose_next_light: "Review the cycle, then start the next program only if you can keep the opening days light.",
        rebuild_baseline: "Take the useful signal from this cycle and spend a few days rebuilding baseline before choosing intensity.",
        keep_recovery_light: "Stay in recovery mode for now and keep the next few days focused on comfort, not progression.",
      },
      taskProgress: (done, total) => `${done} of ${total} done`,
      markTaskDone: (title) => `Mark ${title} done`,
      markTaskOpen: (title) => `Reopen ${title}`,
      taskDone: "Done",
      taskOpen: "Mark done",
      taskTitles: taskTitlesEn,
      taskDescriptions: taskDescriptionsEn,
      planSummaries: planSummariesEn,
    },
    coach: {
      title: "Coach",
      subtitle: "Rules-first explanations. No fake diagnosis, no inflated certainty.",
      whyPriority: "Why this priority?",
      certainty: "How certain is this?",
      keepLight: "Keep light today",
      boundary: "Boundary",
      quickQuestions: "Quick questions",
      openQuestion: (title) => `Open coach question: ${title}`,
      nextStep: "Next step",
    },
    settings: {
      title: "Settings",
      subtitle: "Privacy controls and discreet product behavior.",
      languageTitle: "Language",
      languageBody: "Choose the language for the app shell, Today guidance, quick logs, and coach explanations.",
      privacyVault: "Privacy vault",
      vaultStatus: (vaultEnabled, discreetEnabled) =>
        `Vault lock is ${vaultEnabled ? "enabled" : "off"}. Discreet notifications are ${discreetEnabled ? "enabled" : "off"}.`,
      turnVaultOff: "Turn vault lock off",
      turnVaultOn: "Turn vault lock on",
      vaultOn: "Vault lock on",
      vaultOff: "Vault lock off",
      lockDemoVault: "Lock demo vault",
      pinTitle: "PIN unlock",
      pinBody: "Set a 4-8 digit local demo PIN before locking the vault. This keeps the flow realistic while production secure storage is still later.",
      pinPlaceholder: "Enter 4-8 digits",
      savePin: "Save PIN",
      updatePin: "Update PIN",
      clearPin: "Remove PIN",
      pinIsSet: "PIN is set for this local demo.",
      pinNotSet: "No PIN is set yet.",
      autoLockTitle: "Auto-lock",
      autoLockStatus: (minutes) => `Auto-lock after ${minutes} minutes of inactivity.`,
      medicalBoundary: "Medical boundary",
      medicalBoundaryBody: "This app supports education and tracking. It does not diagnose or replace professional care.",
      reset: "Reset local demo state",
    },
    privacyLock: {
      eyebrow: "Private session",
      title: "Soft is locked",
      body: "Sensitive details are hidden until you unlock the demo vault.",
      unlock: "Unlock demo vault",
      pinPrompt: "Enter your local demo PIN.",
      pinPlaceholder: "PIN",
      unlockWithPin: "Unlock with PIN",
      wrongPin: "That PIN did not match. Try again calmly.",
    },
    quickLog: {
      labels: quickLogLabelsEn,
      subtitle: "Log it quickly. You can add detail later if it matters.",
      saveLabel: (label, option) => `Save ${label} ${option}`,
    },
  },
  ru: {
    common: {
      language: "Язык",
      back: "Назад",
      next: "Дальше",
      yes: "Да",
      no: "Нет",
      notNow: "Не сейчас",
      useEnglish: "Использовать английский",
      useRussian: "Использовать русский",
      minutes: (count) => `${count} мин`,
    },
    onboarding: {
      heroEyebrow: "Приватно по умолчанию",
      heroTitle: "Спокойный ежедневный коуч для восстановления, уверенности и наблюдения за собой.",
      heroBody: "Начните с легкой базовой линии. Приложение помогает замечать закономерности, поддерживать рутину и держать личные детали в тишине.",
      beforeTitle: "Перед началом",
      beforeLine1: "Это образовательная поддержка для наблюдения за собой. Она не ставит диагнозы, не лечит и не заменяет срочную помощь.",
      beforeLine2: "Вы сами решаете, что записывать. Чувствительные разделы можно держать под приватным замком.",
      start: "Начать спокойно",
      stepOneEyebrow: "Шаг 1 из 4",
      stepOneTitle: "Выберите главный фокус.",
      stepOneBody: "Так мы подберем первую программу и главный приоритет на сегодня.",
      stepTwoEyebrow: "Шаг 2 из 4",
      stepTwoTitle: "Задайте простую стартовую точку.",
      stepTwoBody: "Это не оценка и не диагноз. Просто ориентир, который потом уточнят быстрые логи.",
      stepThreeEyebrow: "Шаг 3 из 4",
      stepThreeTitle: "Выберите темп.",
      stepThreeBody: "Simple оставляет только самое важное. Pro добавит больше деталей, когда они понадобятся.",
      generateToday: "Собрать день",
      goals: {
        sexual_confidence: "Уверенность",
        pelvic_floor: "Тазовое дно",
        recovery: "Восстановление",
        sleep_environment: "Сон",
      },
      baselines: {
        low: "Мало энергии / много стресса",
        mixed: "Сигналы смешанные",
        stable: "В целом стабильно",
      },
      modes: {
        Simple: "Simple",
        Pro: "Pro",
      },
      conservative: "Держать рекомендации осторожными",
    },
    nav: {
      labels: {
        Today: "Сегодня",
        Track: "Трек",
        Learn: "База",
        Programs: "План",
        Coach: "Коуч",
        Settings: "Настройки",
      },
      openLabels: {
        Today: "Открыть Сегодня",
        Track: "Открыть Трек",
        Learn: "Открыть Базу",
        Programs: "Открыть План",
        Coach: "Открыть Коуча",
        Settings: "Открыть Настройки",
      },
    },
    today: {
      title: "Сегодня",
      noActiveProgram: "Активной программы пока нет",
      actionKinds: {
        Learn: "База",
        "Check-in": "Чек-ин",
        Practice: "Практика",
        Reflect: "Заметка",
      },
      currentPriority: "Главный фокус",
      confidence: (level) => `уверенность: ${confidenceLabel(level, "ru")}`,
      askCoachWhy: "Почему так?",
      quickLog: "Быстрый лог",
      liveUpdate: "Обновление",
      insight: "Наблюдение",
      status: {
        labels: {
          mode: "Режим",
          sync: "Синхронизация",
          privacy: "Приватность",
          program: "План",
        },
        modes: {
          Light: "Лёгкий",
          Standard: "Обычный",
          Focus: "Фокус",
        },
        sync: {
          synced: "Всё сохранено",
          pending: "Ждёт синхронизации",
          offline: "Офлайн",
        },
        privacy: {
          vaultOn: "Замок включён",
          discreet: "Незаметно",
          standard: "Обычно",
        },
      },
    },
    track: {
      title: "Трек",
      subtitle: "Быстрые записи без лишнего шума.",
      snapshotTitle: "Снимок базовой линии",
      snapshotCounts: (logsToday, logsThisWeek) => `${logsToday} сегодня - ${logsThisWeek} за 7 дней`,
      noTrendYet: "Тренда пока нет. Несколько спокойных записей уже дадут больше ясности.",
      scoreDetail: (average, latest) => `среднее ${average}/10 - последнее ${latest}/10`,
      noScoreData: "Пока нет данных",
      weeklySnapshotTitle: "Неделя в сигналах",
      weeklySnapshotBody: "Осторожный взгляд за 7 дней: здесь видны сигналы, а не причины.",
      weeklyAverage: (average) => `${average}/10 в среднем`,
      weeklyScoreMeta: (count, status) => `${count} ${russianLogWord(count)} - ${status}`,
      weeklySymptomValue: (count) => `${count} ${russianCheckinWord(count)}`,
      weeklySymptomMeta: (status) => status,
      weeklyStatusLabels: {
        no_data: "Пока нет данных",
        low_data: "Нужно больше данных",
        steady: "Ровно",
        changed: "Есть изменение",
        caution: "Осторожный сигнал",
      },
      patternHintsTitle: "Подсказки по паттернам",
      patternHintsBody: "Мягкие заметки по парным логам. Это повод наблюдать, а не доказательство.",
      patternHintLabels: {
        sleep_energy: "Сон и энергия",
        sleep_confidence: "Сон и уверенность",
        confidence_libido: "Уверенность и либидо",
        low_data: "Нужно больше парных логов",
      },
      patternDirectionLabels: {
        together: "в одну сторону",
        opposite: "в разные стороны",
        unknown: "без ясного направления",
      },
      patternConfidenceLabels: {
        low: "низкая уверенность",
        medium: "средняя уверенность",
      },
      patternHintObservedBody: (direction) =>
        `Эти два сигнала двигались ${direction} в дни, где были оба лога. Считайте это спокойной заметкой для наблюдения.`,
      patternHintLowDataBody: "Нужно больше парных логов, прежде чем здесь появится полезная подсказка.",
      patternHintMeta: (pairedDays, confidence) => `${pairedDays} ${russianPairedDayWord(pairedDays)} - ${confidence}`,
      safetyNoteTitle: "Осторожный сигнал",
      safetyNoteBody: "В недавнем логе есть симптом, с которым лучше не повышать интенсивность. Сегодня держим план мягким.",
      syncQueue: "Локальная очередь",
      pendingWrites: (count) => `${count} записей ждут синхронизации`,
      synced: "Все локальные записи синхронизированы.",
      syncAction: "Синхронизировать демо-записи",
      programReviewTitle: "Обзор программ",
      programReviewBody: "Короткий вывод по последним завершенным циклам отдельно от ежедневных логов.",
      recentLogs: "Последние записи",
      filterTitle: "Фильтр истории",
      filterLabels: {
        all: "Все",
        scores: "Оценки",
        symptoms: "Симптомы",
        routines: "Рутины",
      },
      noLogs: "Записей пока нет. Добавьте один сигнал, и Today обновится.",
      noFilteredLogs: "В этом фильтре пока пусто.",
      editAction: "Изменить",
      deleteAction: "Удалить",
      editLog: (label) => `Изменить запись: ${label}`,
      deleteLog: (label) => `Удалить запись: ${label}`,
      exportTitle: "Экспорт данных",
      exportBody: "Подготовьте локальный JSON для выбранной части истории.",
      exportAction: "Подготовить JSON",
      exportReady: (count) => `Готово к экспорту: ${count} ${russianLogWord(count)}`,
      allClear: "Все спокойно",
    },
    learn: {
      title: "База",
      subtitle: "Короткие материалы по текущему состоянию, без случайной ленты ссылок.",
      recommended: "Подходит на сегодня",
      allContent: "Все материалы",
      categories: "Темы",
      categoryLabels: {
        all: "Все",
        baseline: "Базовая линия",
        recovery: "Восстановление",
        sleep: "Сон",
        pelvic_floor: "Тазовое дно",
        confidence: "Уверенность",
        tracking: "Наблюдение",
        safety: "Безопасность",
        privacy: "Приватность",
        general: "Общее",
      },
      openDetail: (title) => `Открыть: ${title}`,
      filterCategory: (label) => `Фильтр базы: ${label}`,
      backToLibrary: "Вернуться к базе",
      detailMeta: (duration, source) => `${duration} - ${source}`,
      recommendedReason: {
        priority: "Это совпадает с главным фокусом на сегодня",
        program: "Это поддерживает текущую программу",
        safety: "Спокойный материал, чтобы не повышать нагрузку лишний раз",
        starter: "Хороший старт, пока данных еще мало",
      },
      noCategoryItems: "В этой теме пока нет материалов.",
      save: "Сохранить",
      saved: "Сохранено",
      unsave: "Убрать",
      markComplete: "Отметить как прочитанное",
      completed: "Готово",
    },
    programs: {
      title: "План",
      subtitle: "Мягкие шаги на день. Без гонки, давления и обещаний результата.",
      programTitles: programTitlesRu,
      active: "Активная программа",
      noActiveProgram: "Активной программы пока нет",
      noActiveDay: "Нет активного дня",
      dayOf: (day, total) => `День ${day} из ${total}`,
      percentComplete: (percent) => `${percent}% завершено`,
      completeToday: "Закрыть день",
      completeProgramDay: "Завершить день программы",
      restToday: "День полегче",
      restProgramDay: "Отметить день полегче",
      skipToday: "Пропустить сегодня",
      skipProgramDay: "Пропустить день программы",
      pauseProgram: "Поставить на паузу",
      resumeProgram: "Продолжить программу",
      completedDays: (count) => `${count} ${russianDayWord(count)} сделано`,
      restDays: (count) => `${count} ${russianDayWord(count)} полегче`,
      skippedDays: (count) => `${count} ${russianDayWord(count)} пропущено`,
      remainingDays: (count) => `${count} ${russianDayWord(count)} осталось`,
      phaseLabels: {
        baseline: "День наблюдения",
        practice: "День практики",
        recovery: "День восстановления",
      },
      nextCandidates: "Что можно добавить позже",
      recommendedNextPaths: "Что выбрать дальше",
      candidates: ["Мягкая регулярность для тазового дна", "Сон и восстановление", "Спокойная уверенность"],
      nextPathIntro: {
        steady_finish: "Цикл закрыт ровно. Дальше лучше выбрать такой же спокойный, но структурный шаг.",
        mixed_finish: "Полезный сигнал уже есть. Дальше лучше вернуться к более спокойной базе, чем сразу повышать нагрузку.",
        recovery_finish: "Последние сигналы все еще про осторожность, поэтому следующий шаг лучше оставить в режиме комфорта и восстановления.",
      },
      nextPathPriorityLabels: {
        primary: "Начать с этого",
        secondary: "Также подойдет",
      },
      nextPathReasons: {
        baseline_rebuild: "Короткая базовая программа поможет снова собрать сигнал без лишнего давления.",
        sleep_support: "Поддержка сна и восстановления сделает следующий цикл устойчивее.",
        body_consistency: "Мягкая работа на регулярность укрепит ритм без попытки взять объемом.",
        confidence_layer: "Спокойный цикл на уверенность добавит структуры, не разгоняя интенсивность.",
        recovery_guardrail: "Режим восстановления помогает сохранить комфорт, пока сигналы остаются осторожными.",
      },
      startProgram: "Запустить программу",
      startRecommendedProgram: (title) => `Запустить программу: ${title}`,
      historyTitle: "Недавние циклы",
      historyBody: "Завершенные программы остаются здесь после перехода в следующий цикл.",
      historyContinuedWith: (title) => `Дальше перешел в: ${title}`,
      reviewTitle: "Обзор циклов",
      reviewBody: "Короткий вывод по последним завершенным программам.",
      reviewFocuses: {
        build_on_stability: "Последние циклы выглядят ровнее. Следующий этап можно строить на регулярности, не повышая нагрузку слишком быстро.",
        rebuild_with_short_cycles: "Последние циклы подсказывают, что пока лучше работают короткие и спокойные перезапуски, а не попытка давить интенсивностью.",
        protect_recovery: "Последняя история все еще смещена в сторону восстановления, поэтому и следующий шаг лучше держать в более щадящем режиме.",
      },
      reviewTrendTitle: "Последнее направление",
      reviewTrendLabels: {
        toward_stability: "Последняя последовательность циклов движется к более ровным завершениям.",
        holding_pattern: "Последние циклы пока держатся в смешанном паттерне без явного движения в лучшую или более осторожную сторону.",
        toward_recovery: "Последняя последовательность циклов смещается в сторону более осторожных восстановительных завершений.",
      },
      reviewTotals: (cycles, completed, rest, skipped) =>
        `${cycles} ${russianCycleWord(cycles)} в истории - сделано ${completed}, дней полегче ${rest}, пропущено ${skipped}.`,
      reviewLatest: (title) => `Последний завершенный цикл: ${title}`,
      dayPlanTitle: "План на сегодня",
      pausedTitle: "Программа пока на паузе",
      pausedBody: "Текущий день сохранен на месте. Можно спокойно вернуться к нему позже без потери контекста.",
      openDetail: "Открыть детали плана",
      backToPrograms: "Назад к программе",
      detailOverview: "Детали плана",
      detailSummaryTitle: "Сводка по прогрессу",
      detailLabels: {
        status: "Статус",
        focus: "Фокус",
        pace: "Темп",
        stage: "Этап",
      },
      detailChecklistStates: {
        not_started: "Еще не начато",
        in_progress: "В процессе",
        done: "На сегодня закрыто",
        rest_day: "День полегче",
      },
      detailFocusLabels: {
        observe: "Сначала наблюдение",
        practice: "Мягкая практика",
        recover: "Сначала восстановление",
      },
      detailPaceLabels: {
        light: "Легкий темп",
        steady: "Ровный темп",
        downshift: "День на снижение нагрузки",
      },
      detailCompletionBands: {
        starting: "Старт",
        building: "Наращивание ритма",
        closing: "Финальный отрезок",
        complete: "Программа завершена",
      },
      detailConservativeNotes: {
        light: "Начни с наблюдения и одного спокойного шага. Сегодня не нужно брать объемом.",
        steady: "Держи нагрузку небольшой и повторяемой. Лучше остановиться раньше, чем уйти в напряжение.",
        downshift: "Сегодня задача — снизить нагрузку, сохранить комфорт и оставить следующий шаг осторожным.",
      },
      detailNextMilestone: (day) => `Следующий рубеж: день ${day}`,
      detailFinalMilestone: "Это последний запланированный день текущей программы.",
      adjustmentTitle: "Корректировка на сегодня",
      adjustmentKinds: {
        downshift: "Снизить нагрузку",
        recovery: "Оставить план легким",
        baseline: "Начать с малого",
        steady: "Сохранить текущий темп",
        closeout: "Спокойно завершить цикл",
      },
      adjustmentBodies: {
        downshift: "Текущие сигналы просят упростить программу и не продавливать день через силу.",
        recovery: "По правилам сегодня приоритет у восстановления, поэтому план лучше оставить коротким и щадящим.",
        baseline: "Данных пока мало для более смелого шага. Сегодня задача — спокойно собрать сигнал, а не что-то себе доказывать.",
        steady: "Сигналов на резкую смену плана нет. Можно держать ритм, но лучше остановиться чуть раньше, чем перегрузить день.",
        closeout: "Это финальный отрезок текущего плана. Лучше аккуратно закрыть цикл, чем добавлять лишнюю нагрузку.",
      },
      adjustmentReason: (reason) => `Опора на сигнал: ${reason}`,
      adjustmentAvoid: (text) => `Сегодня лучше не делать так: ${text}`,
      adjustmentTarget: (count) =>
        count <= 0
          ? "На сегодня задач уже достаточно."
          : count === 1
            ? "Если продолжать, то максимум одна небольшая задача."
            : `Если продолжать, остановись после ${count} задач.`,
      adjustmentNextStepTitle: "Следующий осторожный шаг",
      adjustmentNextSteps: {
        take_rest_day: "Нажми на день полегче и не добавляй сегодня новых задач.",
        keep_one_task: "Выбери самую небольшую оставшуюся задачу, а остальное оставь на потом.",
        start_with_check_in: "Начни с чек-ина и посмотри на следующий сигнал, прежде чем добавлять что-то еще.",
        close_day_gently: "Если нужно, доведи текущую задачу и спокойно закрой день без добавочной нагрузки.",
        review_boundary: "Закрой день и отметь одну границу, которая поможет сохранить следующий шаг спокойным.",
      },
      completionTitle: "Итог программы",
      completionStates: {
        steady_finish: "Ровное завершение",
        mixed_finish: "Неровное, но полезное завершение",
        recovery_finish: "Завершение в режиме восстановления",
      },
      completionBodies: {
        steady_finish: "Цикл закрыт. Лучше сохранить этот спокойный темп, чем сразу навешивать на себя лишнюю нагрузку.",
        mixed_finish: "Даже такой цикл дал полезные сигналы. Возьми из него то, что сработало, и спокойно вернись к базовой линии без самокритики.",
        recovery_finish: "Цикл завершен, но последние сигналы все еще просят осторожности. Следующий шаг лучше оставить в режиме восстановления.",
      },
      completionReason: (reason) => `Контекст завершения: ${reason}`,
      completionReview: (completed, rest, skipped) => `Сделано ${completed}, дней полегче ${rest}, пропущено ${skipped}.`,
      completionNextStepTitle: "Следующий осторожный шаг",
      completionNextSteps: {
        choose_next_light: "Посмотри на итог цикла и переходи к следующей программе только если можешь начать ее мягко.",
        rebuild_baseline: "Возьми полезный сигнал из этого цикла и несколько дней спокойно восстанови базовую линию перед новым усилением.",
        keep_recovery_light: "Пока лучше остаться в режиме восстановления и посвятить ближайшие дни комфорту, а не прогрессии.",
      },
      taskProgress: (done, total) => `${done} из ${total} уже сделано`,
      markTaskDone: (title) => `Отметить: ${title}`,
      markTaskOpen: (title) => `Вернуть: ${title}`,
      taskDone: "Сделано",
      taskOpen: "Отметить",
      taskTitles: taskTitlesRu,
      taskDescriptions: taskDescriptionsRu,
      planSummaries: planSummariesRu,
    },
    coach: {
      title: "Коуч",
      subtitle: "Объяснения на правилах: спокойно, честно, без диагнозов и лишней уверенности.",
      whyPriority: "Почему этот фокус?",
      certainty: "Насколько этому можно доверять?",
      keepLight: "Сегодня мягче",
      boundary: "Граница",
      quickQuestions: "Быстрые вопросы",
      openQuestion: (title) => `Открыть вопрос коуча: ${title}`,
      nextStep: "Мягкий следующий шаг",
    },
    settings: {
      title: "Настройки",
      subtitle: "Приватность, язык и спокойное поведение приложения.",
      languageTitle: "Язык",
      languageBody: "Язык меняет интерфейс, быстрые логи, объяснения коуча и текст рекомендаций.",
      privacyVault: "Приватный замок",
      vaultStatus: (vaultEnabled, discreetEnabled) =>
        `Замок ${vaultEnabled ? "включен" : "выключен"}. Незаметные уведомления ${discreetEnabled ? "включены" : "выключены"}.`,
      turnVaultOff: "Выключить замок",
      turnVaultOn: "Включить замок",
      vaultOn: "Замок включен",
      vaultOff: "Замок выключен",
      lockDemoVault: "Закрыть демо-замок",
      pinTitle: "Открытие по PIN",
      pinBody: "Задайте локальный демо-PIN из 4-8 цифр перед закрытием замка. Так сценарий ближе к настоящему приложению, а защищенное хранилище добавим позже.",
      pinPlaceholder: "Введите 4-8 цифр",
      savePin: "Сохранить PIN",
      updatePin: "Обновить PIN",
      clearPin: "Убрать PIN",
      pinIsSet: "PIN задан для этого локального демо.",
      pinNotSet: "PIN пока не задан.",
      autoLockTitle: "Автозамок",
      autoLockStatus: (minutes) => `Автозамок сработает через ${minutes} ${russianMinuteWord(minutes)} бездействия.`,
      medicalBoundary: "Медицинская граница",
      medicalBoundaryBody: "Приложение помогает учиться и наблюдать за собой. Оно не ставит диагнозы и не заменяет врача.",
      reset: "Сбросить локальное демо",
    },
    privacyLock: {
      eyebrow: "Приватная сессия",
      title: "Soft закрыт",
      body: "Личные детали скрыты, пока вы не откроете демо-замок.",
      unlock: "Открыть демо-замок",
      pinPrompt: "Введите локальный демо-PIN.",
      pinPlaceholder: "PIN",
      unlockWithPin: "Открыть по PIN",
      wrongPin: "PIN не подошел. Попробуйте еще раз спокойно.",
    },
    quickLog: {
      labels: quickLogLabelsRu,
      subtitle: "Быстро отметьте сигнал. Подробности можно добавить позже, если они действительно нужны.",
      saveLabel: (label, option) => `Сохранить ${label}: ${option}`,
    },
  },
};

export function getCopy(language: AppLanguage): LanguageCopy {
  return copies[language];
}

export function languageName(language: AppLanguage) {
  return language === "ru" ? "Русский" : "English";
}

function confidenceLabel(level: string, language: AppLanguage) {
  if (language === "ru") {
    return {
      low: "низкая",
      medium: "средняя",
      high: "высокая",
    }[level] ?? level;
  }

  return level;
}

function russianLogWord(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "записей";
  }

  if (last === 1) {
    return "запись";
  }

  if (last >= 2 && last <= 4) {
    return "записи";
  }

  return "записей";
}

function russianDayWord(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "дней";
  }

  if (last === 1) {
    return "день";
  }

  if (last >= 2 && last <= 4) {
    return "дня";
  }

  return "дней";
}

function russianMinuteWord(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "минут";
  }

  if (last === 1) {
    return "минуту";
  }

  if (last >= 2 && last <= 4) {
    return "минуты";
  }

  return "минут";
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

function russianPairedDayWord(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "парных дней";
  }

  if (last === 1) {
    return "парный день";
  }

  if (last >= 2 && last <= 4) {
    return "парных дня";
  }

  return "парных дней";
}
