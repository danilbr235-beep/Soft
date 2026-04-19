import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { Program, ProgramDayPlan } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  activeProgram: Program | null;
  copy: LanguageCopy;
  completionPercent: number;
  dayPlan: ProgramDayPlan | null;
  onCompleteToday: () => void;
  onToggleTask: (taskId: string) => void;
};

export function ProgramsScreen({
  activeProgram,
  copy,
  completionPercent,
  dayPlan,
  onCompleteToday,
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
        <Pressable
          accessibilityLabel={copy.programs.completeProgramDay}
          accessibilityRole="button"
          disabled={!activeProgram}
          onPress={onCompleteToday}
          style={[styles.button, !activeProgram && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>{copy.programs.completeToday}</Text>
        </Pressable>
      </Surface>
      {dayPlan ? (
        <Surface>
          <View style={styles.planHeader}>
            <View style={styles.planHeaderText}>
              <Text style={styles.sectionTitle}>{copy.programs.dayPlanTitle}</Text>
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
});
