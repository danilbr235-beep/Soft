import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { markContentCompleted, mergeContentProgress, toggleContentSaved } from "@pmhc/learning";
import { createOnboardingResult } from "@pmhc/onboarding";
import {
  createPrivacyLockState,
  lockPrivacyVault,
  toggleVaultLock,
  unlockPrivacyVault,
} from "@pmhc/privacy";
import {
  applyProgramProgress,
  buildProgramDayPlan,
  completeCurrentProgramDay,
  createProgramProgress,
  programCompletionPercent,
  toggleCurrentProgramTask,
} from "@pmhc/programs";
import { buildTodayPayload } from "@pmhc/rules";
import { createQueuedQuickLogJob, markSyncSucceeded, nextPendingJobs } from "@pmhc/sync";
import { deleteTrackingLog, updateTrackingLogValue } from "@pmhc/tracking";
import type {
  ContentItem,
  ContentProgress,
  LogEntry,
  OnboardingResult,
  AppLanguage,
  PrivacyLockState,
  ProgramDayPlan,
  ProgramProgress,
  QuickLogDefinition,
  RuleEngineInput,
  SyncQueueJob,
  TodayPayload,
} from "@pmhc/types";
import { QuickLogSheet } from "../components/QuickLogSheet";
import { starterContent } from "../data/starterContent";
import { appStorageKeys } from "../storage/appStorageKeys";
import { createJsonRepository } from "../storage/localStore";

export type AppTab = "Today" | "Track" | "Learn" | "Programs" | "Coach" | "Settings";

const [
  onboardingKey,
  logsKey,
  syncQueueKey,
  contentProgressKey,
  privacyLockKey,
  programProgressKey,
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

export function useAppState() {
  const [activeTab, setActiveTab] = useState<AppTab>("Today");
  const [onboarding, setOnboarding] = useState<OnboardingResult | null>(null);
  const [language, setLanguage] = useState<AppLanguage>(fallbackOnboarding.profile.language);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueJob[]>([]);
  const [contentProgress, setContentProgress] = useState<ContentProgress[]>([]);
  const [privacyLock, setPrivacyLock] = useState<PrivacyLockState>(fallbackPrivacyLock);
  const [programProgress, setProgramProgress] = useState<ProgramProgress | null>(null);
  const [selectedQuickLog, setSelectedQuickLog] = useState<QuickLogDefinition | null>(null);
  const [isReady, setIsReady] = useState(false);
  const content: ContentItem[] = useMemo(
    () => mergeContentProgress(starterContent, contentProgress),
    [contentProgress],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [savedOnboarding, savedLogs, savedQueue, savedContentProgress, savedPrivacyLock, savedProgramProgress] =
          await Promise.all([
            onboardingRepository.load(),
            logsRepository.load(),
            syncQueueRepository.load(),
            contentProgressRepository.load(),
            privacyLockRepository.load(),
            programProgressRepository.load(),
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
          savedPrivacyLock ??
            (savedOnboarding ? createPrivacyLockState(savedOnboarding.privacy, savedOnboarding.completedAt) : fallbackPrivacyLock),
        );
        setProgramProgress(savedProgramProgress);
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
    const payload = buildTodayPayload({
        ...starterInput,
        profile: currentOnboarding.profile,
        activeProgram,
        latestLogs: logs,
        contentItems: content,
      });

    return {
      ...payload,
      syncStatus: nextPendingJobs(syncQueue).length > 0 ? "pending" : "synced",
    };
  }, [content, logs, onboarding, programProgress, syncQueue]);

  const programDayPlan = useMemo<ProgramDayPlan | null>(() => {
    return today.activeProgram ? buildProgramDayPlan(today.activeProgram, programProgress) : null;
  }, [programProgress, today.activeProgram]);

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

  const persistProgramProgress = useCallback(async (nextProgress: ProgramProgress) => {
    setProgramProgress(nextProgress);
    await programProgressRepository.save(nextProgress);
  }, []);

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
      setSelectedQuickLog(null);
    },
    [logs, persistLogs, persistSyncQueue, syncQueue],
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
      ]);
    },
    [persistPrivacyLock, persistProgramProgress],
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
    await Promise.all([
      onboardingRepository.clear(),
      logsRepository.clear(),
      syncQueueRepository.clear(),
      contentProgressRepository.clear(),
      privacyLockRepository.clear(),
      programProgressRepository.clear(),
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
    },
    [contentProgress, persistContentProgress],
  );

  const togglePrivacyVault = useCallback(async () => {
    await persistPrivacyLock(toggleVaultLock(privacyLock, new Date().toISOString()));
  }, [persistPrivacyLock, privacyLock]);

  const lockNow = useCallback(async () => {
    await persistPrivacyLock(lockPrivacyVault(privacyLock, new Date().toISOString()));
  }, [persistPrivacyLock, privacyLock]);

  const unlock = useCallback(async () => {
    await persistPrivacyLock(unlockPrivacyVault(privacyLock, new Date().toISOString()));
  }, [persistPrivacyLock, privacyLock]);

  const completeProgramToday = useCallback(async () => {
    const activeProgram = today.activeProgram;

    if (!activeProgram) {
      return;
    }

    await persistProgramProgress(completeCurrentProgramDay(activeProgram, programProgress, new Date().toISOString()));
  }, [persistProgramProgress, programProgress, today.activeProgram]);

  const toggleProgramTask = useCallback(
    async (taskId: string) => {
      const activeProgram = today.activeProgram;

      if (!activeProgram) {
        return;
      }

      await persistProgramProgress(toggleCurrentProgramTask(activeProgram, programProgress, taskId, new Date().toISOString()));
    },
    [persistProgramProgress, programProgress, today.activeProgram],
  );

  return {
    activeTab,
    content,
    hasCompletedOnboarding: onboarding != null,
    isReady,
    logs,
    quickLogSheet: selectedQuickLog ? (
      <QuickLogSheet definition={selectedQuickLog} language={language} onClose={() => setSelectedQuickLog(null)} onSave={saveQuickLog} />
    ) : null,
    language,
    today,
    pendingSyncCount: nextPendingJobs(syncQueue).length,
    privacyLock,
    programDayPlan,
    programCompletionPercent: today.activeProgram ? programCompletionPercent(today.activeProgram, programProgress) : 0,
    completeOnboarding,
    changeLanguage,
    completeProgramToday,
    deleteLog,
    lockNow,
    openQuickLog: setSelectedQuickLog,
    resetOnboarding,
    setActiveTab,
    syncQueuedWrites,
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
      (typeof value.lastCompletedAt === "string" || value.lastCompletedAt === null) &&
      typeof value.updatedAt === "string")
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
