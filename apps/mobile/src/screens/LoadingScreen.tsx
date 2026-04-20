import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@pmhc/ui";

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.moss} size="large" />
      <Text style={styles.title}>Preparing private session</Text>
      <Text style={styles.body}>Checking local app state before anything sensitive appears.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.ink,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  body: {
    maxWidth: 320,
    color: colors.muted,
    lineHeight: 22,
    textAlign: "center",
  },
});
