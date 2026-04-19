import { Pressable, StyleSheet, Text, View } from "react-native";
import { languageName, type LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppLanguage, PrivacyLockState } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  privacyLock: PrivacyLockState;
  copy: LanguageCopy;
  language: AppLanguage;
  onChangeLanguage: (language: AppLanguage) => void;
  onLockNow: () => void;
  onToggleVaultLock: () => void;
  resetOnboarding: () => void;
};

export function SettingsScreen({
  copy,
  language,
  onChangeLanguage,
  onLockNow,
  onToggleVaultLock,
  privacyLock,
  resetOnboarding,
}: Props) {
  return (
    <Screen title={copy.settings.title} subtitle={copy.settings.subtitle}>
      <Surface>
        <Text style={styles.title}>{copy.settings.languageTitle}</Text>
        <Text style={styles.body}>{copy.settings.languageBody}</Text>
        <View style={styles.actions}>
          {(["en", "ru"] as AppLanguage[]).map((option) => (
            <Pressable
              key={option}
              accessibilityLabel={option === "en" ? copy.common.useEnglish : copy.common.useRussian}
              accessibilityRole="button"
              onPress={() => onChangeLanguage(option)}
              style={[styles.button, language === option && styles.activeButton]}
            >
              <Text style={styles.buttonText}>{languageName(option)}</Text>
            </Pressable>
          ))}
        </View>
      </Surface>
      <Surface>
        <Text style={styles.title}>{copy.settings.privacyVault}</Text>
        <Text style={styles.body}>{copy.settings.vaultStatus(privacyLock.vaultLockEnabled, privacyLock.discreetNotifications)}</Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={privacyLock.vaultLockEnabled ? copy.settings.turnVaultOff : copy.settings.turnVaultOn}
            accessibilityRole="button"
            onPress={onToggleVaultLock}
            style={[styles.button, privacyLock.vaultLockEnabled && styles.activeButton]}
          >
            <Text style={styles.buttonText}>{privacyLock.vaultLockEnabled ? copy.settings.vaultOn : copy.settings.vaultOff}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={copy.settings.lockDemoVault}
            accessibilityRole="button"
            disabled={!privacyLock.vaultLockEnabled}
            onPress={onLockNow}
            style={[styles.button, !privacyLock.vaultLockEnabled && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>{copy.settings.lockDemoVault}</Text>
          </Pressable>
        </View>
      </Surface>
      <Surface>
        <Text style={styles.title}>{copy.settings.medicalBoundary}</Text>
        <Text style={styles.body}>{copy.settings.medicalBoundaryBody}</Text>
      </Surface>
      <Pressable accessibilityRole="button" onPress={resetOnboarding} style={styles.resetButton}>
        <Text style={styles.buttonText}>{copy.settings.reset}</Text>
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
