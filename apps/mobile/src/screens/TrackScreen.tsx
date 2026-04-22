import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { buildProgramReview } from "@pmhc/programs";
import { createSymptomCheckinValue } from "@pmhc/safety";
import {
  buildTrackingExport,
  buildTrackingPatternHints,
  buildTrackingPeriodReview,
  buildTrackingReviewDigest,
  buildTrackingSnapshot,
  buildTrackingWeeklyReview,
  buildWeeklySnapshotCards,
  filterTrackingLogs,
} from "@pmhc/tracking";
import type { TrackingLogFilter, TrackingPatternHint, TrackingWeeklySnapshotCard } from "@pmhc/tracking";
import { colors, radii, spacing } from "@pmhc/ui";
import type { LogEntry, ProgramHistoryEntry, QuickLogDefinition } from "@pmhc/types";
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
  programHistory,
}: {
  logs: LogEntry[];
  copy: LanguageCopy;
  onDeleteLog: (logId: string) => void;
  onLog: (definition: QuickLogDefinition) => void;
  onSync: () => void;
  onUpdateLog: (logId: string, value: unknown) => void;
  pendingSyncCount: number;
  programHistory: ProgramHistoryEntry[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<TrackingLogFilter>("all");
  const [exportText, setExportText] = useState<string | null>(null);
  const manualLogs = manualLogTypes.map((log) => ({
    ...log,
    label: copy.quickLog.labels[log.type],
  }));
  const snapshot = buildTrackingSnapshot(logs);
  const weeklyCards = buildWeeklySnapshotCards(logs);
  const reviewDigest = useMemo(() => buildTrackingReviewDigest(logs, programHistory), [logs, programHistory]);
  const weeklyReview = useMemo(() => buildTrackingWeeklyReview(logs, programHistory), [logs, programHistory]);
  const monthlyReview = useMemo(() => buildTrackingPeriodReview(logs, programHistory, 30), [logs, programHistory]);
  const patternHints = buildTrackingPatternHints(logs);
  const filteredLogs = useMemo(() => filterTrackingLogs(logs, selectedFilter), [logs, selectedFilter]);
  const programReview = useMemo(() => buildProgramReview(programHistory), [programHistory]);
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
        <Text style={styles.title}>{copy.track.reviewDigestTitle}</Text>
        <Text style={styles.body}>{copy.track.reviewDigestBody}</Text>
        <Text style={styles.hintTitle}>{copy.track.reviewDigestTones[reviewDigest.tone]}</Text>
        <Text style={styles.body}>{copy.track.reviewDigestReasons[reviewDigest.reason]}</Text>
        <Text style={styles.signalDetail}>{copy.track.reviewDigestConfidenceTitle}</Text>
        <Text style={styles.body}>{copy.track.reviewDigestConfidenceLabels[reviewDigest.confidence]}</Text>
        <Text style={styles.signalDetail}>{copy.track.reviewDigestNextStepTitle}</Text>
        <Text style={styles.body}>{copy.track.reviewDigestNextSteps[reviewDigest.nextStep]}</Text>
        <Text style={styles.hintMeta}>
          {copy.track.reviewDigestWindows(
            copy.track.weeklyReviewTones[reviewDigest.weeklyTone],
            copy.track.monthlyReviewTones[reviewDigest.monthlyTone],
          )}
        </Text>
        {reviewDigest.latestProgramId ? (
          <Text style={styles.hintMeta}>
            {copy.track.reviewDigestLatestProgram(
              copy.programs.programTitles[reviewDigest.latestProgramId] ?? reviewDigest.latestProgramId,
            )}
          </Text>
        ) : null}
      </Surface>
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
        <Text style={styles.title}>{copy.track.weeklySnapshotTitle}</Text>
        <Text style={styles.body}>{copy.track.weeklySnapshotBody}</Text>
        <View style={styles.signalGrid}>
          {weeklyCards.map((card) => (
            <View
              key={card.type}
              style={[styles.signalTile, card.status === "caution" ? styles.cautionTile : null]}
            >
              <Text style={styles.signalLabel}>{copy.quickLog.labels[card.type]}</Text>
              <Text style={styles.signalValue}>{formatWeeklyCardValue(card, copy)}</Text>
              <Text style={styles.signalDetail}>{formatWeeklyCardMeta(card, copy)}</Text>
            </View>
          ))}
        </View>
      </Surface>
      <ReviewCard
        body={copy.track.weeklyReviewBody}
        latestProgram={weeklyReview.latestProgramId
          ? copy.track.weeklyReviewLatestProgram(
              copy.programs.programTitles[weeklyReview.latestProgramId] ?? weeklyReview.latestProgramId,
            )
          : null}
        meta={copy.track.weeklyReviewMeta(
          weeklyReview.logsInWeek,
          weeklyReview.scoreLogsInWeek,
          weeklyReview.symptomLogsInWeek,
        )}
        nextStep={copy.track.weeklyReviewNextSteps[weeklyReview.nextStep]}
        nextStepTitle={copy.track.weeklyReviewNextStepTitle}
        reason={copy.track.weeklyReviewReasons[weeklyReview.reason]}
        title={copy.track.weeklyReviewTitle}
        tone={copy.track.weeklyReviewTones[weeklyReview.tone]}
      />
      <ReviewCard
        body={copy.track.monthlyReviewBody}
        latestProgram={monthlyReview.latestProgramId
          ? copy.track.monthlyReviewLatestProgram(
              copy.programs.programTitles[monthlyReview.latestProgramId] ?? monthlyReview.latestProgramId,
            )
          : null}
        meta={copy.track.monthlyReviewMeta(
          monthlyReview.logsInPeriod,
          monthlyReview.scoreLogsInPeriod,
          monthlyReview.symptomLogsInPeriod,
          monthlyReview.cycleCountInPeriod,
        )}
        nextStep={copy.track.monthlyReviewNextSteps[monthlyReview.nextStep]}
        nextStepTitle={copy.track.monthlyReviewNextStepTitle}
        reason={copy.track.monthlyReviewReasons[monthlyReview.reason]}
        title={copy.track.monthlyReviewTitle}
        tone={copy.track.monthlyReviewTones[monthlyReview.tone]}
      />
      <Surface>
        <Text style={styles.title}>{copy.track.patternHintsTitle}</Text>
        <Text style={styles.body}>{copy.track.patternHintsBody}</Text>
        {patternHints.map((hint) => (
          <View key={hint.id} style={styles.hintCard}>
            <Text style={styles.hintTitle}>{copy.track.patternHintLabels[hint.id]}</Text>
            <Text style={styles.body}>{formatPatternHintBody(hint, copy)}</Text>
            <Text style={styles.hintMeta}>
              {copy.track.patternHintMeta(
                hint.overlappingDays,
                copy.track.patternConfidenceLabels[hint.confidence],
              )}
            </Text>
          </View>
        ))}
      </Surface>
      {programReview ? (
        <Surface>
          <Text style={styles.title}>{copy.track.programReviewTitle}</Text>
          <Text style={styles.body}>{copy.track.programReviewBody}</Text>
          <Text style={styles.hintTitle}>{copy.programs.completionStates[programReview.leadingState]}</Text>
          <Text style={styles.body}>{copy.programs.reviewFocuses[programReview.focus]}</Text>
          <Text style={styles.signalDetail}>{copy.programs.reviewTrendTitle}</Text>
          <Text style={styles.body}>{copy.programs.reviewTrendLabels[programReview.trend]}</Text>
          <Text style={styles.hintMeta}>
            {copy.programs.reviewTotals(
              programReview.cycleCount,
              programReview.totalCompletedDays,
              programReview.totalRestDays,
              programReview.totalSkippedDays,
            )}
          </Text>
          <Text style={styles.hintMeta}>
            {copy.programs.reviewLatest(
              copy.programs.programTitles[programReview.latestProgramId] ?? programReview.latestProgramId,
            )}
          </Text>
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

function ReviewCard({
  body,
  latestProgram,
  meta,
  nextStep,
  nextStepTitle,
  reason,
  title,
  tone,
}: {
  body: string;
  latestProgram: string | null;
  meta: string;
  nextStep: string;
  nextStepTitle: string;
  reason: string;
  title: string;
  tone: string;
}) {
  return (
    <Surface>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Text style={styles.hintTitle}>{tone}</Text>
      <Text style={styles.body}>{reason}</Text>
      <Text style={styles.signalDetail}>{nextStepTitle}</Text>
      <Text style={styles.body}>{nextStep}</Text>
      <Text style={styles.hintMeta}>{meta}</Text>
      {latestProgram ? <Text style={styles.hintMeta}>{latestProgram}</Text> : null}
    </Surface>
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

function formatWeeklyCardValue(card: TrackingWeeklySnapshotCard, copy: LanguageCopy) {
  if (card.kind === "symptom") {
    return copy.track.weeklySymptomValue(card.count);
  }

  return card.average == null ? "--" : copy.track.weeklyAverage(card.average);
}

function formatWeeklyCardMeta(card: TrackingWeeklySnapshotCard, copy: LanguageCopy) {
  const status = copy.track.weeklyStatusLabels[card.status];

  if (card.kind === "symptom") {
    return copy.track.weeklySymptomMeta(status);
  }

  return copy.track.weeklyScoreMeta(card.count, status);
}

function formatPatternHintBody(hint: TrackingPatternHint, copy: LanguageCopy) {
  if (hint.status === "low_data") {
    return copy.track.patternHintLowDataBody;
  }

  return copy.track.patternHintObservedBody(copy.track.patternDirectionLabels[hint.direction]);
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
  cautionTile: {
    borderColor: colors.amber,
    backgroundColor: "#2a2617",
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
  hintCard: {
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: colors.panelSoft,
    gap: spacing.xs,
    padding: spacing.md,
  },
  hintTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  hintMeta: {
    color: colors.steel,
    fontSize: 12,
    fontWeight: "800",
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
