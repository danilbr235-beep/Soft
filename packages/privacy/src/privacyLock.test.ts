import { describe, expect, it } from "vitest";
import {
  createPrivacyLockState,
  lockPrivacyVault,
  toggleVaultLock,
  unlockPrivacyVault,
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
      updatedAt: "2026-04-19T11:00:00.000Z",
    };

    expect(toggleVaultLock(state, "2026-04-19T11:10:00.000Z")).toEqual({
      vaultLockEnabled: false,
      discreetNotifications: true,
      locked: false,
      updatedAt: "2026-04-19T11:10:00.000Z",
    });
  });
});
