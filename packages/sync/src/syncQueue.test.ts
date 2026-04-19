import { describe, expect, it } from "vitest";
import { createQueuedQuickLogJob, markSyncFailed, markSyncSucceeded, nextPendingJobs } from "./syncQueue";

describe("sync queue", () => {
  it("creates a pending quick-log job with retry metadata", () => {
    const job = createQueuedQuickLogJob({
      type: "confidence",
      value: 7,
      occurredAt: "2026-04-19T10:00:00Z",
    });

    expect(job.jobType).toBe("quick_log");
    expect(job.status).toBe("pending");
    expect(job.retryCount).toBe(0);
    expect(job.payload.type).toBe("confidence");
  });

  it("keeps failed jobs queued with incremented retry count", () => {
    const job = createQueuedQuickLogJob({
      type: "sleep_quality",
      value: 4,
      occurredAt: "2026-04-19T10:00:00Z",
    });

    const failed = markSyncFailed(job, "network unavailable");

    expect(failed.status).toBe("pending");
    expect(failed.retryCount).toBe(1);
    expect(failed.lastError).toBe("network unavailable");
    expect(failed.nextRetryAt).toBeTruthy();
  });

  it("returns only pending jobs and hides synced jobs", () => {
    const pending = createQueuedQuickLogJob({
      type: "libido",
      value: 6,
      occurredAt: "2026-04-19T10:00:00Z",
    });
    const synced = markSyncSucceeded(
      createQueuedQuickLogJob({
        type: "energy",
        value: 5,
        occurredAt: "2026-04-19T10:00:00Z",
      }),
    );

    expect(nextPendingJobs([synced, pending])).toEqual([pending]);
  });
});
