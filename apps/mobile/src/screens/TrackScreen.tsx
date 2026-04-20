import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { createSymptomCheckinValue } from "@pmhc/safety";
import {
  buildTrackingExport,
  buildTrackingSnapshot,
  filterTrackingLogs,
} from "@pmhc/tracking";
import type { TrackingLogFilter } from "@pmhc/tracking";
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
  onDeleteLog,
  onLog,
  onSync,
  onUpdateLog,
  pendingSyncCount,
}: {
  logs: LogEntry[];
  copy: LanguageCopy;
  onDeleteLog: (logId: string) => void;
  onLog: (definition: QuickLogDefinition) => void;
  onSync: () => void;
  onUpdateLog: (logId: string, value: unknown) => void;
  pendingSyncCount: number;
}) {
  const [selectedFilter, setSelectedFilter] = useState<TrackingLogFilter>("all");
  const [exportText, setExportText] = useState<string | null>(null);
  const manualLogs = manualLogTypes.map((log) => ({
    ...log,
    label: copy.quickLog.labels[log.type],
  }));
  const snapshot = buildTrackingSnapshot(logs);
  const filteredLogs = useMemo(() => filterTrackingLogs(logs, selectedFilter), [logs, selectedFilter]);
  const filterOptions: TrackingLogFilter[] = ["all", "scores", "symptoms", "routines"];

  function prepareExport() {
    const payload = buildTrackingExport(filteredLogs, new Date().toISOString(), selectedFilter);
    setExportText(JSON.stringify(payload, null, 2));
  }

  function selectFilter(filter: TrackingLogFilter) {
    setSelectedFilter(filter);
    setExportText(null);
  }

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
        <Text style={styles.body}>{copy.track.filterTitle}</Text>
        <View style={styles.filterRow}>
          {filterOptions.map((filter) => (
            <Pressable
              accessibilityLabel={`Filter Track logs: ${copy.track.filterLabels[filter]}`}
              accessibilityRole="button"
              key={filter}
              onPress={() => selectFilter(filter)}
              style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
            >
              <Text style={[styles.filterButtonText, selectedFilter === filter && styles.activeFilterButtonText]}>
                {copy.track.filterLabels[filter]}
              </Text>
            </Pressable>
          ))}
        </View>
        {logs.length === 0 ? <Text style={styles.body}>{copy.track.noLogs}</Text> : null}
        {logs.length > 0 && filteredLogs.length === 0 ? <Text style={styles.body}>{copy.track.noFilteredLogs}</Text> : null}
        {filteredLogs.slice(0, 8).map((log) => {
          const label = copy.quickLog.labels[log.type];

          return (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logText}>
                <Text style={styles.logValue}>
                  {label}: {formatLogValue(log, copy)}
                </Text>
                <Text style={styles.logMeta}>{formatLogDate(log.occurredAt)}</Text>
              </View>
              <View style={styles.logActions}>
                <Pressable
                  accessibilityLabel={copy.track.editLog(label)}
                  accessibilityRole="button"
                  onPress={() => {
                    setExportText(null);
                    onUpdateLog(log.id, nextDemoValue(log));
                  }}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>{copy.track.editAction}</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={copy.track.deleteLog(label)}
                  accessibilityRole="button"
                  onPress={() => {
                    setExportText(null);
                    onDeleteLog(log.id);
                  }}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>{copy.track.deleteAction}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </Surface>
      <Surface>
        <Text style={styles.title}>{copy.track.exportTitle}</Text>
        <Text style={styles.body}>{copy.track.exportBody}</Text>
        <Pressable
          accessibilityLabel={copy.track.exportAction}
          accessibilityRole="button"
          onPress={prepareExport}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>{copy.track.exportAction}</Text>
        </Pressable>
        {exportText ? (
          <View style={styles.exportPreview}>
            <Text style={styles.exportMeta}>{copy.track.exportReady(filteredLogs.length)}</Text>
            <Text style={styles.exportText} numberOfLines={6}>{exportText}</Text>
          </View>
        ) : null}
      </Surface>
    </Screen>
  );
}

function formatLogValue(log: LogEntry, copy: LanguageCopy) {
  const value = log.value;

  if (typeof value === "boolean") {
    return value ? copy.common.yes : copy.common.no;
  }

  if (typeof value === "number") {
    return `${value}/10`;
  }

  if (value && typeof value === "object") {
    return isAllClearSymptom(value) ? copy.track.allClear : copy.quickLog.labels.symptom_checkin;
  }

  return JSON.stringify(value);
}

function nextDemoValue(log: LogEntry) {
  if (typeof log.value === "number") {
    const options = [1, 3, 5, 7, 10];
    const currentIndex = options.indexOf(log.value);
    return options[(currentIndex + 1) % options.length] ?? 1;
  }

  if (typeof log.value === "boolean") {
    return !log.value;
  }

  if (log.type === "symptom_checkin") {
    return createSymptomCheckinValue("all_clear");
  }

  return log.value;
}

function isAllClearSymptom(value: object) {
  return "severity" in value && value.severity === "none";
}

function formatLogDate(occurredAt: string) {
  const parsed = new Date(occurredAt);

  if (Number.isNaN(parsed.getTime())) {
    return occurredAt;
  }

  return parsed.toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterButton: {
    minHeight: 40,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
    paddingHorizontal: spacing.md,
  },
  activeFilterButton: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  filterButtonText: {
    color: colors.text,
    fontWeight: "800",
  },
  activeFilterButtonText: {
    color: colors.ink,
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
  logRow: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
    padding: spacing.md,
  },
  logText: {
    flex: 1,
    gap: 4,
  },
  logValue: {
    color: colors.text,
    fontWeight: "900",
  },
  logMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  logActions: {
    gap: spacing.xs,
  },
  primaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.moss,
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.ink,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 36,
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  exportPreview: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
    padding: spacing.md,
  },
  exportMeta: {
    color: colors.text,
    fontWeight: "900",
  },
  exportText: {
    color: colors.muted,
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 16,
  },
});
