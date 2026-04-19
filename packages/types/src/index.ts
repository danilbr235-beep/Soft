export type AppLanguage = "en" | "ru";

export type UserMode = "Simple" | "Pro";

export type TodayMode = "Light" | "Standard" | "Focus";

export type GoalType =
  | "recovery"
  | "sexual_confidence"
  | "libido"
  | "erection_quality"
  | "pelvic_floor"
  | "sleep_environment"
  | "appearance_presence"
  | "education_only"
  | "tracking";

export type ProgramCategory =
  | "recovery"
  | "sleep"
  | "pelvic_floor"
  | "confidence"
  | "environment"
  | "pump"
  | "appearance";

export type AlertSeverity = "info" | "caution" | "high_priority" | "medical_attention";

export type RecommendationConfidence = "low" | "medium" | "high";

export type PriorityDomain =
  | "baseline"
  | "recovery"
  | "confidence"
  | "pelvic_floor"
  | "environment"
  | "learning"
  | "safety";

export type QuickLogType =
  | "morning_erection"
  | "libido"
  | "confidence"
  | "energy"
  | "sleep_quality"
  | "pelvic_floor_done"
  | "pump_done"
  | "symptom_checkin"
  | "sex_happened";

export type ActionCardKind = "Learn" | "Check-in" | "Practice" | "Reflect";

export type ContentType = "article" | "guide" | "audio" | "video" | "course" | "summary";

export type TrustLevel = "clinical_guideline" | "reviewed_source" | "expert_summary" | "personal_note";

export type UserProfile = {
  id: string;
  language: AppLanguage;
  mode: UserMode;
  primaryGoal: GoalType;
  secondaryGoals: GoalType[];
  conservativeGuidance: boolean;
};

export type OnboardingResult = {
  profile: UserProfile;
  baseline: {
    sleep: number | null;
    energy: number | null;
    confidence: number | null;
    libido: number | null;
    stress: number | null;
  };
  privacy: {
    vaultLockEnabled: boolean;
    discreetNotifications: boolean;
  };
  contentPreferences: {
    language: AppLanguage;
    autoTranslate: boolean;
  };
  recommendedProgram: Program;
  completedAt: string;
};

export type PrivacyLockState = {
  vaultLockEnabled: boolean;
  discreetNotifications: boolean;
  locked: boolean;
  updatedAt: string;
};

export type OnboardingDraft = {
  primaryGoal: GoalType;
  secondaryGoals: GoalType[];
  mode: UserMode;
  baseline: OnboardingResult["baseline"];
  redFlags: string[];
  privacy: Partial<OnboardingResult["privacy"]>;
  language: AppLanguage;
};

export type Program = {
  id: string;
  title: string;
  category: ProgramCategory;
  durationDays: number;
  dayIndex: number;
};

export type ProgramProgress = {
  programId: string;
  completedDayIndexes: number[];
  lastCompletedAt: string | null;
  updatedAt: string;
};

export type LogEntry = {
  id: string;
  type: QuickLogType;
  value: unknown;
  occurredAt: string;
  source: "manual" | "device" | "import";
};

export type Alert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  module: "today" | "tracking" | "safety" | "learn" | "programs" | "privacy";
};

export type CurrentPriority = {
  domain: PriorityDomain;
  title: string;
  whyItMatters: string;
  recommendedAction: string;
  avoidToday?: string;
  confidence: RecommendationConfidence;
};

export type CoachExplanation = {
  title: string;
  explanation: string;
  dataNote: string;
  confidenceNote: string;
  nextStep: string;
  avoidToday?: string;
  safetyNote: string;
  confidence: RecommendationConfidence;
};

export type DailyStateTile = {
  id: string;
  label: string;
  value: string;
  direction: "up" | "down" | "flat" | "unknown";
  status: string;
};

export type ActionCard = {
  id: string;
  kind: ActionCardKind;
  title: string;
  description: string;
  cta: string;
};

export type QuickLogDefinition = {
  type: QuickLogType;
  label: string;
  input: "boolean" | "score" | "symptom";
};

export type LiveUpdate = {
  id: string;
  title: string;
  sourceLabel: string;
  category: "learning" | "research" | "supplement" | "device";
};

export type Insight = {
  id: string;
  title: string;
  summary: string;
  confidence: RecommendationConfidence;
};

export type ContentItem = {
  id: string;
  type: ContentType;
  title: string;
  summary: string;
  durationMinutes: number;
  trustLevel: TrustLevel;
  tags: string[];
  sourceName: string;
  sourceUrl?: string;
  language: AppLanguage;
  translatedSummaryRu?: string;
  saved: boolean;
  completed: boolean;
};

export type ContentProgress = {
  itemId: string;
  saved: boolean;
  completed: boolean;
  updatedAt: string;
};

export type TodayPayload = {
  date: string;
  todayMode: TodayMode;
  syncStatus: "synced" | "pending" | "offline";
  activeProgram: Program | null;
  currentPriority: CurrentPriority;
  dailyState: DailyStateTile[];
  alerts: Alert[];
  actionCards: ActionCard[];
  quickLogs: QuickLogDefinition[];
  liveUpdates: LiveUpdate[];
  insights: Insight[];
};

export type RuleEngineInput = {
  profile: UserProfile;
  activeProgram: Program | null;
  latestLogs: LogEntry[];
  recentAlerts: Alert[];
  contentItems: ContentItem[];
};

export type QuickLogMutation = {
  type: QuickLogType;
  value: unknown;
  occurredAt: string;
};

export type SyncJobStatus = "pending" | "syncing" | "synced";

export type SyncQueueJob = {
  id: string;
  jobType: "quick_log";
  payload: QuickLogMutation;
  status: SyncJobStatus;
  retryCount: number;
  nextRetryAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};
