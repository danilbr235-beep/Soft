import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@pmhc/ui";
import type { PrivacyLockState } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  privacyLock: PrivacyLockState;
  onLockNow: () => void;
  onToggleVaultLock: () => void;
  resetOnboarding: () => void;
};

export function SettingsScreen({ onLockNow, onToggleVaultLock, privacyLock, resetOnboarding }: Props) {
  return (
    <Screen title="Settings" subtitle="Privacy controls and discreet product behavior.">
      <Surface>
        <Text style={styles.title}>Privacy vault</Text>
        <Text style={styles.body}>
          Vault lock is {privacyLock.vaultLockEnabled ? "enabled" : "off"}. Discreet notifications are{" "}
          {privacyLock.discreetNotifications ? "enabled" : "off"}.
        </Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={privacyLock.vaultLockEnabled ? "Turn vault lock off" : "Turn vault lock on"}
            accessibilityRole="button"
            onPress={onToggleVaultLock}
            style={[styles.button, privacyLock.vaultLockEnabled && styles.activeButton]}
          >
            <Text style={styles.buttonText}>{privacyLock.vaultLockEnabled ? "Vault lock on" : "Vault lock off"}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Lock demo vault"
            accessibilityRole="button"
            disabled={!privacyLock.vaultLockEnabled}
            onPress={onLockNow}
            style={[styles.button, !privacyLock.vaultLockEnabled && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>Lock demo vault</Text>
          </Pressable>
        </View>
      </Surface>
      <Surface>
        <Text style={styles.title}>Medical boundary</Text>
        <Text style={styles.body}>
          This app supports education and tracking. It does not diagnose or replace professional care.
        </Text>
      </Surface>
      <Pressable accessibilityRole="button" onPress={resetOnboarding} style={styles.resetButton}>
        <Text style={styles.buttonText}>Reset local demo state</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  body: {
    color: colors.muted,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  button: {
    minHeight: 44,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  activeButton: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.moss,
  },
  disabledButton: {
    opacity: 0.45,
  },
  resetButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "800",
  },
});
