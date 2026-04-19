import { Text, View } from "react-native";
import { colors, spacing } from "@pmhc/ui";
import type { ContentItem } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

export function LearnScreen({ content }: { content: ContentItem[] }) {
  return (
    <Screen title="Learn" subtitle="Curated material tied to the current state, not a random link library.">
      {content.map((item) => (
        <Surface key={item.id}>
          <View style={{ gap: spacing.xs }}>
            <Text style={{ color: colors.moss, fontWeight: "800", textTransform: "uppercase" }}>{item.trustLevel}</Text>
            <Text style={{ color: colors.text, fontWeight: "900", fontSize: 20 }}>{item.title}</Text>
            <Text style={{ color: colors.muted, lineHeight: 21 }}>{item.translatedSummaryRu ?? item.summary}</Text>
            <Text style={{ color: colors.steel }}>{item.durationMinutes} min · {item.sourceName}</Text>
          </View>
        </Surface>
      ))}
    </Screen>
  );
}
