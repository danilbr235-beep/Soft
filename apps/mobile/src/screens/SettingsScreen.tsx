import { Pressable, Text } from "react-native";
import { colors, radii, spacing } from "@pmhc/ui";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

export function SettingsScreen({ resetOnboarding }: { resetOnboarding: () => void }) {
  return (
    <Screen title="Settings" subtitle="Privacy controls and discreet product behavior.">
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "900", fontSize: 20 }}>Privacy vault</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>Vault lock, discreet notifications, and protected sections are designed into the shell for the next implementation slice.</Text>
      </Surface>
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "900", fontSize: 20 }}>Medical boundary</Text>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>This app supports education and tracking. It does not diagnose or replace professional care.</Text>
      </Surface>
      <Pressable
        onPress={resetOnboarding}
        style={{
          minHeight: 48,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.line,
          alignItems: "center",
          justifyContent: "center",
          marginTop: spacing.sm,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "800" }}>Reset local demo state</Text>
      </Pressable>
    </Screen>
  );
}
