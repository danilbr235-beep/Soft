import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@pmhc/ui";

export function Surface({ children }: PropsWithChildren) {
  return <View style={styles.surface}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
