import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@pmhc/ui";
import type { Program } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  activeProgram: Program | null;
  completionPercent: number;
  onCompleteToday: () => void;
};

export function ProgramsScreen({ activeProgram, completionPercent, onCompleteToday }: Props) {
  const dayLabel = activeProgram ? `Day ${activeProgram.dayIndex} of ${activeProgram.durationDays}` : "No active day";

  return (
    <Screen title="Programs" subtitle="Guided plans stay conservative until there is enough signal.">
      <Surface>
        <Text style={styles.eyebrow}>Active</Text>
        <Text style={styles.title}>{activeProgram?.title ?? "No active program"}</Text>
        <Text style={styles.body}>{dayLabel}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
        </View>
        <Text style={styles.body}>{completionPercent}% complete</Text>
        <Pressable
          accessibilityLabel="Complete program day"
          accessibilityRole="button"
          disabled={!activeProgram}
          onPress={onCompleteToday}
          style={[styles.button, !activeProgram && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Complete today</Text>
        </Pressable>
      </Surface>
      <Surface>
        <Text style={styles.sectionTitle}>Next candidates</Text>
        <Text style={styles.body}>Pelvic floor consistency starter</Text>
        <Text style={styles.body}>Sleep and environment reset</Text>
        <Text style={styles.body}>Confidence reset</Text>
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.moss,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  body: {
    color: colors.muted,
    lineHeight: 21,
  },
  progressTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: radii.sm,
    backgroundColor: colors.panelSoft,
  },
  progressFill: {
    height: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.moss,
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.moss,
    marginTop: spacing.sm,
  },
  disabledButton: {
    opacity: 0.45,
  },
  buttonText: {
    color: colors.ink,
    fontWeight: "900",
  },
});
