import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { markContentCompleted, mergeContentProgress, toggleContentSaved } from "@pmhc/learning";
import { createOnboardingResult } from "@pmhc/onboarding";
import { buildTodayPayload } from "@pmhc/rules";
import { createQueuedQuickLogJob, markSyncSucceeded, nextPendingJobs } from "@pmhc/sync";
import type {
  ContentItem,
  ContentProgress,
  LogEntry,
  OnboardingResult,
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

const onboardingRepository = createJsonRepository<OnboardingResult | null>(AsyncStorage, onboardingKey, null);
const logsRepository = createJsonRepository<LogEntry[]>(AsyncStorage, logsKey, []);
const syncQueueRepository = createJsonRepository<SyncQueueJob[]>(AsyncStorage, syncQueueKey, []);
const contentProgressRepository = createJsonRepository<ContentProgress[]>(AsyncStorage, contentProgressKey, []);

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

export function useAppState() {
  const [activeTab, setActiveTab] = useState<AppTab>("Today");
  const [onboarding, setOnboarding] = useState<OnboardingResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueJob[]>([]);
  const [contentProgress, setContentProgress] = useState<ContentProgress[]>([]);
  const [selectedQuickLog, setSelectedQuickLog] = useState<QuickLogDefinition | null>(null);
  const content: ContentItem[] = useMemo(
    () => mergeContentProgress(starterContent, contentProgress),
    [contentProgress],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [savedOnboarding, savedLogs, savedQueue, savedContentProgress] = await Promise.all([
        onboardingRepository.load(),
        logsRepository.load(),
        syncQueueRepository.load(),
        contentProgressRepository.load(),
      ]);

      if (!mounted) {
        return;
      }

      setOnboarding(savedOnboarding);
      setLogs(savedLogs);
      setSyncQueue(savedQueue);
      setContentProgress(savedContentProgress);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const today = useMemo<TodayPayload>(() => {
    const payload = buildTodayPayload({
        ...starterInput,
        profile: (onboarding ?? fallbackOnboarding).profile,
        activeProgram: (onboarding ?? fallbackOnboarding).recommendedProgram,
        latestLogs: logs,
        contentItems: content,
      });

    return {
      ...payload,
      syncStatus: nextPendingJobs(syncQueue).length > 0 ? "pending" : "synced",
    };
  }, [content, logs, onboarding, syncQueue]);

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

  const completeOnboarding = useCallback(async (result: OnboardingResult) => {
    setOnboarding(result);
    await onboardingRepository.save(result);
  }, []);

  const resetOnboarding = useCallback(async () => {
    setOnboarding(null);
    setLogs([]);
    setSyncQueue([]);
    setContentProgress([]);
    await Promise.all([
      onboardingRepository.clear(),
      logsRepository.clear(),
      syncQueueRepository.clear(),
      contentProgressRepository.clear(),
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
    completeOnboarding,
    openQuickLog: setSelectedQuickLog,
    resetOnboarding,
    setActiveTab,
    syncQueuedWrites,
    toggleSavedContent,
    completeContent,
  };
}
