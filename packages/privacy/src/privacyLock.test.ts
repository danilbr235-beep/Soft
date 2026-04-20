import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRIVACY_AUTO_LOCK_MS,
  clearPrivacyPin,
  createPrivacyLockState,
  hasPrivacyPin,
  lockPrivacyVaultIfInactive,
  lockPrivacyVault,
  normalizePrivacyLockState,
  recordPrivacyActivity,
  setPrivacyPin,
  shouldAutoLockPrivacyVault,
  toggleVaultLock,
  unlockPrivacyVault,
  unlockPrivacyVaultWithPin,
} from "./privacyLock";

describe("privacy lock helpers", () => {
  it("creates lock state from onboarding privacy choices", () => {
    const state = createPrivacyLockState(
      { vaultLockEnabled: true, discreetNotifications: true },
      "2026-04-19T11:00:00.000Z",
    );

    expect(state).toEqual({
      vaultLockEnabled: true,
      discreetNotifications: true,
      locked: false,
      pinHash: null,
      pinSalt: null,
      failedUnlockAttempts: 0,
      autoLockAfterMs: DEFAULT_PRIVACY_AUTO_LOCK_MS,
      lastActivityAt: "2026-04-19T11:00:00.000Z",
      updatedAt: "2026-04-19T11:00:00.000Z",
    });
  });

  it("locks and unlocks only when the vault is enabled", () => {
    const enabled = createPrivacyLockState(
      { vaultLockEnabled: true, discreetNotifications: true },
      "2026-04-19T11:00:00.000Z",
    );
    const disabled = createPrivacyLockState(
      { vaultLockEnabled: false, discreetNotifications: true },
      "2026-04-19T11:00:00.000Z",
    );

    expect(lockPrivacyVault(enabled, "2026-04-19T11:05:00.000Z").locked).toBe(true);
    expect(unlockPrivacyVault({ ...enabled, locked: true }, "2026-04-19T11:06:00.000Z").locked).toBe(false);
    expect(lockPrivacyVault(disabled, "2026-04-19T11:05:00.000Z").locked).toBe(false);
  });

  it("turns the vault off without leaving the app locked", () => {
    const state = {
      vaultLockEnabled: true,
      discreetNotifications: true,
      locked: true,
      pinHash: null,
      pinSalt: null,
      failedUnlockAttempts: 0,
      autoLockAfterMs: DEFAULT_PRIVACY_AUTO_LOCK_MS,
      lastActivityAt: "2026-04-19T11:00:00.000Z",
      updatedAt: "2026-04-19T11:00:00.000Z",
    };

    expect(toggleVaultLock(state, "2026-04-19T11:10:00.000Z")).toEqual({
      vaultLockEnabled: false,
      discreetNotifications: true,
      locked: false,
      pinHash: null,
      pinSalt: null,
      failedUnlockAttempts: 0,
      autoLockAfterMs: DEFAULT_PRIVACY_AUTO_LOCK_MS,
      lastActivityAt: null,
      updatedAt: "2026-04-19T11:10:00.000Z",
    });
  });

  it("normalizes older lock state that does not have PIN fields yet", () => {
    const legacyState = {
      vaultLockEnabled: true,
      discreetNotifications: true,
      locked: true,
      updatedAt: "2026-04-19T11:00:00.000Z",
    };

    expect(normalizePrivacyLockState(legacyState)).toEqual({
      vaultLockEnabled: true,
      discreetNotifications: true,
      locked: true,
      pinHash: null,
      pinSalt: null,
      failedUnlockAttempts: 0,
      autoLockAfterMs: DEFAULT_PRIVACY_AUTO_LOCK_MS,
      lastActivityAt: null,
      updatedAt: "2026-04-19T11:00:00.000Z",
    });
  });

  it("stores a local PIN digest without keeping the raw PIN", () => {
    const state = createPrivacyLockState(
      { vaultLockEnabled: true, discreetNotifications: true },
      "2026-04-19T11:00:00.000Z",
    );

    const secured = setPrivacyPin(state, "1234", "2026-04-19T11:12:00.000Z", "test-salt");

    expect(hasPrivacyPin(secured)).toBe(true);
    expect(secured.pinHash).toBeTruthy();
    expect(secured.pinHash).not.toContain("1234");
    expect(secured.pinSalt).toBe("test-salt");
  });

  it("clears a local PIN and resets failed attempts", () => {
    const secured = setPrivacyPin(
      createPrivacyLockState(
        { vaultLockEnabled: true, discreetNotifications: true },
        "2026-04-19T11:00:00.000Z",
      ),
      "1234",
      "2026-04-19T11:12:00.000Z",
      "test-salt",
    );

    expect(clearPrivacyPin({ ...secured, failedUnlockAttempts: 2 }, "2026-04-19T11:16:00.000Z")).toMatchObject({
      pinHash: null,
      pinSalt: null,
      failedUnlockAttempts: 0,
      updatedAt: "2026-04-19T11:16:00.000Z",
    });
  });

  it("unlocks with the correct PIN and keeps the vault locked on a wrong PIN", () => {
    const state = setPrivacyPin(
      createPrivacyLockState(
        { vaultLockEnabled: true, discreetNotifications: true },
        "2026-04-19T11:00:00.000Z",
      ),
      "1234",
      "2026-04-19T11:12:00.000Z",
      "test-salt",
    );
    const locked = lockPrivacyVault(state, "2026-04-19T11:13:00.000Z");

    const failed = unlockPrivacyVaultWithPin(locked, "0000", "2026-04-19T11:14:00.000Z");
    const unlocked = unlockPrivacyVaultWithPin(failed.state, "1234", "2026-04-19T11:15:00.000Z");

    expect(failed).toMatchObject({
      unlocked: false,
      state: {
        locked: true,
        failedUnlockAttempts: 1,
      },
    });
    expect(unlocked).toMatchObject({
      unlocked: true,
      state: {
        locked: false,
        failedUnlockAttempts: 0,
      },
    });
  });

  it("records activity and does not auto-lock while activity is fresh", () => {
    const active = recordPrivacyActivity(
      createPrivacyLockState(
        { vaultLockEnabled: true, discreetNotifications: true },
        "2026-04-19T11:00:00.000Z",
      ),
      "2026-04-19T11:02:00.000Z",
    );

    expect(active.lastActivityAt).toBe("2026-04-19T11:02:00.000Z");
    expect(shouldAutoLockPrivacyVault(active, "2026-04-19T11:04:59.000Z")).toBe(false);
  });

  it("auto-locks an enabled unlocked vault after the inactivity window", () => {
    const active = recordPrivacyActivity(
      createPrivacyLockState(
        { vaultLockEnabled: true, discreetNotifications: true },
        "2026-04-19T11:00:00.000Z",
      ),
      "2026-04-19T11:00:00.000Z",
    );

    expect(shouldAutoLockPrivacyVault(active, "2026-04-19T11:05:01.000Z")).toBe(true);
    expect(lockPrivacyVaultIfInactive(active, "2026-04-19T11:05:01.000Z")).toMatchObject({
      locked: true,
      updatedAt: "2026-04-19T11:05:01.000Z",
    });
  });

  it("does not auto-lock when the vault is disabled, already locked, or timeout is off", () => {
    const disabled = createPrivacyLockState(
      { vaultLockEnabled: false, discreetNotifications: true },
      "2026-04-19T11:00:00.000Z",
    );
    const enabled = createPrivacyLockState(
      { vaultLockEnabled: true, discreetNotifications: true },
      "2026-04-19T11:00:00.000Z",
    );

    expect(shouldAutoLockPrivacyVault(disabled, "2026-04-19T12:00:00.000Z")).toBe(false);
    expect(shouldAutoLockPrivacyVault({ ...enabled, locked: true }, "2026-04-19T12:00:00.000Z")).toBe(false);
    expect(shouldAutoLockPrivacyVault({ ...enabled, autoLockAfterMs: null }, "2026-04-19T12:00:00.000Z")).toBe(false);
  });
});
