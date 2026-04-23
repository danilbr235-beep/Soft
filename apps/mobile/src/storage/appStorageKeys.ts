export const appStorageKeys = [
  "pmhc:onboarding-complete",
  "pmhc:quick-logs",
  "pmhc:sync-queue",
  "pmhc:content-progress",
  "pmhc:privacy-lock",
  "pmhc:program-progress",
  "pmhc:program-history",
  "pmhc:review-packets",
  "pmhc:daily-session",
  "pmhc:morning-routine",
] as const;

export const debugStorageKeys = ["pmhc:debug-force-error"] as const;

export const recoverableStorageKeys = [...appStorageKeys, ...debugStorageKeys] as const;
