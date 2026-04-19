import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { Program } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  activeProgram: Program | null;
  copy: LanguageCopy;
  completionPercent: number;
  onCompleteToday: () => void;
};

export function ProgramsScreen({ activeProgram, copy, completionPercent, onCompleteToday }: Props) {
  const dayLabel = activeProgram ? copy.programs.dayOf(activeProgram.dayIndex, activeProgram.durationDays) : copy.programs.noActiveDay;
  const programTitle = activeProgram
    ? copy.programs.programTitles[activeProgram.id] ?? activeProgram.title
    : copy.programs.noActiveProgram;

  return (
    <Screen title={copy.programs.title} subtitle={copy.programs.subtitle}>
      <Surface>
        <Text style={styles.eyebrow}>{copy.programs.active}</Text>
        <Text style={styles.title}>{programTitle}</Text>
        <Text style={styles.body}>{dayLabel}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
        </View>
        <Text style={styles.body}>{copy.programs.percentComplete(completionPercent)}</Text>
        <Pressable
          accessibilityLabel={copy.programs.completeProgramDay}
          accessibilityRole="button"
          disabled={!activeProgram}
          onPress={onCompleteToday}
          style={[styles.button, !activeProgram && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>{copy.programs.completeToday}</Text>
        </Pressable>
      </Surface>
      <Surface>
        <Text style={styles.sectionTitle}>{copy.programs.nextCandidates}</Text>
        {copy.programs.candidates.map((candidate) => (
          <Text key={candidate} style={styles.body}>{candidate}</Text>
        ))}
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
