import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { Alert, CurrentPriority, DailyStateTile, QuickLogDefinition } from "@pmhc/types";
import type { DailySession, DailySessionStepId } from "../dailySession";
import type { MorningRoutine } from "../morningRoutine";
import type { TodayStatusItem } from "../todayStatus";
import { Surface } from "./Surface";

type PriorityProps = {
  copy: LanguageCopy;
  priority: CurrentPriority;
  onAskCoach: () => void;
};

export function PriorityCard({ copy, onAskCoach, priority }: PriorityProps) {
  return (
    <Surface>
      <View style={styles.rowBetween}>
        <Text style={styles.kicker}>{copy.today.currentPriority}</Text>
        <Text style={styles.badge}>{copy.today.confidence(priority.confidence)}</Text>
      </View>
      <Text style={styles.priorityTitle}>{priority.title}</Text>
      <Text style={styles.body}>{priority.whyItMatters}</Text>
      <Text style={styles.action}>{priority.recommendedAction}</Text>
      {priority.avoidToday ? <Text style={styles.avoid}>{priority.avoidToday}</Text> : null}
      <Pressable accessibilityRole="button" onPress={onAskCoach} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>{copy.today.askCoachWhy}</Text>
      </Pressable>
    </Surface>
  );
}

export function StateGrid({ tiles }: { tiles: DailyStateTile[] }) {
  return (
    <View style={styles.tileGrid}>
      {tiles.map((tile) => (
        <View key={tile.id} style={styles.tile}>
          <Text style={styles.tileLabel}>{tile.label}</Text>
          <Text style={styles.tileValue}>{tile.value}</Text>
          <Text style={styles.tileStatus}>{tile.status}</Text>
        </View>
      ))}
    </View>
  );
}

export function AlertStrip({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return null;
  }

  const alert = alerts[0];
  const urgent = alert.severity === "medical_attention" || alert.severity === "high_priority";

  return (
    <View style={[styles.alert, urgent && styles.urgentAlert]}>
      <Text style={styles.alertTitle}>{alert.title}</Text>
      <Text style={styles.alertMessage}>{alert.message}</Text>
    </View>
  );
}

export function TodayStatusRow({ items }: { items: TodayStatusItem[] }) {
  return (
    <View accessibilityLabel="Today status" style={styles.statusGrid}>
      {items.map((item) => (
        <View
          key={item.id}
          style={[
            styles.statusChip,
            item.tone === "good" ? styles.statusChipGood : null,
            item.tone === "attention" ? styles.statusChipAttention : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.statusLabel}>
            {item.label}
          </Text>
          <Text numberOfLines={1} style={styles.statusValue}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function QuickLogRow({
  accessibilityPrefix = "Quick log",
  logs,
  onLog,
}: {
  accessibilityPrefix?: string;
  logs: QuickLogDefinition[];
  onLog: (definition: QuickLogDefinition) => void;
}) {
  return (
    <View style={styles.quickRow}>
      {logs.map((log) => (
        <Pressable
          key={log.type}
          accessibilityLabel={`${accessibilityPrefix} ${log.label}`}
          accessibilityRole="button"
          style={styles.quickChip}
          onPress={() => onLog(log)}
        >
          <Text style={styles.quickText}>{log.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function DailySessionBlock({
  session,
  onOpenStep,
}: {
  session: DailySession;
  onOpenStep: (stepId: DailySessionStepId) => void;
}) {
  return (
    <Surface>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionHeaderText}>
          <Text style={styles.kicker}>{session.title}</Text>
          <Text style={styles.body}>{session.body}</Text>
        </View>
        <Text style={styles.sessionProgress}>{session.progressLabel}</Text>
      </View>
      <View style={styles.sessionList}>
        {session.steps.map((step) => (
          <View
            key={step.id}
            style={[
              styles.sessionStep,
              step.state === "active" ? styles.sessionStepActive : null,
              step.state === "done" ? styles.sessionStepDone : null,
            ]}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.sessionStepTitle}>{step.title}</Text>
              <Text
                style={[
                  styles.sessionState,
                  step.state === "active" ? styles.sessionStateActive : null,
                  step.state === "done" ? styles.sessionStateDone : null,
                ]}
              >
                {step.statusLabel}
              </Text>
            </View>
            <Text style={styles.body}>{step.body}</Text>
            <Pressable
              accessibilityLabel={step.openLabel}
              accessibilityRole="button"
              onPress={() => onOpenStep(step.id)}
              style={styles.sessionButton}
            >
              <Text style={styles.sessionButtonText}>{step.cta}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </Surface>
  );
}

export function MorningRoutineBlock({
  routine,
  onOpenGuide,
  onOpenLog,
}: {
  routine: MorningRoutine;
  onOpenGuide: () => void;
  onOpenLog: () => void;
}) {
  return (
    <Surface>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionHeaderText}>
          <Text style={styles.kicker}>{routine.title}</Text>
          <Text style={styles.body}>{routine.body}</Text>
          <Text style={styles.routineNote}>{routine.note}</Text>
        </View>
      </View>
      <View style={styles.sessionList}>
        {routine.steps.map((step, index) => (
          <View key={step.id} style={styles.sessionStep}>
            <View style={styles.rowBetween}>
              <Text style={styles.sessionStepTitle}>{`${index + 1}. ${step.title}`}</Text>
              <Text style={styles.sessionState}>{step.badge}</Text>
            </View>
            <Text style={styles.body}>{step.body}</Text>
            <View style={styles.sourceRow}>
              {step.sourceLabels.map((label) => (
                <Text key={`${step.id}-${label}`} style={styles.sourcePill}>
                  {label}
                </Text>
              ))}
            </View>
            {step.cta ? (
              <Pressable
                accessibilityLabel={step.cta}
                accessibilityRole="button"
                onPress={step.ctaKind === "guide" ? onOpenGuide : onOpenLog}
                style={styles.sessionButton}
              >
                <Text style={styles.sessionButtonText}>{step.cta}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  kicker: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  badge: {
    color: colors.ink,
    backgroundColor: colors.moss,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
  priorityTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  action: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "700",
  },
  avoid: {
    color: colors.amber,
    fontSize: 14,
    lineHeight: 21,
  },
  secondaryButton: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tile: {
    width: "48%",
    minHeight: 96,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    padding: spacing.md,
    gap: spacing.xs,
  },
  tileLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  tileValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  tileStatus: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  alert: {
    borderRadius: radii.md,
    backgroundColor: "#2a2617",
    borderColor: colors.amber,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  urgentAlert: {
    backgroundColor: "#2a1d1a",
    borderColor: colors.coral,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusChip: {
    width: "48%",
    minHeight: 58,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusChipGood: {
    borderColor: colors.moss,
  },
  statusChipAttention: {
    borderColor: colors.amber,
  },
  statusLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statusValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  alertTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  alertMessage: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  quickChip: {
    minHeight: 42,
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  quickText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  sessionHeader: {
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  sessionHeaderText: {
    gap: spacing.xs,
  },
  sessionProgress: {
    color: colors.steel,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sessionList: {
    gap: spacing.sm,
  },
  sessionStep: {
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  sessionStepActive: {
    borderColor: colors.moss,
    backgroundColor: colors.panelSoft,
  },
  sessionStepDone: {
    borderColor: colors.steel,
  },
  sessionStepTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  sessionState: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sessionStateActive: {
    color: colors.moss,
  },
  sessionStateDone: {
    color: colors.text,
  },
  sessionButton: {
    minHeight: 42,
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  sessionButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  routineNote: {
    color: colors.steel,
    fontSize: 13,
    lineHeight: 19,
  },
  sourcePill: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sourceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
