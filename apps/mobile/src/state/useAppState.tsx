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
  completeCurrentProgramDay,
  createProgramProgress,
  programCompletionPercent,
} from "@pmhc/programs";
import { buildTodayPayload } from "@pmhc/rules";
import { createQueuedQuickLogJob, markSyncSucceeded, nextPendingJobs } from "@pmhc/sync";
import type {
  ContentItem,
  ContentProgress,
  LogEntry,
  OnboardingResult,
  PrivacyLockState,
  ProgramProgress,
  QuickLogDefinition,
  RuleEngineInput,
  SyncQueueJob,
  TodayPayload,
} from "@pmhc/types";
import { QuickLogSheet } from "../components/QuickLogSheet";
import { starterContent } from "../data/starterContent";
import { createJsonRepository } from "../storage/localStore";

export type AppTab = "Today" | "Track" | "Learn" | "Programs" | "Coach" | "Settings";

const onboardingKey = "pmhc:onboarding-complete";
const logsKey = "pmhc:quick-logs";
const syncQueueKey = "pmhc:sync-queue";
const contentProgressKey = "pmhc:content-progress";
const privacyLockKey = "pmhc:privacy-lock";
const programProgressKey = "pmhc:program-progress";

const onboardingRepository = createJsonRepository<OnboardingResult | null>(AsyncStorage, onboardingKey, null);
const logsRepository = createJsonRepository<LogEntry[]>(AsyncStorage, logsKey, []);
const syncQueueRepository = createJsonRepository<SyncQueueJob[]>(AsyncStorage, syncQueueKey, []);
const contentProgressRepository = createJsonRepository<ContentProgress[]>(AsyncStorage, contentProgressKey, []);
const privacyLockRepository = createJsonRepository<PrivacyLockState | null>(AsyncStorage, privacyLockKey, null);
const programProgressRepository = createJsonRepository<ProgramProgress | null>(AsyncStorage, programProgressKey, null);

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
  language: "ru",
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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueJob[]>([]);
  const [contentProgress, setContentProgress] = useState<ContentProgress[]>([]);
  const [privacyLock, setPrivacyLock] = useState<PrivacyLockState>(fallbackPrivacyLock);
  const [programProgress, setProgramProgress] = useState<ProgramProgress | null>(null);
  const [selectedQuickLog, setSelectedQuickLog] = useState<QuickLogDefinition | null>(null);
  const content: ContentItem[] = useMemo(
    () => mergeContentProgress(starterContent, contentProgress),
    [contentProgress],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
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
      setLogs(savedLogs);
      setSyncQueue(savedQueue);
      setContentProgress(savedContentProgress);
      setPrivacyLock(
        savedPrivacyLock ??
          (savedOnboarding ? createPrivacyLockState(savedOnboarding.privacy, savedOnboarding.completedAt) : fallbackPrivacyLock),
      );
      setProgramProgress(savedProgramProgress);
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
      await Promise.all([
        onboardingRepository.save(result),
        persistPrivacyLock(nextPrivacyLock),
        persistProgramProgress(nextProgramProgress),
      ]);
    },
    [persistPrivacyLock, persistProgramProgress],
  );

  const resetOnboarding = useCallback(async () => {
    setOnboarding(null);
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

  return {
    activeTab,
    content,
    hasCompletedOnboarding: onboarding != null,
    logs,
    quickLogSheet: selectedQuickLog ? (
      <QuickLogSheet definition={selectedQuickLog} onClose={() => setSelectedQuickLog(null)} onSave={saveQuickLog} />
    ) : null,
    today,
    pendingSyncCount: nextPendingJobs(syncQueue).length,
    privacyLock,
    programCompletionPercent: today.activeProgram ? programCompletionPercent(today.activeProgram, programProgress) : 0,
    completeOnboarding,
    completeProgramToday,
    lockNow,
    openQuickLog: setSelectedQuickLog,
    resetOnboarding,
    setActiveTab,
    syncQueuedWrites,
    togglePrivacyVault,
    toggleSavedContent,
    completeContent,
    unlock,
  };
}
