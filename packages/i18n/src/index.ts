import type { AppLanguage, QuickLogType } from "@pmhc/types";

export type LocalizedTab = "Today" | "Track" | "Learn" | "Programs" | "Coach" | "Settings";

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
    actionKinds: Record<"Learn" | "Check-in" | "Practice" | "Reflect", string>;
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
    noLogs: string;
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
      noLogs: "No logs yet. Add one signal and Today will update.",
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
      programTitles: {
        "confidence-reset-14": "14-day confidence reset",
        "pelvic-floor-starter": "Pelvic floor consistency starter",
        "clarity-baseline-7": "7-day clarity baseline",
        "sleep-environment-reset": "Sleep and environment reset",
        "conservative-recovery": "Conservative recovery mode",
      },
      active: "Active",
      noActiveProgram: "No active program",
      noActiveDay: "No active day",
      dayOf: (day, total) => `Day ${day} of ${total}`,
      percentComplete: (percent) => `${percent}% complete`,
      completeToday: "Complete today",
      completeProgramDay: "Complete program day",
      nextCandidates: "Next candidates",
      candidates: ["Pelvic floor consistency starter", "Sleep and environment reset", "Confidence reset"],
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
      labels: {
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
      subtitle: "Log it quickly. You can add detail later if it matters.",
      saveLabel: (label, option) => `Save ${label} ${option}`,
    },
  },
  ru: {
    common: {
      language: "Язык",
      back: "Назад",
      next: "Далее",
      yes: "Да",
      no: "Нет",
      notNow: "Не сейчас",
      useEnglish: "Использовать английский",
      useRussian: "Использовать русский",
      minutes: (count) => `${count} мин`,
    },
    onboarding: {
      heroEyebrow: "Приватно по умолчанию",
      heroTitle: "Спокойный ежедневный коуч для восстановления, уверенности и трекинга.",
      heroBody: "Начните с мягкой базовой линии. Приложение объясняет паттерны, поддерживает рутины и держит чувствительные детали незаметными.",
      beforeTitle: "Перед началом",
      beforeLine1: "Это образовательная поддержка для трекинга. Она не ставит диагнозы, не лечит и не заменяет срочную помощь.",
      beforeLine2: "Вы сами решаете, что логировать. Чувствительные разделы можно держать за приватным замком.",
      start: "Начать приватно",
      stepOneEyebrow: "Шаг 1 из 4",
      stepOneTitle: "Выберите главный фокус.",
      stepOneBody: "Это задаст первую программу и главный приоритет на Today.",
      stepTwoEyebrow: "Шаг 2 из 4",
      stepTwoTitle: "Задайте простую базовую линию.",
      stepTwoBody: "Выберите примерную стартовую точку. Позже ее можно уточнить быстрыми логами.",
      stepThreeEyebrow: "Шаг 3 из 4",
      stepThreeTitle: "Выберите стиль работы.",
      stepThreeBody: "Simple делает Today легче. Pro добавляет больше деталей, когда они нужны.",
      generateToday: "Собрать Today",
      goals: {
        sexual_confidence: "Уверенность",
        pelvic_floor: "Тазовое дно",
        recovery: "Восстановление",
        sleep_environment: "Настройка сна",
      },
      baselines: {
        low: "Мало энергии / много стресса",
        mixed: "Смешанные сигналы",
        stable: "В целом стабильно",
      },
      modes: {
        Simple: "Simple режим",
        Pro: "Pro режим",
      },
      conservative: "Использовать осторожные рекомендации",
    },
    nav: {
      labels: {
        Today: "Сегодня",
        Track: "Трек",
        Learn: "Учиться",
        Programs: "Программы",
        Coach: "Коуч",
        Settings: "Настройки",
      },
      openLabels: {
        Today: "Открыть Сегодня",
        Track: "Открыть Трек",
        Learn: "Открыть Учиться",
        Programs: "Открыть Программы",
        Coach: "Открыть Коуч",
        Settings: "Открыть Настройки",
      },
    },
    today: {
      title: "Сегодня",
      noActiveProgram: "Нет активной программы",
      actionKinds: {
        Learn: "Учиться",
        "Check-in": "Чек-ин",
        Practice: "Практика",
        Reflect: "Рефлексия",
      },
      currentPriority: "Текущий приоритет",
      confidence: (level) => `уверенность: ${confidenceLabel(level, "ru")}`,
      askCoachWhy: "Спросить коуча почему",
      quickLog: "Быстрый лог",
      liveUpdate: "Живое обновление",
      insight: "Инсайт",
    },
    track: {
      title: "Трек",
      subtitle: "Быстрое ручное логирование без лишнего трения.",
      snapshotTitle: "Снимок базовой линии",
      snapshotCounts: (logsToday, logsThisWeek) => `${logsToday} сегодня - ${logsThisWeek} за 7 дней`,
      noTrendYet: "Тренда пока нет. Несколько спокойных логов сделают это полезным.",
      scoreDetail: (average, latest) => `Среднее ${average}/10 - последнее ${latest}/10`,
      noScoreData: "Данных пока нет",
      safetyNoteTitle: "Заметка по безопасности",
      safetyNoteBody: "В недавнем симптом-логе есть осторожный сигнал. Держите трекинг консервативным и избегайте интенсивных протоколов сегодня.",
      syncQueue: "Очередь синхронизации",
      pendingWrites: (count) => `${count} локальных записей ждут синхронизации`,
      synced: "Все локальные записи синхронизированы.",
      syncAction: "Синхронизировать демо-записи",
      recentLogs: "Последние логи",
      noLogs: "Логов пока нет. Добавьте один сигнал, и Today обновится.",
    },
    learn: {
      title: "Учиться",
      subtitle: "Подборка материалов связана с текущим состоянием, а не случайной библиотекой ссылок.",
      save: "Сохранить",
      saved: "Сохранено",
      unsave: "Убрать из сохраненных",
      markComplete: "Отметить готовым",
      completed: "Готово",
    },
    programs: {
      title: "Программы",
      subtitle: "Планы остаются осторожными, пока сигналов недостаточно.",
      programTitles: {
        "confidence-reset-14": "14-дневный сброс уверенности",
        "pelvic-floor-starter": "Старт регулярности тазового дна",
        "clarity-baseline-7": "7-дневная базовая линия ясности",
        "sleep-environment-reset": "Сон и среда восстановления",
        "conservative-recovery": "Осторожный режим восстановления",
      },
      active: "Активная",
      noActiveProgram: "Нет активной программы",
      noActiveDay: "Нет активного дня",
      dayOf: (day, total) => `День ${day} из ${total}`,
      percentComplete: (percent) => `${percent}% выполнено`,
      completeToday: "Завершить сегодня",
      completeProgramDay: "Завершить день программы",
      nextCandidates: "Следующие варианты",
      candidates: ["Старт регулярности тазового дна", "Сон и среда восстановления", "Сброс уверенности"],
    },
    coach: {
      title: "Коуч",
      subtitle: "Объяснения через правила. Без псевдодиагнозов и раздутой уверенности.",
      whyPriority: "Почему этот приоритет?",
      certainty: "Насколько это уверенно?",
      keepLight: "Сегодня легче",
      boundary: "Граница",
    },
    settings: {
      title: "Настройки",
      subtitle: "Контроль приватности и незаметного поведения приложения.",
      languageTitle: "Язык",
      languageBody: "Выберите язык оболочки приложения, Today-рекомендаций, быстрых логов и объяснений коуча.",
      privacyVault: "Приватный замок",
      vaultStatus: (vaultEnabled, discreetEnabled) =>
        `Замок ${vaultEnabled ? "включен" : "выключен"}. Незаметные уведомления ${discreetEnabled ? "включены" : "выключены"}.`,
      turnVaultOff: "Выключить замок",
      turnVaultOn: "Включить замок",
      vaultOn: "Замок включен",
      vaultOff: "Замок выключен",
      lockDemoVault: "Закрыть демо-замок",
      medicalBoundary: "Медицинская граница",
      medicalBoundaryBody: "Приложение поддерживает образование и трекинг. Оно не ставит диагнозы и не заменяет врача.",
      reset: "Сбросить локальное демо",
    },
    privacyLock: {
      eyebrow: "Приватная сессия",
      title: "Soft заблокирован",
      body: "Чувствительные детали скрыты, пока вы не откроете демо-замок.",
      unlock: "Открыть демо-замок",
    },
    quickLog: {
      labels: {
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
      subtitle: "Залогируйте быстро. Детали можно добавить позже, если они важны.",
      saveLabel: (label, option) => `Сохранить ${label} ${option}`,
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
