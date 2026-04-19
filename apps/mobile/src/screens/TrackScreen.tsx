import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { buildTrackingSnapshot } from "@pmhc/tracking";
import { colors, radii, spacing } from "@pmhc/ui";
import type { LogEntry, QuickLogDefinition } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";
import { QuickLogRow } from "../components/TodayComponents";

const manualLogTypes: Array<Pick<QuickLogDefinition, "type" | "input">> = [
  { type: "energy", input: "score" },
  { type: "sleep_quality", input: "score" },
  { type: "symptom_checkin", input: "symptom" },
  { type: "pelvic_floor_done", input: "boolean" },
  { type: "pump_done", input: "boolean" },
];

export function TrackScreen({
  logs,
  copy,
  onLog,
  onSync,
  pendingSyncCount,
}: {
  logs: LogEntry[];
  copy: LanguageCopy;
  onLog: (definition: QuickLogDefinition) => void;
  onSync: () => void;
  pendingSyncCount: number;
}) {
  const manualLogs = manualLogTypes.map((log) => ({
    ...log,
    label: copy.quickLog.labels[log.type],
  }));
  const snapshot = buildTrackingSnapshot(logs);

  return (
    <Screen title={copy.track.title} subtitle={copy.track.subtitle}>
      <QuickLogRow accessibilityPrefix={copy.today.quickLog} logs={manualLogs} onLog={onLog} />
      <Surface>
        <Text style={styles.title}>{copy.track.snapshotTitle}</Text>
        <Text style={styles.body}>{copy.track.snapshotCounts(snapshot.logsToday, snapshot.logsThisWeek)}</Text>
        {snapshot.latestLogAt ? null : <Text style={styles.body}>{copy.track.noTrendYet}</Text>}
        <View style={styles.signalGrid}>
          {snapshot.scoreSignals.map((signal) => (
            <View key={signal.type} style={styles.signalTile}>
              <Text style={styles.signalLabel}>{copy.quickLog.labels[signal.type]}</Text>
              <Text style={styles.signalValue}>{signal.latest == null ? "--" : `${signal.latest}/10`}</Text>
              <Text style={styles.signalDetail}>
                {signal.average == null || signal.latest == null
                  ? copy.track.noScoreData
                  : copy.track.scoreDetail(signal.average, signal.latest)}
              </Text>
            </View>
          ))}
        </View>
      </Surface>
      {snapshot.hasSafetySignal ? (
        <Surface>
          <Text style={styles.title}>{copy.track.safetyNoteTitle}</Text>
          <Text style={styles.body}>{copy.track.safetyNoteBody}</Text>
        </Surface>
      ) : null}
      <Surface>
        <Text style={styles.title}>{copy.track.syncQueue}</Text>
        <Text style={styles.body}>
          {pendingSyncCount > 0 ? copy.track.pendingWrites(pendingSyncCount) : copy.track.synced}
        </Text>
        {pendingSyncCount > 0 ? (
          <Pressable
            accessibilityLabel={copy.track.syncAction}
            accessibilityRole="button"
            onPress={onSync}
            style={{
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radii.md,
              backgroundColor: colors.moss,
              marginTop: spacing.sm,
            }}
          >
            <Text style={styles.primaryButtonText}>{copy.track.syncAction}</Text>
          </Pressable>
        ) : null}
      </Surface>
      <Surface>
        <Text style={styles.title}>{copy.track.recentLogs}</Text>
        {logs.length === 0 ? (
          <Text style={styles.body}>{copy.track.noLogs}</Text>
        ) : (
          logs.slice(0, 8).map((log) => (
            <Text key={log.id} style={styles.body}>
              {copy.quickLog.labels[log.type]}: {formatLogValue(log.value, copy)}
            </Text>
          ))
        )}
      </Surface>
    </Screen>
  );
}

function formatLogValue(value: unknown, copy: LanguageCopy) {
  if (typeof value === "boolean") {
    return value ? copy.common.yes : copy.common.no;
  }

  if (typeof value === "number") {
    return `${value}/10`;
  }

  if (value && typeof value === "object") {
    return copy.quickLog.labels.symptom_checkin;
  }

  return JSON.stringify(value);
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 18,
  },
  body: {
    color: colors.muted,
    lineHeight: 21,
  },
  signalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  signalTile: {
    width: "48%",
    minHeight: 92,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: colors.panelSoft,
    padding: spacing.md,
    gap: spacing.xs,
  },
  signalLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  signalValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  signalDetail: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButtonText: {
    color: colors.ink,
    fontWeight: "900",
  },
});
