import { Text } from "react-native";
import { colors } from "@pmhc/ui";
import type { Program } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

export function ProgramsScreen({ activeProgram }: { activeProgram: Program | null }) {
  return (
    <Screen title="Programs" subtitle="Guided plans stay conservative until there is enough signal.">
      <Surface>
        <Text style={{ color: colors.moss, fontWeight: "800" }}>Active</Text>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: "900" }}>{activeProgram?.title ?? "No active program"}</Text>
        <Text style={{ color: colors.muted }}>Day {activeProgram?.dayIndex ?? 0} · {activeProgram?.durationDays ?? 0} days</Text>
      </Surface>
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>Next candidates</Text>
        <Text style={{ color: colors.muted }}>Pelvic floor consistency starter</Text>
        <Text style={{ color: colors.muted }}>Sleep and environment reset</Text>
        <Text style={{ color: colors.muted }}>Confidence reset</Text>
      </Surface>
    </Screen>
  );
}
