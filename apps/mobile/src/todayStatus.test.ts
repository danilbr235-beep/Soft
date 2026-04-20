import { describe, expect, it } from "vitest";
import { getCopy } from "@pmhc/i18n";
import type { PrivacyLockState, TodayPayload } from "@pmhc/types";
import { buildTodayStatusItems } from "./todayStatus";

const today = {
  date: "2026-04-20",
  todayMode: "Light",
  syncStatus: "synced",
  activeProgram: {
    id: "confidence-reset-14",
    title: "14-day confidence reset",
    category: "confidence",
    durationDays: 14,
    dayIndex: 1,
  },
  currentPriority: {
    domain: "baseline",
    title: "Build your baseline",
    whyItMatters: "There is not enough stable data yet for strong recommendations.",
    recommendedAction: "Log three quick signals today.",
    confidence: "low",
  },
  dailyState: [],
  alerts: [],
  actionCards: [],
  quickLogs: [],
  liveUpdates: [],
  insights: [],
} satisfies TodayPayload;

const privacyLock = {
  vaultLockEnabled: true,
  discreetNotifications: true,
  locked: false,
  pinHash: null,
  pinSalt: null,
  failedUnlockAttempts: 0,
  autoLockAfterMs: 300000,
  lastActivityAt: "2026-04-20T12:00:00.000Z",
  updatedAt: "2026-04-20T12:00:00.000Z",
} satisfies PrivacyLockState;

describe("buildTodayStatusItems", () => {
  it("builds Today status chips in a stable order", () => {
    const items = buildTodayStatusItems({
      copy: getCopy("en"),
      privacyLock,
      programTitle: "14-day confidence reset",
      today,
    });

    expect(items.map((item) => item.id)).toEqual(["mode", "sync", "privacy", "program"]);
    expect(items.map((item) => `${item.label}: ${item.value}`)).toEqual([
      "Mode: Light",
      "Sync: Up to date",
      "Privacy: Vault on",
      "Program: 14-day confidence reset",
    ]);
  });

  it("marks pending sync as attention and falls back to discreet privacy", () => {
    const items = buildTodayStatusItems({
      copy: getCopy("en"),
      privacyLock: { ...privacyLock, vaultLockEnabled: false },
      programTitle: null,
      today: { ...today, activeProgram: null, syncStatus: "pending" },
    });

    expect(items.find((item) => item.id === "sync")).toMatchObject({
      value: "Pending sync",
      tone: "attention",
    });
    expect(items.find((item) => item.id === "privacy")?.value).toBe("Discreet");
    expect(items.find((item) => item.id === "program")?.value).toBe("No active program");
  });
});
