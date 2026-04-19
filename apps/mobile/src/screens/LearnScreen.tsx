import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppLanguage, ContentItem } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  content: ContentItem[];
  copy: LanguageCopy;
  language: AppLanguage;
  onToggleSaved: (itemId: string) => void;
  onMarkCompleted: (itemId: string) => void;
};

export function LearnScreen({ content, copy, language, onMarkCompleted, onToggleSaved }: Props) {
  return (
    <Screen title={copy.learn.title} subtitle={copy.learn.subtitle}>
      {content.map((item) => {
        const title = language === "ru" ? item.translatedTitleRu ?? item.title : item.title;
        const summary = language === "ru" ? item.translatedSummaryRu ?? item.summary : item.summary;
        const saveAction = item.saved ? copy.learn.unsave : copy.learn.save;
        const completeAction = item.completed ? copy.learn.completed : copy.learn.markComplete;

        return (
          <Surface key={item.id}>
            <View style={{ gap: spacing.xs }}>
              <Text style={{ color: colors.moss, fontWeight: "800", textTransform: "uppercase" }}>
                {item.trustLevel}
              </Text>
              <Text style={{ color: colors.text, fontWeight: "900", fontSize: 20 }}>{title}</Text>
              <Text style={{ color: colors.muted, lineHeight: 21 }}>{summary}</Text>
              <Text style={{ color: colors.steel }}>
                {copy.common.minutes(item.durationMinutes)} - {item.sourceName}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  accessibilityLabel={`${saveAction} ${title}`}
                  accessibilityRole="button"
                  onPress={() => onToggleSaved(item.id)}
                  style={[styles.button, item.saved && styles.activeButton]}
                >
                  <Text style={styles.buttonText}>{item.saved ? copy.learn.saved : copy.learn.save}</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={`${completeAction} ${title}`}
                  accessibilityRole="button"
                  disabled={item.completed}
                  onPress={() => onMarkCompleted(item.id)}
                  style={[styles.button, item.completed && styles.activeButton]}
                >
                  <Text style={styles.buttonText}>{item.completed ? copy.learn.completed : copy.learn.markComplete}</Text>
                </Pressable>
              </View>
            </View>
          </Surface>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    minHeight: 44,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  activeButton: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.moss,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "800",
  },
});
