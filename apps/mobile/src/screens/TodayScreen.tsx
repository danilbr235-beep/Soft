import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@pmhc/ui";
import type { QuickLogDefinition, TodayPayload } from "@pmhc/types";
import { AlertStrip, PriorityCard, QuickLogRow, StateGrid } from "../components/TodayComponents";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  today: TodayPayload;
  onAskCoach: () => void;
  onLog: (definition: QuickLogDefinition) => void;
};

export function TodayScreen({ onAskCoach, onLog, today }: Props) {
  return (
    <Screen eyebrow={today.todayMode} title="Today" subtitle={`${today.activeProgram?.title ?? "No active program"} · ${today.syncStatus}`}>
      <PriorityCard priority={today.currentPriority} onAskCoach={onAskCoach} />
      <StateGrid tiles={today.dailyState} />
      <AlertStrip alerts={today.alerts} />
      <View style={styles.actions}>
        {today.actionCards.map((card) => (
          <Surface key={card.id}>
            <Text style={styles.actionKind}>{card.kind}</Text>
            <Text style={styles.actionTitle}>{card.title}</Text>
            <Text style={styles.actionBody}>{card.description}</Text>
          </Surface>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick log</Text>
        <QuickLogRow logs={today.quickLogs} onLog={onLog} />
      </View>
      <Surface>
        <Text style={styles.sectionTitle}>Live update</Text>
        <Text style={styles.actionTitle}>{today.liveUpdates[0]?.title}</Text>
        <Text style={styles.actionBody}>{today.liveUpdates[0]?.sourceLabel}</Text>
      </Surface>
      <Surface>
        <Text style={styles.sectionTitle}>Insight</Text>
        <Text style={styles.actionTitle}>{today.insights[0]?.title}</Text>
        <Text style={styles.actionBody}>{today.insights[0]?.summary}</Text>
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  actionKind: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  actionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  actionBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
