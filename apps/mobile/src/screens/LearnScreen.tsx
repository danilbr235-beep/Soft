import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@pmhc/ui";
import type { ContentItem } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  content: ContentItem[];
  onToggleSaved: (itemId: string) => void;
  onMarkCompleted: (itemId: string) => void;
};

export function LearnScreen({ content, onMarkCompleted, onToggleSaved }: Props) {
  return (
    <Screen title="Learn" subtitle="Curated material tied to the current state, not a random link library.">
      {content.map((item) => (
        <Surface key={item.id}>
          <View style={{ gap: spacing.xs }}>
            <Text style={{ color: colors.moss, fontWeight: "800", textTransform: "uppercase" }}>
              {item.trustLevel}
            </Text>
            <Text style={{ color: colors.text, fontWeight: "900", fontSize: 20 }}>{item.title}</Text>
            <Text style={{ color: colors.muted, lineHeight: 21 }}>{item.translatedSummaryRu ?? item.summary}</Text>
            <Text style={{ color: colors.steel }}>
              {item.durationMinutes} min - {item.sourceName}
            </Text>
            <View style={styles.actions}>
              <Pressable
                accessibilityLabel={`${item.saved ? "Unsave" : "Save"} ${item.title}`}
                accessibilityRole="button"
                onPress={() => onToggleSaved(item.id)}
                style={[styles.button, item.saved && styles.activeButton]}
              >
                <Text style={styles.buttonText}>{item.saved ? "Saved" : "Save"}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={item.completed ? `Completed ${item.title}` : `Mark complete ${item.title}`}
                accessibilityRole="button"
                disabled={item.completed}
                onPress={() => onMarkCompleted(item.id)}
                style={[styles.button, item.completed && styles.activeButton]}
              >
                <Text style={styles.buttonText}>{item.completed ? "Completed" : "Mark complete"}</Text>
              </Pressable>
            </View>
          </View>
        </Surface>
      ))}
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
