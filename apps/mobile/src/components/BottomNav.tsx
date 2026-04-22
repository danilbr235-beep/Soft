import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppTab } from "../state/useAppState";

const tabs: AppTab[] = ["Today", "Track", "Review", "Learn", "Programs", "Coach", "Settings"];
const tabIcons: Record<AppTab, keyof typeof MaterialIcons.glyphMap> = {
  Today: "today",
  Track: "show-chart",
  Review: "fact-check",
  Learn: "school",
  Programs: "event-note",
  Coach: "forum",
  Settings: "settings",
};

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
            <MaterialIcons
              color={active ? colors.text : colors.muted}
              name={tabIcons[tab]}
              size={16}
              style={styles.icon}
            />
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
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    gap: 2,
    paddingVertical: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.panelSoft,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "600",
  },
  icon: {
    marginBottom: 1,
  },
  activeLabel: {
    color: colors.text,
  },
});
