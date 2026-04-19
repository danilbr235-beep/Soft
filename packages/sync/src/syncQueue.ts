import type { QuickLogMutation, SyncQueueJob } from "@pmhc/types";

export function createQueuedQuickLogJob(
  payload: QuickLogMutation,
  now = new Date(),
): SyncQueueJob {
  const timestamp = now.toISOString();

  return {
    id: `sync-${now.getTime()}-${payload.type}`,
    jobType: "quick_log",
    payload,
    status: "pending",
    retryCount: 0,
    nextRetryAt: null,
    lastError: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function markSyncFailed(
  job: SyncQueueJob,
  error: string,
  now = new Date(),
): SyncQueueJob {
  const nextRetryAt = new Date(now.getTime() + retryDelayMs(job.retryCount + 1)).toISOString();

  return {
    ...job,
    status: "pending",
    retryCount: job.retryCount + 1,
    nextRetryAt,
    lastError: error,
    updatedAt: now.toISOString(),
  };
}

export function markSyncSucceeded(job: SyncQueueJob, now = new Date()): SyncQueueJob {
  return {
    ...job,
    status: "synced",
    lastError: null,
    nextRetryAt: null,
    updatedAt: now.toISOString(),
  };
}

export function nextPendingJobs(jobs: SyncQueueJob[], limit = 10): SyncQueueJob[] {
  return jobs
    .filter((job) => job.status === "pending")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, limit);
}

function retryDelayMs(retryCount: number) {
  const seconds = Math.min(60, 2 ** retryCount);
  return seconds * 1000;
}
