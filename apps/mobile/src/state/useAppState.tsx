import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { markContentCompleted, mergeContentProgress, toggleContentSaved } from "@pmhc/learning";
import { createOnboardingResult, getStarterProgramById } from "@pmhc/onboarding";
import {
  clearPrivacyPin,
  createPrivacyLockState,
  hasPrivacyPin,
  lockPrivacyVaultIfInactive,
  lockPrivacyVault,
  normalizePrivacyLockState,
  recordPrivacyActivity,
  setPrivacyPin,
  toggleVaultLock,
  unlockPrivacyVaultWithPin,
} from "@pmhc/privacy";
import {
  applyProgramProgress,
  appendProgramHistory,
  buildProgramDayPlan,
  buildProgramCompletionSummary,
  buildProgramProgressSummary,
  completeCurrentProgramDay,
  createProgramHistoryEntry,
  createProgramProgress,
  isProgramPaused,
  markCurrentProgramRestDay,
  pauseProgramProgress,
  programCompletionPercent,
  resumeProgramProgress,
  skipCurrentProgramDay,
  toggleCurrentProgramTask,
} from "@pmhc/programs";
import { applyReviewDigestToToday, buildTodayPayload } from "@pmhc/rules";
import { createQueuedQuickLogJob, markSyncSucceeded, nextPendingJobs } from "@pmhc/sync";
import { buildTrackingReviewDigest, deleteTrackingLog, updateTrackingLogValue } from "@pmhc/tracking";
import type {
  ContentItem,
  ContentProgress,
  LogEntry,
  OnboardingResult,
  AppLanguage,
  PrivacyLockState,
  ProgramDayPlan,
  ProgramHistoryEntry,
  ProgramProgress,
  ProgramProgressSummary,
  QuickLogDefinition,
  RuleEngineInput,
  SyncQueueJob,
  TodayPayload,
} from "@pmhc/types";
import { QuickLogSheet } from "../components/QuickLogSheet";
import { starterContent } from "../data/starterContent";
import {
  buildDailySession,
  isDailySessionProgressStore,
  markDailySessionStepComplete,
  type DailySessionProgressStore,
  type DailySessionStepId,
} from "../dailySession";
import { buildMorningExperiments } from "../morningExperiments";
import { buildMorningRoutine } from "../morningRoutine";
import {
  isMorningRoutineProgressStore,
  markMorningRoutineStepComplete,
  type MorningRoutineProgressStore,
  type MorningRoutineStepId,
} from "../morningRoutineProgress";
import { type ReviewSection } from "../reviewRecap";
import {
  appendReviewPacketHistory,
  createReviewPacketHistoryEntry,
  isReviewPacketHistoryArray,
  type ReviewPacketHistoryEntry,
} from "../reviewPacketHistory";
import { appStorageKeys } from "../storage/appStorageKeys";
import { createJsonRepository } from "../storage/localStore";

export type AppTab = "Today" | "Track" | "Review" | "Learn" | "Programs" | "Coach" | "Settings";

const [
  onboardingKey,
  logsKey,
  syncQueueKey,
  contentProgressKey,
  privacyLockKey,
  programProgressKey,
  programHistoryKey,
  reviewPacketHistoryKey,
  dailySessionProgressKey,
  morningRoutineProgressKey,
] = appStorageKeys;

const onboardingRepository = createJsonRepository<OnboardingResult | null>(
  AsyncStorage,
  onboardingKey,
  null,
  isNullableOnboardingResult,
);
const logsRepository = createJsonRepository<LogEntry[]>(AsyncStorage, logsKey, [], isLogEntryArray);
const syncQueueRepository = createJsonRepository<SyncQueueJob[]>(AsyncStorage, syncQueueKey, [], isSyncQueueJobArray);
const contentProgressRepository = createJsonRepository<ContentProgress[]>(
  AsyncStorage,
  contentProgressKey,
  [],
  isContentProgressArray,
);
const privacyLockRepository = createJsonRepository<PrivacyLockState | null>(
  AsyncStorage,
  privacyLockKey,
  null,
  isNullablePrivacyLockState,
);
const programProgressRepository = createJsonRepository<ProgramProgress | null>(
  AsyncStorage,
  programProgressKey,
  null,
  isNullableProgramProgress,
);
const programHistoryRepository = createJsonRepository<ProgramHistoryEntry[]>(
  AsyncStorage,
  programHistoryKey,
  [],
  isProgramHistoryArray,
);
const reviewPacketHistoryRepository = createJsonRepository<ReviewPacketHistoryEntry[]>(
  AsyncStorage,
  reviewPacketHistoryKey,
  [],
  isReviewPacketHistoryArray,
);
const dailySessionProgressRepository = createJsonRepository<DailySessionProgressStore>(
  AsyncStorage,
  dailySessionProgressKey,
  {},
  isDailySessionProgressStore,
);
const morningRoutineProgressRepository = createJsonRepository<MorningRoutineProgressStore>(
  AsyncStorage,
  morningRoutineProgressKey,
  {},
  isMorningRoutineProgressStore,
);

const fallbackOnboarding = createOnboardingResult({
  primaryGoal: "sexual_confidence",
  secondaryGoals: ["recovery", "tracking"],
  mode: "Simple",
  baseline: {
    sleep: 5,
    energy: 4,
    confidence: 3,
    libido: 4,
    stress: 6,
  },
  redFlags: [],
  privacy: {
    vaultLockEnabled: false,
    discreetNotifications: true,
  },
  language: "en",
});

const starterInput: RuleEngineInput = {
  profile: fallbackOnboarding.profile,
  activeProgram: fallbackOnboarding.recommendedProgram,
  latestLogs: [],
  recentAlerts: [],
  contentItems: starterContent,
};

const fallbackPrivacyLock = createPrivacyLockState(fallbackOnboarding.privacy, "");
const privacyActivityThrottleMs = 15 * 1000;
const webActivityEvents = ["keydown", "mousedown", "mousemove", "scroll", "touchstart"] as const;

export function useAppState() {
  const [activeTab, setActiveTab] = useState<AppTab>("Today");
  const [onboarding, setOnboarding] = useState<OnboardingResult | null>(null);
  const [language, setLanguage] = useState<AppLanguage>(fallbackOnboarding.profile.language);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueJob[]>([]);
  const [contentProgress, setContentProgress] = useState<ContentProgress[]>([]);
  const [privacyLock, setPrivacyLock] = useState<PrivacyLockState>(fallbackPrivacyLock);
  const [programProgress, setProgramProgress] = useState<ProgramProgress | null>(null);
  const [programHistory, setProgramHistory] = useState<ProgramHistoryEntry[]>([]);
  const [reviewPackets, setReviewPackets] = useState<ReviewPacketHistoryEntry[]>([]);
  const [dailySessionProgress, setDailySessionProgress] = useState<DailySessionProgressStore>({});
  const [morningRoutineProgress, setMorningRoutineProgress] = useState<MorningRoutineProgressStore>({});
  const [learnFocusItemId, setLearnFocusItemId] = useState<string | null>(null);
  const [selectedQuickLog, setSelectedQuickLog] = useState<QuickLogDefinition | null>(null);
  const [isReady, setIsReady] = useState(false);
  const content: ContentItem[] = useMemo(
    () => mergeContentProgress(starterContent, contentProgress),
    [contentProgress],
  );
  const reviewDigest = useMemo(() => buildTrackingReviewDigest(logs, programHistory), [logs, programHistory]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [
          savedOnboarding,
          savedLogs,
          savedQueue,
          savedContentProgress,
          savedPrivacyLock,
          savedProgramProgress,
          savedProgramHistory,
          savedReviewPackets,
          savedDailySessionProgress,
          savedMorningRoutineProgress,
        ] =
          await Promise.all([
            onboardingRepository.load(),
            logsRepository.load(),
            syncQueueRepository.load(),
            contentProgressRepository.load(),
            privacyLockRepository.load(),
            programProgressRepository.load(),
            programHistoryRepository.load(),
            reviewPacketHistoryRepository.load(),
            dailySessionProgressRepository.load(),
            morningRoutineProgressRepository.load(),
          ]);

        if (!mounted) {
          return;
        }

        setOnboarding(savedOnboarding);
        setLanguage(savedOnboarding?.profile.language ?? fallbackOnboarding.profile.language);
        setLogs(savedLogs);
        setSyncQueue(savedQueue);
        setContentProgress(savedContentProgress);
        setPrivacyLock(
          savedPrivacyLock
            ? normalizePrivacyLockState(savedPrivacyLock)
            : savedOnboarding
              ? createPrivacyLockState(savedOnboarding.privacy, savedOnboarding.completedAt)
              : fallbackPrivacyLock,
        );
        setProgramProgress(savedProgramProgress);
        setProgramHistory(savedProgramHistory);
        setReviewPackets(savedReviewPackets);
        setDailySessionProgress(savedDailySessionProgress);
        setMorningRoutineProgress(savedMorningRoutineProgress);
      } catch {
        if (!mounted) {
          return;
        }

        setOnboarding(null);
        setLanguage(fallbackOnboarding.profile.language);
        setLogs([]);
        setSyncQueue([]);
        setContentProgress([]);
        setPrivacyLock(fallbackPrivacyLock);
        setProgramProgress(null);
        setProgramHistory([]);
        setReviewPackets([]);
        setDailySessionProgress({});
        setMorningRoutineProgress({});
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const today = useMemo<TodayPayload>(() => {
    const currentOnboarding = onboarding ?? fallbackOnboarding;
    const activeProgram = applyProgramProgress(currentOnboarding.recommendedProgram, programProgress);
    const payload = applyReviewDigestToToday(
      buildTodayPayload({
        ...starterInput,
        profile: currentOnboarding.profile,
        activeProgram,
        latestLogs: logs,
        contentItems: content,
      }),
      {
        tone: reviewDigest.tone,
        nextStep: reviewDigest.nextStep,
        language: currentOnboarding.profile.language,
      },
    );

    return {
      ...payload,
      syncStatus: nextPendingJobs(syncQueue).length > 0 ? "pending" : "synced",
    };
  }, [content, logs, onboarding, programProgress, reviewDigest.nextStep, reviewDigest.tone, syncQueue]);

  const programDayPlan = useMemo<ProgramDayPlan | null>(() => {
    return today.activeProgram ? buildProgramDayPlan(today.activeProgram, programProgress) : null;
  }, [programProgress, today.activeProgram]);
  const programSummary = useMemo<ProgramProgressSummary | null>(() => {
    return today.activeProgram ? buildProgramProgressSummary(today.activeProgram, programProgress) : null;
  }, [programProgress, today.activeProgram]);
  const programPaused = useMemo(() => {
    return today.activeProgram ? isProgramPaused(today.activeProgram, programProgress) : false;
  }, [programProgress, today.activeProgram]);
  const dailySession = useMemo(() => {
    return buildDailySession({
      content,
      language,
      logs,
      programProgress,
      progressEntry: dailySessionProgress[today.date],
      reviewPackets,
      reviewDigestNextStep: reviewDigest.nextStep,
      reviewDigestTone: reviewDigest.tone,
      today,
    });
  }, [
    content,
    dailySessionProgress,
    language,
    logs,
    programProgress,
    reviewDigest.nextStep,
    reviewDigest.tone,
    reviewPackets,
    today,
  ]);
  const morningRoutine = useMemo(() => {
    return buildMorningRoutine({
      content,
      language,
      progressEntry: morningRoutineProgress[today.date],
      progressStore: morningRoutineProgress,
      today,
    });
  }, [content, language, morningRoutineProgress, today]);
  const morningExperiments = useMemo(() => {
    return buildMorningExperiments({
      content,
      language,
    });
  }, [content, language]);

  const persistLogs = useCallback(async (nextLogs: LogEntry[]) => {
    setLogs(nextLogs);
    await logsRepository.save(nextLogs);
  }, []);

  const persistSyncQueue = useCallback(async (nextQueue: SyncQueueJob[]) => {
    setSyncQueue(nextQueue);
    await syncQueueRepository.save(nextQueue);
  }, []);

  const persistContentProgress = useCallback(async (nextProgress: ContentProgress[]) => {
    setContentProgress(nextProgress);
    await contentProgressRepository.save(nextProgress);
  }, []);

  const persistPrivacyLock = useCallback(async (nextPrivacyLock: PrivacyLockState) => {
    setPrivacyLock(nextPrivacyLock);
    await privacyLockRepository.save(nextPrivacyLock);
  }, []);

  useEffect(() => {
    if (!isReady || !privacyLock.vaultLockEnabled || privacyLock.locked) {
      return;
    }

    const now = new Date().toISOString();
    const lockedState = lockPrivacyVaultIfInactive(privacyLock, now);

    if (lockedState.locked !== privacyLock.locked) {
      void persistPrivacyLock(lockedState);
      return;
    }

    const remainingMs = remainingAutoLockMs(privacyLock);

    if (remainingMs == null) {
      return;
    }

    const timeout = setTimeout(() => {
      void persistPrivacyLock(lockPrivacyVaultIfInactive(privacyLock, new Date().toISOString()));
    }, remainingMs + 50);

    return () => clearTimeout(timeout);
  }, [isReady, persistPrivacyLock, privacyLock]);

  useEffect(() => {
    if (!isReady || !privacyLock.vaultLockEnabled || privacyLock.locked) {
      return;
    }

    function handleActivity() {
      if (shouldThrottlePrivacyActivity(privacyLock)) {
        return;
      }

      void persistPrivacyLock(recordPrivacyActivity(privacyLock, new Date().toISOString()));
    }

    for (const eventName of webActivityEvents) {
      if (typeof window !== "undefined") {
        window.addEventListener(eventName, handleActivity, { passive: true });
      }
    }

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        void persistPrivacyLock(lockPrivacyVault(privacyLock, new Date().toISOString()));
        return;
      }

      handleActivity();
    });

    return () => {
      for (const eventName of webActivityEvents) {
        if (typeof window !== "undefined") {
          window.removeEventListener(eventName, handleActivity);
        }
      }

      appStateSubscription.remove();
    };
  }, [isReady, persistPrivacyLock, privacyLock]);

  const persistProgramProgress = useCallback(async (nextProgress: ProgramProgress) => {
    setProgramProgress(nextProgress);
    await programProgressRepository.save(nextProgress);
  }, []);

  const persistProgramHistory = useCallback(async (nextHistory: ProgramHistoryEntry[]) => {
    setProgramHistory(nextHistory);
    await programHistoryRepository.save(nextHistory);
  }, []);

  const persistReviewPackets = useCallback(async (nextHistory: ReviewPacketHistoryEntry[]) => {
    setReviewPackets(nextHistory);
    await reviewPacketHistoryRepository.save(nextHistory);
  }, []);
  const persistDailySessionProgress = useCallback(async (nextProgress: DailySessionProgressStore) => {
    setDailySessionProgress(nextProgress);
    await dailySessionProgressRepository.save(nextProgress);
  }, []);
  const persistMorningRoutineProgress = useCallback(async (nextProgress: MorningRoutineProgressStore) => {
    setMorningRoutineProgress(nextProgress);
    await morningRoutineProgressRepository.save(nextProgress);
  }, []);
  const completeDailySessionStep = useCallback(
    async (stepId: DailySessionStepId) => {
      await persistDailySessionProgress(
        markDailySessionStepComplete(dailySessionProgress, today.date, stepId, new Date().toISOString()),
      );
    },
    [dailySessionProgress, persistDailySessionProgress, today.date],
  );
  const completeMorningRoutineStep = useCallback(
    async (stepId: MorningRoutineStepId) => {
      await persistMorningRoutineProgress(
        markMorningRoutineStepComplete(morningRoutineProgress, today.date, stepId, new Date().toISOString()),
      );
    },
    [morningRoutineProgress, persistMorningRoutineProgress, today.date],
  );

  const saveQuickLog = useCallback(
    async (definition: QuickLogDefinition, value: unknown) => {
      const nextLog: LogEntry = {
        id: `local-${Date.now()}`,
        type: definition.type,
        value,
        occurredAt: new Date().toISOString(),
        source: "manual",
      };
      const syncJob = createQueuedQuickLogJob({
        type: nextLog.type,
        value: nextLog.value,
        occurredAt: nextLog.occurredAt,
      });

      await Promise.all([persistLogs([nextLog, ...logs]), persistSyncQueue([...syncQueue, syncJob])]);
      if (dailySession.quizLog?.type === definition.type) {
        await completeDailySessionStep("quiz");
      }
      if (morningRoutine.logDefinition?.type === definition.type) {
        await completeMorningRoutineStep("checkin");
      }
      setSelectedQuickLog(null);
    },
    [
      completeDailySessionStep,
      completeMorningRoutineStep,
      dailySession.quizLog,
      logs,
      morningRoutine.logDefinition,
      persistLogs,
      persistSyncQueue,
      syncQueue,
    ],
  );

  const completeOnboarding = useCallback(
    async (result: OnboardingResult) => {
      const nextPrivacyLock = createPrivacyLockState(result.privacy, result.completedAt);
      const nextProgramProgress = createProgramProgress(result.recommendedProgram, result.completedAt);

      setOnboarding(result);
      setLanguage(result.profile.language);
      await Promise.all([
        onboardingRepository.save(result),
        persistPrivacyLock(nextPrivacyLock),
        persistProgramProgress(nextProgramProgress),
        persistProgramHistory([]),
        persistReviewPackets([]),
        persistDailySessionProgress({}),
        persistMorningRoutineProgress({}),
      ]);
    },
    [
      persistDailySessionProgress,
      persistMorningRoutineProgress,
      persistPrivacyLock,
      persistProgramHistory,
      persistProgramProgress,
      persistReviewPackets,
    ],
  );

  const changeLanguage = useCallback(
    async (nextLanguage: AppLanguage) => {
      setLanguage(nextLanguage);

      if (!onboarding) {
        return;
      }

      const nextOnboarding: OnboardingResult = {
        ...onboarding,
        profile: {
          ...onboarding.profile,
          language: nextLanguage,
        },
        contentPreferences: {
          ...onboarding.contentPreferences,
          language: nextLanguage,
          autoTranslate: nextLanguage === "ru",
        },
      };

      setOnboarding(nextOnboarding);
      await onboardingRepository.save(nextOnboarding);
    },
    [onboarding],
  );

  const resetOnboarding = useCallback(async () => {
    setOnboarding(null);
    setLanguage(fallbackOnboarding.profile.language);
    setLogs([]);
    setSyncQueue([]);
    setContentProgress([]);
    setPrivacyLock(fallbackPrivacyLock);
    setProgramProgress(null);
    setProgramHistory([]);
    setReviewPackets([]);
    setDailySessionProgress({});
    setMorningRoutineProgress({});
    setLearnFocusItemId(null);
    await Promise.all([
      onboardingRepository.clear(),
      logsRepository.clear(),
      syncQueueRepository.clear(),
      contentProgressRepository.clear(),
      privacyLockRepository.clear(),
      programProgressRepository.clear(),
      programHistoryRepository.clear(),
      reviewPacketHistoryRepository.clear(),
      dailySessionProgressRepository.clear(),
      morningRoutineProgressRepository.clear(),
    ]);
  }, []);

  const syncQueuedWrites = useCallback(async () => {
    const syncedQueue = syncQueue.map((job) => (job.status === "pending" ? markSyncSucceeded(job) : job));
    await persistSyncQueue(syncedQueue);
  }, [persistSyncQueue, syncQueue]);

  const updateLogValue = useCallback(
    async (logId: string, value: unknown) => {
      await persistLogs(updateTrackingLogValue(logs, logId, value));
    },
    [logs, persistLogs],
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      await persistLogs(deleteTrackingLog(logs, logId));
    },
    [logs, persistLogs],
  );

  const toggleSavedContent = useCallback(
    async (itemId: string) => {
      await persistContentProgress(toggleContentSaved(contentProgress, itemId, new Date().toISOString()));
    },
    [contentProgress, persistContentProgress],
  );

  const completeContent = useCallback(
    async (itemId: string) => {
      await persistContentProgress(markContentCompleted(contentProgress, itemId, new Date().toISOString()));
      if (learnFocusItemId === itemId) {
        await completeDailySessionStep("lesson");
        setLearnFocusItemId(null);
      }
    },
    [completeDailySessionStep, contentProgress, learnFocusItemId, persistContentProgress],
  );

  const togglePrivacyVault = useCallback(async () => {
    await persistPrivacyLock(toggleVaultLock(privacyLock, new Date().toISOString()));
  }, [persistPrivacyLock, privacyLock]);

  const lockNow = useCallback(async () => {
    await persistPrivacyLock(lockPrivacyVault(privacyLock, new Date().toISOString()));
  }, [persistPrivacyLock, privacyLock]);

  const unlock = useCallback(async (pin: string) => {
    const result = unlockPrivacyVaultWithPin(privacyLock, pin, new Date().toISOString());
    await persistPrivacyLock(result.state);
    return result.unlocked;
  }, [persistPrivacyLock, privacyLock]);

  const setPrivacyPinCode = useCallback(
    async (pin: string) => {
      await persistPrivacyLock(setPrivacyPin(privacyLock, pin, new Date().toISOString()));
    },
    [persistPrivacyLock, privacyLock],
  );

  const clearPrivacyPinCode = useCallback(async () => {
    await persistPrivacyLock(clearPrivacyPin(privacyLock, new Date().toISOString()));
  }, [persistPrivacyLock, privacyLock]);

  const completeProgramToday = useCallback(async () => {
    const activeProgram = today.activeProgram;

    if (!activeProgram) {
      return;
    }

    await persistProgramProgress(completeCurrentProgramDay(activeProgram, programProgress, new Date().toISOString()));
    await completeDailySessionStep("practice");
  }, [completeDailySessionStep, persistProgramProgress, programProgress, today.activeProgram]);

  const restProgramToday = useCallback(async () => {
    const activeProgram = today.activeProgram;

    if (!activeProgram) {
      return;
    }

    await persistProgramProgress(markCurrentProgramRestDay(activeProgram, programProgress, new Date().toISOString()));
    await completeDailySessionStep("practice");
  }, [completeDailySessionStep, persistProgramProgress, programProgress, today.activeProgram]);

  const skipProgramToday = useCallback(async () => {
    const activeProgram = today.activeProgram;

    if (!activeProgram) {
      return;
    }

    await persistProgramProgress(skipCurrentProgramDay(activeProgram, programProgress, new Date().toISOString()));
    await completeDailySessionStep("practice");
  }, [completeDailySessionStep, persistProgramProgress, programProgress, today.activeProgram]);

  const pauseProgram = useCallback(async () => {
    const activeProgram = today.activeProgram;

    if (!activeProgram) {
      return;
    }

    await persistProgramProgress(pauseProgramProgress(activeProgram, programProgress, new Date().toISOString()));
  }, [persistProgramProgress, programProgress, today.activeProgram]);

  const resumeProgram = useCallback(async () => {
    const activeProgram = today.activeProgram;

    if (!activeProgram) {
      return;
    }

    await persistProgramProgress(resumeProgramProgress(activeProgram, programProgress, new Date().toISOString()));
  }, [persistProgramProgress, programProgress, today.activeProgram]);

  const toggleProgramTask = useCallback(
    async (taskId: string) => {
      const activeProgram = today.activeProgram;

      if (!activeProgram) {
        return;
      }

      await persistProgramProgress(toggleCurrentProgramTask(activeProgram, programProgress, taskId, new Date().toISOString()));
      await completeDailySessionStep("practice");
    },
    [completeDailySessionStep, persistProgramProgress, programProgress, today.activeProgram],
  );

  const startRecommendedProgram = useCallback(
    async (programId: string) => {
      if (!onboarding) {
        return;
      }

      const nextProgram = getStarterProgramById(programId);

      if (!nextProgram) {
        return;
      }

      const now = new Date().toISOString();
      const completionSummary = programSummary
        ? buildProgramCompletionSummary({
            alerts: today.alerts,
            currentPriority: today.currentPriority,
            progressSummary: programSummary,
          })
        : null;
      const nextHistory = today.activeProgram && programSummary && completionSummary
        ? appendProgramHistory(
            programHistory,
            createProgramHistoryEntry({
              activeProgram: today.activeProgram,
              completionState: completionSummary.state,
              completedAt: now,
              nextProgramId: nextProgram.id,
              progressSummary: programSummary,
              reasonTitle: completionSummary.reasonTitle,
            }),
          )
        : programHistory;
      const nextOnboarding: OnboardingResult = {
        ...onboarding,
        recommendedProgram: nextProgram,
      };

      setOnboarding(nextOnboarding);
      setLearnFocusItemId(null);
      await Promise.all([
        onboardingRepository.save(nextOnboarding),
        persistProgramHistory(nextHistory),
        persistProgramProgress(createProgramProgress(nextProgram, now)),
      ]);
    },
    [onboarding, persistProgramHistory, persistProgramProgress, programHistory, programSummary, today.activeProgram, today.alerts, today.currentPriority],
  );

  const saveReviewPacket = useCallback(
    async (section: ReviewSection, packet: { kind: "packet"; title: string; blocks: ReviewPacketHistoryEntry["blocks"] }) => {
      const nextEntry = createReviewPacketHistoryEntry({
        createdAt: new Date().toISOString(),
        packet,
        section,
      });

      await persistReviewPackets(appendReviewPacketHistory(reviewPackets, nextEntry));
      await completeDailySessionStep("reflection");
    },
    [completeDailySessionStep, persistReviewPackets, reviewPackets],
  );
  const clearLearnFocus = useCallback(() => {
    setLearnFocusItemId(null);
  }, []);
  const openLearnItem = useCallback(
    (itemId: string | null) => {
      if (itemId && itemId === morningRoutine.guideItemId) {
        void completeMorningRoutineStep("guide");
      }

      setLearnFocusItemId(itemId);
      setActiveTab("Learn");
    },
    [completeMorningRoutineStep, morningRoutine.guideItemId],
  );
  const openDailySessionStep = useCallback(
    (stepId: DailySessionStepId) => {
      if (stepId === "lesson") {
        openLearnItem(dailySession.lessonItemId);
        return;
      }

      if (stepId === "quiz") {
        if (dailySession.quizLog) {
          setSelectedQuickLog(dailySession.quizLog);
          return;
        }

        setActiveTab("Track");
        return;
      }

      if (stepId === "practice") {
        setActiveTab(today.activeProgram ? "Programs" : "Track");
        return;
      }

      setActiveTab("Review");
    },
    [dailySession.lessonItemId, dailySession.quizLog, openLearnItem, today.activeProgram],
  );

  return {
    activeTab,
    content,
    dailySession,
    hasCompletedOnboarding: onboarding != null,
    isReady,
    learnFocusItemId,
    logs,
    quickLogSheet: selectedQuickLog ? (
      <QuickLogSheet definition={selectedQuickLog} language={language} onClose={() => setSelectedQuickLog(null)} onSave={saveQuickLog} />
    ) : null,
    language,
    morningExperiments,
    morningRoutine,
    today,
    pendingSyncCount: nextPendingJobs(syncQueue).length,
    privacyLock,
    reviewDigest,
    hasPrivacyPin: hasPrivacyPin(privacyLock),
    programDayPlan,
    programPaused,
    programHistory,
    reviewPackets,
    programSummary,
    programCompletionPercent: today.activeProgram ? programCompletionPercent(today.activeProgram, programProgress) : 0,
    completeOnboarding,
    changeLanguage,
    completeProgramToday,
    clearPrivacyPin: clearPrivacyPinCode,
    clearLearnFocus,
    deleteLog,
    lockNow,
    completeMorningRoutineStep,
    openDailySessionStep,
    openLearnItem,
    openQuickLog: setSelectedQuickLog,
    pauseProgram,
    resetOnboarding,
    resumeProgram,
    restProgramToday,
    saveReviewPacket,
    setActiveTab,
    startRecommendedProgram,
    skipProgramToday,
    syncQueuedWrites,
    setPrivacyPin: setPrivacyPinCode,
    togglePrivacyVault,
    toggleProgramTask,
    toggleSavedContent,
    completeContent,
    updateLogValue,
    unlock,
  };
}

function isNullableOnboardingResult(value: unknown): value is OnboardingResult | null {
  if (value === null) {
    return true;
  }

  if (!isRecord(value) || !isRecord(value.profile) || !isRecord(value.privacy) || !isRecord(value.recommendedProgram)) {
    return false;
  }

  return (
    typeof value.profile.id === "string" &&
    typeof value.profile.mode === "string" &&
    typeof value.profile.primaryGoal === "string" &&
    typeof value.profile.conservativeGuidance === "boolean" &&
    typeof value.privacy.vaultLockEnabled === "boolean" &&
    typeof value.privacy.discreetNotifications === "boolean" &&
    typeof value.recommendedProgram.id === "string" &&
    typeof value.recommendedProgram.title === "string" &&
    typeof value.recommendedProgram.durationDays === "number" &&
    typeof value.recommendedProgram.dayIndex === "number" &&
    typeof value.completedAt === "string"
  );
}

function isLogEntryArray(value: unknown): value is LogEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.id === "string" &&
        typeof entry.type === "string" &&
        typeof entry.occurredAt === "string" &&
        typeof entry.source === "string",
    )
  );
}

function isSyncQueueJobArray(value: unknown): value is SyncQueueJob[] {
  return (
    Array.isArray(value) &&
    value.every(
      (job) =>
        isRecord(job) &&
        typeof job.id === "string" &&
        job.jobType === "quick_log" &&
        isRecord(job.payload) &&
        typeof job.status === "string",
    )
  );
}

function isContentProgressArray(value: unknown): value is ContentProgress[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.itemId === "string" &&
        typeof item.saved === "boolean" &&
        typeof item.completed === "boolean" &&
        typeof item.updatedAt === "string",
    )
  );
}

function isNullablePrivacyLockState(value: unknown): value is PrivacyLockState | null {
  return (
    value === null ||
    (isRecord(value) &&
      typeof value.vaultLockEnabled === "boolean" &&
      typeof value.discreetNotifications === "boolean" &&
      typeof value.locked === "boolean" &&
      (typeof value.pinHash === "string" || value.pinHash === null || value.pinHash === undefined) &&
      (typeof value.pinSalt === "string" || value.pinSalt === null || value.pinSalt === undefined) &&
      (typeof value.failedUnlockAttempts === "number" || value.failedUnlockAttempts === undefined) &&
      (typeof value.autoLockAfterMs === "number" || value.autoLockAfterMs === null || value.autoLockAfterMs === undefined) &&
      (typeof value.lastActivityAt === "string" || value.lastActivityAt === null || value.lastActivityAt === undefined) &&
      typeof value.updatedAt === "string")
  );
}

function isNullableProgramProgress(value: unknown): value is ProgramProgress | null {
  return (
    value === null ||
    (isRecord(value) &&
      typeof value.programId === "string" &&
      Array.isArray(value.completedDayIndexes) &&
      value.completedDayIndexes.every((day) => typeof day === "number") &&
      (value.completedTaskIdsByDay === undefined || isCompletedTaskMap(value.completedTaskIdsByDay)) &&
      (value.restDayIndexes === undefined ||
        (Array.isArray(value.restDayIndexes) && value.restDayIndexes.every((day) => typeof day === "number"))) &&
      (value.skippedDayIndexes === undefined ||
        (Array.isArray(value.skippedDayIndexes) && value.skippedDayIndexes.every((day) => typeof day === "number"))) &&
      (typeof value.lastCompletedAt === "string" || value.lastCompletedAt === null) &&
      (typeof value.pausedAt === "string" || value.pausedAt === null || value.pausedAt === undefined) &&
      typeof value.updatedAt === "string")
  );
}

function isProgramHistoryArray(value: unknown): value is ProgramHistoryEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.id === "string" &&
        typeof entry.programId === "string" &&
        typeof entry.completionState === "string" &&
        typeof entry.reasonTitle === "string" &&
        typeof entry.completedDays === "number" &&
        typeof entry.restDays === "number" &&
        typeof entry.skippedDays === "number" &&
        typeof entry.completedAt === "string" &&
        (typeof entry.nextProgramId === "string" || entry.nextProgramId === null),
    )
  );
}

function isCompletedTaskMap(value: unknown): value is Record<string, string[]> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (taskIds) => Array.isArray(taskIds) && taskIds.every((taskId) => typeof taskId === "string"),
    )
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function remainingAutoLockMs(privacyLock: PrivacyLockState) {
  if (!privacyLock.autoLockAfterMs || !privacyLock.lastActivityAt) {
    return null;
  }

  const lastActivityMs = Date.parse(privacyLock.lastActivityAt);

  if (Number.isNaN(lastActivityMs)) {
    return null;
  }

  return Math.max(privacyLock.autoLockAfterMs - (Date.now() - lastActivityMs), 0);
}

function shouldThrottlePrivacyActivity(privacyLock: PrivacyLockState) {
  if (!privacyLock.lastActivityAt) {
    return false;
  }

  const lastActivityMs = Date.parse(privacyLock.lastActivityAt);

  if (Number.isNaN(lastActivityMs)) {
    return false;
  }

  return Date.now() - lastActivityMs < privacyActivityThrottleMs;
}
