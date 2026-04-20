import type { AppLanguage, QuickLogType } from "@pmhc/types";

export type LocalizedTab = "Today" | "Track" | "Learn" | "Programs" | "Coach" | "Settings";

type ActionKindCopy = Record<"Learn" | "Check-in" | "Practice" | "Reflect", string>;
type TrackFilterCopy = Record<"all" | "scores" | "symptoms" | "routines", string>;

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
  };
  track: {
    title: string;
    subtitle: string;
    snapshotTitle: string;
    snapshotCounts: (logsToday: number, logsThisWeek: number) => string;
    noTrendYet: string;
    scoreDetail: (average: number, latest: number) => string;
    noScoreData: string;
    safetyNoteTitle: string;
    safetyNoteBody: string;
    syncQueue: string;
    pendingWrites: (count: number) => string;
    synced: string;
    syncAction: string;
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
    nextCandidates: string;
    candidates: string[];
    dayPlanTitle: string;
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
    medicalBoundary: string;
    medicalBoundaryBody: string;
    reset: string;
  };
  privacyLock: {
    eyebrow: string;
    title: string;
    body: string;
    unlock: string;
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
    },
    track: {
      title: "Track",
      subtitle: "Fast manual logging, built for low friction.",
      snapshotTitle: "Baseline snapshot",
      snapshotCounts: (logsToday, logsThisWeek) => `${logsToday} today - ${logsThisWeek} last 7 days`,
      noTrendYet: "No trend yet. A few calm logs will make this useful.",
      scoreDetail: (average, latest) => `Average ${average}/10 - latest ${latest}/10`,
      noScoreData: "No data yet",
      safetyNoteTitle: "Safety note",
      safetyNoteBody: "A recent symptom log has a caution signal. Keep tracking conservative and avoid intense protocols today.",
      syncQueue: "Sync queue",
      pendingWrites: (count) => `${count} pending local write${count === 1 ? "" : "s"}`,
      synced: "All local writes are synced.",
      syncAction: "Sync demo writes",
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
      nextCandidates: "Next candidates",
      candidates: ["Pelvic floor consistency starter", "Sleep and environment reset", "Confidence reset"],
      dayPlanTitle: "Today's plan",
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
      medicalBoundary: "Medical boundary",
      medicalBoundaryBody: "This app supports education and tracking. It does not diagnose or replace professional care.",
      reset: "Reset local demo state",
    },
    privacyLock: {
      eyebrow: "Private session",
      title: "Soft is locked",
      body: "Sensitive details are hidden until you unlock the demo vault.",
      unlock: "Unlock demo vault",
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
    },
    track: {
      title: "Трек",
      subtitle: "Быстрые записи без лишнего шума.",
      snapshotTitle: "Снимок базовой линии",
      snapshotCounts: (logsToday, logsThisWeek) => `${logsToday} сегодня - ${logsThisWeek} за 7 дней`,
      noTrendYet: "Тренда пока нет. Несколько спокойных записей уже дадут больше ясности.",
      scoreDetail: (average, latest) => `среднее ${average}/10 - последнее ${latest}/10`,
      noScoreData: "Пока нет данных",
      safetyNoteTitle: "Осторожный сигнал",
      safetyNoteBody: "В недавнем логе есть симптом, с которым лучше не повышать интенсивность. Сегодня держим план мягким.",
      syncQueue: "Локальная очередь",
      pendingWrites: (count) => `${count} записей ждут синхронизации`,
      synced: "Все локальные записи синхронизированы.",
      syncAction: "Синхронизировать демо-записи",
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
      nextCandidates: "Что можно добавить позже",
      candidates: ["Мягкая регулярность для тазового дна", "Сон и восстановление", "Спокойная уверенность"],
      dayPlanTitle: "План на сегодня",
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
      medicalBoundary: "Медицинская граница",
      medicalBoundaryBody: "Приложение помогает учиться и наблюдать за собой. Оно не ставит диагнозы и не заменяет врача.",
      reset: "Сбросить локальное демо",
    },
    privacyLock: {
      eyebrow: "Приватная сессия",
      title: "Soft закрыт",
      body: "Личные детали скрыты, пока вы не откроете демо-замок.",
      unlock: "Открыть демо-замок",
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
