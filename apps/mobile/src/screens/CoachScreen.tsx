import { Text } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors } from "@pmhc/ui";
import { explainPriority } from "@pmhc/rules";
import type { AppLanguage, CurrentPriority } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

export function CoachScreen({ copy, language, priority }: { copy: LanguageCopy; language: AppLanguage; priority: CurrentPriority }) {
  const explanation = explainPriority(priority, language);

  return (
    <Screen title={copy.coach.title} subtitle={copy.coach.subtitle}>
      <Surface>
        <Text style={{ color: colors.moss, fontWeight: "800" }}>{copy.coach.whyPriority}</Text>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "900" }}>{explanation.title}</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>{explanation.explanation}</Text>
        <Text style={{ color: colors.text, fontWeight: "800" }}>{explanation.nextStep}</Text>
      </Surface>
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>{copy.coach.certainty}</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>{explanation.dataNote}</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>{explanation.confidenceNote}</Text>
      </Surface>
      {explanation.avoidToday ? (
        <Surface>
          <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>{copy.coach.keepLight}</Text>
          <Text style={{ color: colors.muted, lineHeight: 21 }}>{explanation.avoidToday}</Text>
        </Surface>
      ) : null}
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>{copy.coach.boundary}</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>{explanation.safetyNote}</Text>
      </Surface>
    </Screen>
  );
}
