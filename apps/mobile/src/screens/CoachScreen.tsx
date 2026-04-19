import { Text } from "react-native";
import { colors } from "@pmhc/ui";
import type { CurrentPriority } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

export function CoachScreen({ priority }: { priority: CurrentPriority }) {
  return (
    <Screen title="Coach" subtitle="Rules-first explanations. No fake diagnosis, no inflated certainty.">
      <Surface>
        <Text style={{ color: colors.moss, fontWeight: "800" }}>Why this priority?</Text>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "900" }}>{priority.title}</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>{priority.whyItMatters}</Text>
        <Text style={{ color: colors.text, fontWeight: "800" }}>{priority.recommendedAction}</Text>
      </Surface>
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>Ask next</Text>
        <Text style={{ color: colors.muted }}>What should I avoid today?</Text>
        <Text style={{ color: colors.muted }}>Why did readiness change?</Text>
        <Text style={{ color: colors.muted }}>Is this enough data?</Text>
      </Surface>
    </Screen>
  );
}
