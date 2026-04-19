import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";

type Props = {
  copy: LanguageCopy;
  onUnlock: () => void;
};

export function PrivacyLockScreen({ copy, onUnlock }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{copy.privacyLock.eyebrow}</Text>
        <Text style={styles.title}>{copy.privacyLock.title}</Text>
        <Text style={styles.body}>{copy.privacyLock.body}</Text>
      </View>
      <Pressable
        accessibilityLabel={copy.privacyLock.unlock}
        accessibilityRole="button"
        onPress={onUnlock}
        style={styles.primary}
      >
        <Text style={styles.primaryText}>{copy.privacyLock.unlock}</Text>
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
  primary: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.moss,
  },
  primaryText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
});
