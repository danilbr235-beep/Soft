import { Pressable, StyleSheet, Text, View } from "react-native";
import { createSymptomCheckinValue, symptomCheckinOptions } from "@pmhc/safety";
import { colors, radii, spacing } from "@pmhc/ui";
import type { QuickLogDefinition } from "@pmhc/types";

type Props = {
  definition: QuickLogDefinition;
  onClose: () => void;
  onSave: (definition: QuickLogDefinition, value: unknown) => void;
};

export function QuickLogSheet({ definition, onClose, onSave }: Props) {
  const options =
    definition.input === "score"
      ? [1, 3, 5, 7, 10]
      : definition.input === "boolean"
        ? ["Yes", "No"]
        : symptomCheckinOptions.map((option) => option.label);

  function valueFor(option: string | number) {
    if (definition.input === "boolean") {
      return option === "Yes";
    }

    if (definition.input === "symptom") {
      const symptomOption = symptomCheckinOptions.find((item) => item.label === option);
      return createSymptomCheckinValue(symptomOption?.key ?? "all_clear");
    }

    return option;
  }

  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{definition.label}</Text>
        <Text style={styles.subtitle}>Log it quickly. You can add detail later if it matters.</Text>
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={String(option)}
              accessibilityLabel={`Save ${definition.label} ${option}`}
              accessibilityRole="button"
              style={styles.option}
              onPress={() => onSave(definition, valueFor(option))}
            >
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.close} onPress={onClose}>
          <Text style={styles.closeText}>Not now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(16, 19, 18, 0.72)",
  },
  sheet: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    borderColor: colors.line,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  option: {
    minWidth: 72,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderWidth: 1,
  },
  optionText: {
    color: colors.text,
    fontWeight: "800",
  },
  close: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: colors.muted,
    fontWeight: "700",
  },
});
