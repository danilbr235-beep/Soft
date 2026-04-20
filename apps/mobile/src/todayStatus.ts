import type { LanguageCopy } from "@pmhc/i18n";
import type { PrivacyLockState, TodayPayload } from "@pmhc/types";

export type TodayStatusItemId = "mode" | "sync" | "privacy" | "program";
export type TodayStatusTone = "neutral" | "good" | "attention";

export type TodayStatusItem = {
  id: TodayStatusItemId;
  label: string;
  value: string;
  tone: TodayStatusTone;
};

type BuildTodayStatusItemsInput = {
  copy: LanguageCopy;
  privacyLock: PrivacyLockState;
  programTitle: string | null;
  today: TodayPayload;
};

export function buildTodayStatusItems({
  copy,
  privacyLock,
  programTitle,
  today,
}: BuildTodayStatusItemsInput): TodayStatusItem[] {
  return [
    {
      id: "mode",
      label: copy.today.status.labels.mode,
      value: copy.today.status.modes[today.todayMode],
      tone: today.todayMode === "Light" ? "attention" : "neutral",
    },
    {
      id: "sync",
      label: copy.today.status.labels.sync,
      value: copy.today.status.sync[today.syncStatus],
      tone: today.syncStatus === "synced" ? "good" : "attention",
    },
    {
      id: "privacy",
      label: copy.today.status.labels.privacy,
      value: privacyValue(copy, privacyLock),
      tone: privacyLock.vaultLockEnabled || privacyLock.discreetNotifications ? "good" : "neutral",
    },
    {
      id: "program",
      label: copy.today.status.labels.program,
      value: programTitle ?? copy.today.noActiveProgram,
      tone: programTitle ? "neutral" : "attention",
    },
  ];
}

function privacyValue(copy: LanguageCopy, privacyLock: PrivacyLockState) {
  if (privacyLock.vaultLockEnabled) {
    return copy.today.status.privacy.vaultOn;
  }

  if (privacyLock.discreetNotifications) {
    return copy.today.status.privacy.discreet;
  }

  return copy.today.status.privacy.standard;
}
