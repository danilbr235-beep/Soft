import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@pmhc/ui";

type Props = {
  onRecover: () => void;
  recovering: boolean;
};

export function ErrorRecoveryScreen({ onRecover, recovering }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>Recovery mode</Text>
        <Text style={styles.title}>Soft hit a startup snag</Text>
        <Text style={styles.body}>
          Something in the local demo state blocked the app from opening cleanly. You can clear local app state and
          restart without touching anything outside Soft.
        </Text>
        <Pressable
          accessibilityLabel="Clear local app state and restart"
          accessibilityRole="button"
          disabled={recovering}
          onPress={onRecover}
          style={[styles.button, recovering && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>{recovering ? "Restarting..." : "Clear local app state and restart"}</Text>
        </Pressable>
        <Text style={styles.note}>This only clears local demo data stored by this app.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.ink,
  },
  panel: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.panel,
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
  },
  body: {
    color: colors.muted,
    lineHeight: 22,
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.moss,
    paddingHorizontal: spacing.md,
  },
  disabledButton: {
    opacity: 0.55,
  },
  buttonText: {
    color: colors.ink,
    fontWeight: "900",
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
