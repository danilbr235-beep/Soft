import type { OnboardingResult, PrivacyLockState } from "@pmhc/types";

type PrivacyChoices = OnboardingResult["privacy"];

export const DEFAULT_PRIVACY_AUTO_LOCK_MS = 5 * 60 * 1000;

export function createPrivacyLockState(privacy: PrivacyChoices, updatedAt: string): PrivacyLockState {
  return {
    vaultLockEnabled: privacy.vaultLockEnabled,
    discreetNotifications: privacy.discreetNotifications,
    locked: false,
    pinHash: null,
    pinSalt: null,
    failedUnlockAttempts: 0,
    autoLockAfterMs: DEFAULT_PRIVACY_AUTO_LOCK_MS,
    lastActivityAt: privacy.vaultLockEnabled ? updatedAt : null,
    updatedAt,
  };
}

export function lockPrivacyVault(state: PrivacyLockState, updatedAt: string): PrivacyLockState {
  const normalized = normalizePrivacyLockState(state);

  if (!normalized.vaultLockEnabled) {
    return { ...normalized, locked: false, updatedAt };
  }

  return { ...normalized, locked: true, lastActivityAt: null, updatedAt };
}

export function unlockPrivacyVault(state: PrivacyLockState, updatedAt: string): PrivacyLockState {
  return {
    ...normalizePrivacyLockState(state),
    locked: false,
    failedUnlockAttempts: 0,
    lastActivityAt: updatedAt,
    updatedAt,
  };
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
    lastActivityAt: vaultLockEnabled ? normalized.lastActivityAt ?? updatedAt : null,
    updatedAt,
  };
}

export function recordPrivacyActivity(state: PrivacyLockState, updatedAt: string): PrivacyLockState {
  const normalized = normalizePrivacyLockState(state);

  if (!normalized.vaultLockEnabled || normalized.locked) {
    return normalized;
  }

  return {
    ...normalized,
    lastActivityAt: updatedAt,
    updatedAt,
  };
}

export function shouldAutoLockPrivacyVault(state: PrivacyLockState, now: string): boolean {
  const normalized = normalizePrivacyLockState(state);

  if (!normalized.vaultLockEnabled || normalized.locked || normalized.autoLockAfterMs == null || !normalized.lastActivityAt) {
    return false;
  }

  const lastActivityMs = Date.parse(normalized.lastActivityAt);
  const nowMs = Date.parse(now);

  if (Number.isNaN(lastActivityMs) || Number.isNaN(nowMs)) {
    return false;
  }

  return nowMs - lastActivityMs >= normalized.autoLockAfterMs;
}

export function lockPrivacyVaultIfInactive(state: PrivacyLockState, now: string): PrivacyLockState {
  if (!shouldAutoLockPrivacyVault(state, now)) {
    return normalizePrivacyLockState(state);
  }

  return lockPrivacyVault(state, now);
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
    lastActivityAt: null,
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
    autoLockAfterMs: state.autoLockAfterMs === undefined ? DEFAULT_PRIVACY_AUTO_LOCK_MS : state.autoLockAfterMs,
    lastActivityAt: state.lastActivityAt ?? null,
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
