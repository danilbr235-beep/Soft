import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@pmhc/ui";

type Props = {
  onUnlock: () => void;
};

export function PrivacyLockScreen({ onUnlock }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Private session</Text>
        <Text style={styles.title}>Soft is locked</Text>
        <Text style={styles.body}>Sensitive details are hidden until you unlock the demo vault.</Text>
      </View>
      <Pressable
        accessibilityLabel="Unlock demo vault"
        accessibilityRole="button"
        onPress={onUnlock}
        style={styles.primary}
      >
        <Text style={styles.primaryText}>Unlock demo vault</Text>
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
