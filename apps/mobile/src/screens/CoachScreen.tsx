import { Text } from "react-native";
import { colors } from "@pmhc/ui";
import { explainPriority } from "@pmhc/rules";
import type { CurrentPriority } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

export function CoachScreen({ priority }: { priority: CurrentPriority }) {
  const explanation = explainPriority(priority);

  return (
    <Screen title="Coach" subtitle="Rules-first explanations. No fake diagnosis, no inflated certainty.">
      <Surface>
        <Text style={{ color: colors.moss, fontWeight: "800" }}>Why this priority?</Text>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "900" }}>{explanation.title}</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>{explanation.explanation}</Text>
        <Text style={{ color: colors.text, fontWeight: "800" }}>{explanation.nextStep}</Text>
      </Surface>
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>How certain is this?</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>{explanation.dataNote}</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>{explanation.confidenceNote}</Text>
      </Surface>
      {explanation.avoidToday ? (
        <Surface>
          <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>Keep light today</Text>
          <Text style={{ color: colors.muted, lineHeight: 21 }}>{explanation.avoidToday}</Text>
        </Surface>
      ) : null}
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>Boundary</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>{explanation.safetyNote}</Text>
      </Surface>
    </Screen>
  );
}
