import type { OnboardingResult, PrivacyLockState } from "@pmhc/types";

type PrivacyChoices = OnboardingResult["privacy"];

export function createPrivacyLockState(privacy: PrivacyChoices, updatedAt: string): PrivacyLockState {
  return {
    vaultLockEnabled: privacy.vaultLockEnabled,
    discreetNotifications: privacy.discreetNotifications,
    locked: false,
    pinHash: null,
    pinSalt: null,
    failedUnlockAttempts: 0,
    updatedAt,
  };
}

export function lockPrivacyVault(state: PrivacyLockState, updatedAt: string): PrivacyLockState {
  const normalized = normalizePrivacyLockState(state);

  if (!normalized.vaultLockEnabled) {
    return { ...normalized, locked: false, updatedAt };
  }

  return { ...normalized, locked: true, updatedAt };
}

export function unlockPrivacyVault(state: PrivacyLockState, updatedAt: string): PrivacyLockState {
  return { ...normalizePrivacyLockState(state), locked: false, failedUnlockAttempts: 0, updatedAt };
}

export function unlockPrivacyVaultWithPin(
  state: PrivacyLockState,
  pin: string,
  updatedAt: string,
): { state: PrivacyLockState; unlocked: boolean } {
  const normalized = normalizePrivacyLockState(state);

  if (!hasPrivacyPin(normalized)) {
    return {
      state: unlockPrivacyVault(normalized, updatedAt),
      unlocked: true,
    };
  }

  if (createPinDigest(pin, normalized.pinSalt) === normalized.pinHash) {
    return {
      state: unlockPrivacyVault(normalized, updatedAt),
      unlocked: true,
    };
  }

  return {
    state: {
      ...normalized,
      locked: true,
      failedUnlockAttempts: normalized.failedUnlockAttempts + 1,
      updatedAt,
    },
    unlocked: false,
  };
}

export function toggleVaultLock(state: PrivacyLockState, updatedAt: string): PrivacyLockState {
  const normalized = normalizePrivacyLockState(state);
  const vaultLockEnabled = !normalized.vaultLockEnabled;

  return {
    ...normalized,
    vaultLockEnabled,
    locked: vaultLockEnabled ? state.locked : false,
    failedUnlockAttempts: vaultLockEnabled ? normalized.failedUnlockAttempts : 0,
    updatedAt,
  };
}

export function setPrivacyPin(
  state: PrivacyLockState,
  pin: string,
  updatedAt: string,
  salt = createPinSalt(updatedAt),
): PrivacyLockState {
  const normalizedPin = normalizePin(pin);

  return {
    ...normalizePrivacyLockState(state),
    pinHash: createPinDigest(normalizedPin, salt),
    pinSalt: salt,
    failedUnlockAttempts: 0,
    updatedAt,
  };
}

export function clearPrivacyPin(state: PrivacyLockState, updatedAt: string): PrivacyLockState {
  return {
    ...normalizePrivacyLockState(state),
    pinHash: null,
    pinSalt: null,
    failedUnlockAttempts: 0,
    updatedAt,
  };
}

export function hasPrivacyPin(state: PrivacyLockState): boolean {
  const normalized = normalizePrivacyLockState(state);
  return Boolean(normalized.pinHash && normalized.pinSalt);
}

export function normalizePrivacyLockState(state: Partial<PrivacyLockState>): PrivacyLockState {
  return {
    vaultLockEnabled: state.vaultLockEnabled ?? false,
    discreetNotifications: state.discreetNotifications ?? true,
    locked: state.locked ?? false,
    pinHash: state.pinHash ?? null,
    pinSalt: state.pinSalt ?? null,
    failedUnlockAttempts: state.failedUnlockAttempts ?? 0,
    updatedAt: state.updatedAt ?? "",
  };
}

function normalizePin(pin: string) {
  return pin.replace(/\D/g, "").slice(0, 8);
}

function createPinSalt(updatedAt: string) {
  return `local-demo-${updatedAt}`;
}

function createPinDigest(pin: string, salt: string | null) {
  const input = `${salt ?? ""}:${normalizePin(pin)}`;
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `demo-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
