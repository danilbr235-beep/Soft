import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppTab } from "../state/useAppState";

const tabs: AppTab[] = ["Today", "Track", "Learn", "Programs", "Coach", "Settings"];

type Props = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomNav({ activeTab, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const active = tab === activeTab;
        return (
          <Pressable
            key={tab}
            accessibilityLabel={`Open ${tab}`}
            accessibilityRole="button"
            onPress={() => onChange(tab)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.md,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    backgroundColor: colors.ink,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
  },
  activeTab: {
    backgroundColor: colors.panelSoft,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  activeLabel: {
    color: colors.text,
  },
});
