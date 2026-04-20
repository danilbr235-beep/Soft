import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";

type Props = {
  copy: LanguageCopy;
  failedAttempts: number;
  hasPrivacyPin: boolean;
  onUnlock: (pin: string) => Promise<boolean>;
};

export function PrivacyLockScreen({ copy, failedAttempts, hasPrivacyPin, onUnlock }: Props) {
  const [pin, setPin] = useState("");
  const [showLocalError, setShowLocalError] = useState(false);
  const normalizedPin = pin.replace(/\D/g, "").slice(0, 8);
  const canUnlock = !hasPrivacyPin || normalizedPin.length >= 4;
  const shouldShowError = showLocalError || failedAttempts > 0;

  async function unlock() {
    if (!canUnlock) {
      return;
    }

    const unlocked = await onUnlock(normalizedPin);
    setShowLocalError(!unlocked);

    if (unlocked) {
      setPin("");
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{copy.privacyLock.eyebrow}</Text>
        <Text style={styles.title}>{copy.privacyLock.title}</Text>
        <Text style={styles.body}>{copy.privacyLock.body}</Text>
        {hasPrivacyPin ? (
          <View style={styles.pinBlock}>
            <Text style={styles.body}>{copy.privacyLock.pinPrompt}</Text>
            <TextInput
              accessibilityLabel={copy.privacyLock.pinPlaceholder}
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={8}
              onChangeText={(value) => {
                setPin(value.replace(/\D/g, "").slice(0, 8));
                setShowLocalError(false);
              }}
              placeholder={copy.privacyLock.pinPlaceholder}
              placeholderTextColor={colors.steel}
              secureTextEntry
              style={styles.input}
              value={normalizedPin}
            />
            {shouldShowError ? <Text style={styles.error}>{copy.privacyLock.wrongPin}</Text> : null}
          </View>
        ) : null}
      </View>
      <Pressable
        accessibilityLabel={hasPrivacyPin ? copy.privacyLock.unlockWithPin : copy.privacyLock.unlock}
        accessibilityRole="button"
        disabled={!canUnlock}
        onPress={unlock}
        style={[styles.primary, !canUnlock && styles.disabledPrimary]}
      >
        <Text style={styles.primaryText}>{hasPrivacyPin ? copy.privacyLock.unlockWithPin : copy.privacyLock.unlock}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.xl,
    backgroundColor: colors.ink,
  },
  copy: {
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  eyebrow: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  pinBlock: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  input: {
    minHeight: 52,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    paddingHorizontal: spacing.md,
  },
  error: {
    color: colors.coral,
    fontWeight: "800",
    lineHeight: 20,
  },
  primary: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.moss,
  },
  disabledPrimary: {
    opacity: 0.45,
  },
  primaryText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
});
