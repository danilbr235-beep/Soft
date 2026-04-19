import { Pressable, StyleSheet, Text, View } from "react-native";
import { createSymptomCheckinValue, symptomCheckinOptions } from "@pmhc/safety";
import { getCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppLanguage, QuickLogDefinition, SymptomCheckinKey } from "@pmhc/types";

type Props = {
  definition: QuickLogDefinition;
  language: AppLanguage;
  onClose: () => void;
  onSave: (definition: QuickLogDefinition, value: unknown) => void;
};

const symptomLabelsRu: Record<SymptomCheckinKey, string> = {
  all_clear: "Все спокойно",
  pain: "Боль",
  numbness: "Онемение",
  blood: "Кровь",
  injury_concern: "Травма / вопрос",
};

type QuickLogOption = {
  label: string | number;
  value: unknown;
};

export function QuickLogSheet({ definition, language, onClose, onSave }: Props) {
  const copy = getCopy(language);
  const options: QuickLogOption[] =
    definition.input === "score"
      ? [1, 3, 5, 7, 10].map((value) => ({ label: value, value }))
      : definition.input === "boolean"
        ? [
            { label: copy.common.yes, value: true },
            { label: copy.common.no, value: false },
          ]
        : symptomCheckinOptions.map((option) => ({
            label: language === "ru" ? symptomLabelsRu[option.key] : option.label,
            value: createSymptomCheckinValue(option.key),
          }));

  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{definition.label}</Text>
        <Text style={styles.subtitle}>{copy.quickLog.subtitle}</Text>
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={String(option.label)}
              accessibilityLabel={copy.quickLog.saveLabel(definition.label, option.label)}
              accessibilityRole="button"
              style={styles.option}
              onPress={() => onSave(definition, option.value)}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.close} onPress={onClose}>
          <Text style={styles.closeText}>{copy.common.notNow}</Text>
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
