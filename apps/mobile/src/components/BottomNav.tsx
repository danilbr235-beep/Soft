import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppTab } from "../state/useAppState";

const tabs: AppTab[] = ["Today", "Track", "Review", "Learn", "Programs", "Coach", "Settings"];

type Props = {
  activeTab: AppTab;
  copy: LanguageCopy;
  onChange: (tab: AppTab) => void;
};

export function BottomNav({ activeTab, copy, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const active = tab === activeTab;
        return (
          <Pressable
            key={tab}
            accessibilityLabel={copy.nav.openLabels[tab]}
            accessibilityRole="button"
            onPress={() => onChange(tab)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
              {copy.nav.labels[tab]}
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
    minWidth: 0,
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
    fontSize: 10,
    fontWeight: "600",
  },
  activeLabel: {
    color: colors.text,
  },
});
