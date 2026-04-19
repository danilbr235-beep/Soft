import type { OnboardingResult, PrivacyLockState } from "@pmhc/types";

type PrivacyChoices = OnboardingResult["privacy"];

export function createPrivacyLockState(privacy: PrivacyChoices, updatedAt: string): PrivacyLockState {
  return {
    vaultLockEnabled: privacy.vaultLockEnabled,
    discreetNotifications: privacy.discreetNotifications,
    locked: false,
    updatedAt,
  };
}

export function lockPrivacyVault(state: PrivacyLockState, updatedAt: string): PrivacyLockState {
  if (!state.vaultLockEnabled) {
    return { ...state, locked: false, updatedAt };
  }

  return { ...state, locked: true, updatedAt };
}

export function unlockPrivacyVault(state: PrivacyLockState, updatedAt: string): PrivacyLockState {
  return { ...state, locked: false, updatedAt };
}

export function toggleVaultLock(state: PrivacyLockState, updatedAt: string): PrivacyLockState {
  const vaultLockEnabled = !state.vaultLockEnabled;

  return {
    ...state,
    vaultLockEnabled,
    locked: vaultLockEnabled ? state.locked : false,
    updatedAt,
  };
}
