import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { Program, ProgramDayPlan, ProgramProgressSummary } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  activeProgram: Program | null;
  copy: LanguageCopy;
  completionPercent: number;
  dayPlan: ProgramDayPlan | null;
  progressSummary: ProgramProgressSummary | null;
  onCompleteToday: () => void;
  onRestToday: () => void;
  onToggleTask: (taskId: string) => void;
};

export function ProgramsScreen({
  activeProgram,
  copy,
  completionPercent,
  dayPlan,
  progressSummary,
  onCompleteToday,
  onRestToday,
  onToggleTask,
}: Props) {
  const dayLabel = activeProgram ? copy.programs.dayOf(activeProgram.dayIndex, activeProgram.durationDays) : copy.programs.noActiveDay;
  const programTitle = activeProgram
    ? copy.programs.programTitles[activeProgram.id] ?? activeProgram.title
    : copy.programs.noActiveProgram;
  const completedTasks = dayPlan?.completedTaskIds.length ?? 0;

  return (
    <Screen title={copy.programs.title} subtitle={copy.programs.subtitle}>
      <Surface>
        <Text style={styles.eyebrow}>{copy.programs.active}</Text>
        <Text style={styles.title}>{programTitle}</Text>
        <Text style={styles.body}>{dayLabel}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
        </View>
        <Text style={styles.body}>{copy.programs.percentComplete(completionPercent)}</Text>
        {progressSummary ? (
          <View style={styles.summaryGrid}>
            <View style={styles.summaryTile}>
              <Text style={styles.summaryValue}>{progressSummary.completedDays}</Text>
              <Text style={styles.summaryLabel}>{copy.programs.completedDays(progressSummary.completedDays)}</Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.summaryValue}>{progressSummary.restDays}</Text>
              <Text style={styles.summaryLabel}>{copy.programs.restDays(progressSummary.restDays)}</Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.summaryValue}>{progressSummary.remainingDays}</Text>
              <Text style={styles.summaryLabel}>{copy.programs.remainingDays(progressSummary.remainingDays)}</Text>
            </View>
          </View>
        ) : null}
        <View style={styles.buttonRow}>
          <Pressable
            accessibilityLabel={copy.programs.completeProgramDay}
            accessibilityRole="button"
            disabled={!activeProgram}
            onPress={onCompleteToday}
            style={[styles.button, !activeProgram && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>{copy.programs.completeToday}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={copy.programs.restProgramDay}
            accessibilityRole="button"
            disabled={!activeProgram}
            onPress={onRestToday}
            style={[styles.secondaryButton, !activeProgram && styles.disabledButton]}
          >
            <Text style={styles.secondaryButtonText}>{copy.programs.restToday}</Text>
          </Pressable>
        </View>
      </Surface>
      {dayPlan ? (
        <Surface>
          <View style={styles.planHeader}>
            <View style={styles.planHeaderText}>
              <Text style={styles.sectionTitle}>{copy.programs.dayPlanTitle}</Text>
              <Text style={styles.phaseLabel}>{copy.programs.phaseLabels[dayPlan.phase]}</Text>
              <Text style={styles.body}>{copy.programs.planSummaries[dayPlan.programId] ?? dayPlan.summary}</Text>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>{copy.programs.taskProgress(completedTasks, dayPlan.tasks.length)}</Text>
            </View>
          </View>
          <View style={styles.taskList}>
            {dayPlan.tasks.map((task) => {
              const taskTitle = copy.programs.taskTitles[task.id] ?? task.title;
              const taskDescription = copy.programs.taskDescriptions[task.id] ?? task.description;
              const completed = dayPlan.completedTaskIds.includes(task.id);

              return (
                <Pressable
                  accessibilityLabel={completed ? copy.programs.markTaskOpen(taskTitle) : copy.programs.markTaskDone(taskTitle)}
                  accessibilityRole="button"
                  key={task.id}
                  onPress={() => onToggleTask(task.id)}
                  style={[styles.taskRow, completed && styles.completedTaskRow]}
                >
                  <View style={[styles.taskCheck, completed && styles.completedTaskCheck]}>
                    <Text style={[styles.taskCheckText, completed && styles.completedTaskCheckText]}>
                      {completed ? "OK" : ""}
                    </Text>
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{taskTitle}</Text>
                    <Text style={styles.body}>{taskDescription}</Text>
                    <Text style={styles.taskMeta}>{copy.common.minutes(task.durationMinutes)}</Text>
                  </View>
                  <Text style={[styles.taskStatus, completed && styles.completedTaskStatus]}>
                    {completed ? copy.programs.taskDone : copy.programs.taskOpen}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Surface>
      ) : null}
      <Surface>
        <Text style={styles.sectionTitle}>{copy.programs.nextCandidates}</Text>
        {copy.programs.candidates.map((candidate) => (
          <Text key={candidate} style={styles.body}>{candidate}</Text>
        ))}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.moss,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  body: {
    color: colors.muted,
    lineHeight: 21,
  },
  progressTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: radii.sm,
    backgroundColor: colors.panelSoft,
  },
  progressFill: {
    height: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.moss,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryTile: {
    flex: 1,
    minHeight: 72,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
    padding: spacing.sm,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  planHeader: {
    gap: spacing.md,
  },
  planHeaderText: {
    gap: spacing.xs,
  },
  progressPill: {
    alignSelf: "flex-start",
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  progressPillText: {
    color: colors.text,
    fontWeight: "800",
  },
  phaseLabel: {
    alignSelf: "flex-start",
    color: colors.moss,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  taskList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  taskRow: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    padding: spacing.md,
  },
  completedTaskRow: {
    backgroundColor: colors.panelSoft,
  },
  taskCheck: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
  },
  completedTaskCheck: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  taskCheckText: {
    color: colors.text,
    fontWeight: "900",
  },
  completedTaskCheckText: {
    color: colors.ink,
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  taskMeta: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  taskStatus: {
    maxWidth: 86,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },
  completedTaskStatus: {
    color: colors.moss,
  },
  buttonRow: {
    gap: spacing.sm,
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.moss,
    marginTop: spacing.sm,
  },
  disabledButton: {
    opacity: 0.45,
  },
  buttonText: {
    color: colors.ink,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "900",
  },
});
