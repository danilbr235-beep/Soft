import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { languageName, type LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppLanguage, PrivacyLockState } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  privacyLock: PrivacyLockState;
  hasPrivacyPin: boolean;
  copy: LanguageCopy;
  language: AppLanguage;
  onChangeLanguage: (language: AppLanguage) => void;
  onClearPrivacyPin: () => void;
  onLockNow: () => void;
  onSetPrivacyPin: (pin: string) => void;
  onToggleVaultLock: () => void;
  resetOnboarding: () => void;
};

export function SettingsScreen({
  copy,
  hasPrivacyPin,
  language,
  onChangeLanguage,
  onClearPrivacyPin,
  onLockNow,
  onSetPrivacyPin,
  onToggleVaultLock,
  privacyLock,
  resetOnboarding,
}: Props) {
  const [pinDraft, setPinDraft] = useState("");
  const normalizedPin = pinDraft.replace(/\D/g, "").slice(0, 8);
  const canSavePin = normalizedPin.length >= 4;

  function savePin() {
    if (!canSavePin) {
      return;
    }

    onSetPrivacyPin(normalizedPin);
    setPinDraft("");
  }

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
        <Text style={styles.statusText}>{hasPrivacyPin ? copy.settings.pinIsSet : copy.settings.pinNotSet}</Text>
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
        <Text style={styles.title}>{copy.settings.pinTitle}</Text>
        <Text style={styles.body}>{copy.settings.pinBody}</Text>
        <TextInput
          accessibilityLabel={copy.settings.pinPlaceholder}
          inputMode="numeric"
          keyboardType="number-pad"
          maxLength={8}
          onChangeText={(value) => setPinDraft(value.replace(/\D/g, "").slice(0, 8))}
          placeholder={copy.settings.pinPlaceholder}
          placeholderTextColor={colors.steel}
          secureTextEntry
          style={styles.input}
          value={normalizedPin}
        />
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={hasPrivacyPin ? copy.settings.updatePin : copy.settings.savePin}
            accessibilityRole="button"
            disabled={!canSavePin}
            onPress={savePin}
            style={[styles.button, canSavePin && styles.activeButton, !canSavePin && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>{hasPrivacyPin ? copy.settings.updatePin : copy.settings.savePin}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={copy.settings.clearPin}
            accessibilityRole="button"
            disabled={!hasPrivacyPin}
            onPress={onClearPrivacyPin}
            style={[styles.button, !hasPrivacyPin && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>{copy.settings.clearPin}</Text>
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
  statusText: {
    color: colors.amber,
    fontWeight: "800",
    lineHeight: 20,
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
  input: {
    minHeight: 48,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: spacing.md,
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
