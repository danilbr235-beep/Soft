import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  buildProgramAdjustmentSummary,
  buildProgramCompletionSummary,
  buildProgramDetailSummary,
  buildProgramNextPaths,
  type ProgramNextPathId,
} from "@pmhc/programs";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { Alert, CurrentPriority, Program, ProgramDayPlan, ProgramHistoryEntry, ProgramProgressSummary, TodayMode } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  alerts: Alert[];
  activeProgram: Program | null;
  copy: LanguageCopy;
  completionPercent: number;
  currentPriority: CurrentPriority;
  dayPlan: ProgramDayPlan | null;
  history: ProgramHistoryEntry[];
  isPaused: boolean;
  progressSummary: ProgramProgressSummary | null;
  onCompleteToday: () => void;
  onPauseProgram: () => void;
  onRestToday: () => void;
  onResumeProgram: () => void;
  onStartRecommendedProgram: (programId: ProgramNextPathId) => void;
  onSkipToday: () => void;
  onToggleTask: (taskId: string) => void;
  todayMode: TodayMode;
};

export function ProgramsScreen({
  alerts,
  activeProgram,
  copy,
  completionPercent,
  currentPriority,
  dayPlan,
  history,
  isPaused,
  progressSummary,
  onCompleteToday,
  onPauseProgram,
  onRestToday,
  onResumeProgram,
  onStartRecommendedProgram,
  onSkipToday,
  onToggleTask,
  todayMode,
}: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const dayLabel = activeProgram ? copy.programs.dayOf(activeProgram.dayIndex, activeProgram.durationDays) : copy.programs.noActiveDay;
  const programTitle = activeProgram
    ? copy.programs.programTitles[activeProgram.id] ?? activeProgram.title
    : copy.programs.noActiveProgram;
  const completedTasks = dayPlan?.completedTaskIds.length ?? 0;
  const detailSummary = useMemo(() => {
    if (!activeProgram || !dayPlan || !progressSummary) {
      return null;
    }

    return buildProgramDetailSummary(activeProgram, dayPlan, progressSummary);
  }, [activeProgram, dayPlan, progressSummary]);
  const adjustmentSummary = useMemo(() => {
    if (!dayPlan || !progressSummary) {
      return null;
    }

    return buildProgramAdjustmentSummary({
      alerts,
      currentPriority,
      dayPlan,
      progressSummary,
      todayMode,
    });
  }, [alerts, currentPriority, dayPlan, progressSummary, todayMode]);
  const completionSummary = useMemo(() => {
    if (!progressSummary) {
      return null;
    }

    return buildProgramCompletionSummary({
      alerts,
      currentPriority,
      progressSummary,
    });
  }, [alerts, currentPriority, progressSummary]);
  const nextPathRecommendations = useMemo(() => {
    if (!activeProgram || !completionSummary || !progressSummary) {
      return [];
    }

    return buildProgramNextPaths({
      activeProgram,
      completionState: completionSummary.state,
      progressSummary,
    });
  }, [activeProgram, completionSummary, progressSummary]);
  const programFinished = completionSummary != null;
  const disableProgramActions = !activeProgram || isPaused || programFinished;
  const disableTaskActions = isPaused || programFinished;

  function renderTaskList() {
    if (!dayPlan) {
      return null;
    }

    return (
      <View style={styles.taskList}>
        {dayPlan.tasks.map((task) => {
          const taskTitle = copy.programs.taskTitles[task.id] ?? task.title;
          const taskDescription = copy.programs.taskDescriptions[task.id] ?? task.description;
          const completed = dayPlan.completedTaskIds.includes(task.id);

          return (
            <Pressable
              accessibilityLabel={completed ? copy.programs.markTaskOpen(taskTitle) : copy.programs.markTaskDone(taskTitle)}
              accessibilityRole="button"
              disabled={disableTaskActions}
              key={task.id}
              onPress={() => onToggleTask(task.id)}
              style={[styles.taskRow, completed && styles.completedTaskRow, disableTaskActions && styles.disabledButton]}
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
    );
  }

  function renderPausedBanner() {
    if (!isPaused) {
      return null;
    }

    return (
      <Surface>
        <Text style={styles.eyebrow}>{copy.programs.pausedTitle}</Text>
        <Text style={styles.body}>{copy.programs.pausedBody}</Text>
      </Surface>
    );
  }

  function renderActionButtons() {
    if (programFinished) {
      return null;
    }

    return (
      <View style={styles.buttonRow}>
        <Pressable
          accessibilityLabel={copy.programs.completeProgramDay}
          accessibilityRole="button"
          disabled={disableProgramActions}
          onPress={onCompleteToday}
          style={[styles.button, disableProgramActions && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>{copy.programs.completeToday}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={copy.programs.restProgramDay}
          accessibilityRole="button"
          disabled={disableProgramActions}
          onPress={onRestToday}
          style={[styles.secondaryButton, disableProgramActions && styles.disabledButton]}
        >
          <Text style={styles.secondaryButtonText}>{copy.programs.restToday}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={copy.programs.skipProgramDay}
          accessibilityRole="button"
          disabled={disableProgramActions}
          onPress={onSkipToday}
          style={[styles.secondaryButton, disableProgramActions && styles.disabledButton]}
        >
          <Text style={styles.secondaryButtonText}>{copy.programs.skipToday}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={isPaused ? copy.programs.resumeProgram : copy.programs.pauseProgram}
          accessibilityRole="button"
          disabled={!activeProgram}
          onPress={isPaused ? onResumeProgram : onPauseProgram}
          style={[styles.secondaryButton, !activeProgram && styles.disabledButton]}
        >
          <Text style={styles.secondaryButtonText}>{isPaused ? copy.programs.resumeProgram : copy.programs.pauseProgram}</Text>
        </Pressable>
      </View>
    );
  }

  function renderAdjustmentCard() {
    if (!adjustmentSummary || completionSummary) {
      return null;
    }

    return (
      <Surface>
        <Text style={styles.eyebrow}>{copy.programs.adjustmentTitle}</Text>
        <Text style={styles.sectionTitle}>{copy.programs.adjustmentKinds[adjustmentSummary.kind]}</Text>
        <Text style={styles.body}>{copy.programs.adjustmentBodies[adjustmentSummary.kind]}</Text>
        <View style={styles.detailSummaryList}>
          <Text style={styles.metaText}>{copy.programs.adjustmentReason(adjustmentSummary.reasonTitle)}</Text>
          {adjustmentSummary.avoidToday ? (
            <Text style={styles.metaText}>{copy.programs.adjustmentAvoid(adjustmentSummary.avoidToday)}</Text>
          ) : null}
          <Text style={styles.metaText}>{copy.programs.adjustmentTarget(adjustmentSummary.remainingTaskTarget)}</Text>
        </View>
        <View style={styles.detailSummaryList}>
          <Text style={styles.detailLabel}>{copy.programs.adjustmentNextStepTitle}</Text>
          <Text style={styles.body}>{copy.programs.adjustmentNextSteps[adjustmentSummary.nextStep]}</Text>
        </View>
      </Surface>
    );
  }

  function renderCompletionCard() {
    if (!completionSummary || !progressSummary) {
      return null;
    }

    return (
      <Surface>
        <Text style={styles.eyebrow}>{copy.programs.completionTitle}</Text>
        <Text style={styles.sectionTitle}>{copy.programs.completionStates[completionSummary.state]}</Text>
        <Text style={styles.body}>{copy.programs.completionBodies[completionSummary.state]}</Text>
        <View style={styles.detailSummaryList}>
          <Text style={styles.metaText}>{copy.programs.completionReason(completionSummary.reasonTitle)}</Text>
          <Text style={styles.metaText}>
            {copy.programs.completionReview(
              progressSummary.completedDays,
              progressSummary.restDays,
              progressSummary.skippedDays,
            )}
          </Text>
        </View>
        <View style={styles.detailSummaryList}>
          <Text style={styles.detailLabel}>{copy.programs.completionNextStepTitle}</Text>
          <Text style={styles.body}>{copy.programs.completionNextSteps[completionSummary.nextStep]}</Text>
        </View>
      </Surface>
    );
  }

  function renderNextPathsCard() {
    const showRecommendations = completionSummary != null && nextPathRecommendations.length > 0;

    return (
      <Surface>
        <Text style={styles.sectionTitle}>
          {showRecommendations ? copy.programs.recommendedNextPaths : copy.programs.nextCandidates}
        </Text>
        {showRecommendations ? (
          <View style={styles.candidateList}>
            <Text style={styles.body}>{copy.programs.nextPathIntro[completionSummary.state]}</Text>
            {nextPathRecommendations.map((candidate) => (
              <View key={candidate.programId} style={styles.candidateRow}>
                <Text style={styles.detailLabel}>{copy.programs.nextPathPriorityLabels[candidate.priority]}</Text>
                <Text style={styles.taskTitle}>{copy.programs.programTitles[candidate.programId]}</Text>
                <Text style={styles.body}>{copy.programs.nextPathReasons[candidate.reason]}</Text>
                <Pressable
                  accessibilityLabel={copy.programs.startRecommendedProgram(copy.programs.programTitles[candidate.programId])}
                  accessibilityRole="button"
                  onPress={() => onStartRecommendedProgram(candidate.programId)}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>{copy.programs.startProgram}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          copy.programs.candidates.map((candidate) => (
            <Text key={candidate} style={styles.body}>
              {candidate}
            </Text>
          ))
        )}
      </Surface>
    );
  }

  function renderHistoryCard() {
    if (history.length === 0) {
      return null;
    }

    return (
      <Surface>
        <Text style={styles.sectionTitle}>{copy.programs.historyTitle}</Text>
        <Text style={styles.body}>{copy.programs.historyBody}</Text>
        <View style={styles.candidateList}>
          {history.map((entry) => (
            <View key={entry.id} style={styles.candidateRow}>
              <Text style={styles.taskTitle}>{copy.programs.programTitles[entry.programId] ?? entry.programId}</Text>
              <Text style={styles.body}>{copy.programs.completionStates[entry.completionState]}</Text>
              <Text style={styles.metaText}>
                {copy.programs.completionReview(entry.completedDays, entry.restDays, entry.skippedDays)}
              </Text>
              <Text style={styles.metaText}>{copy.programs.completionReason(entry.reasonTitle)}</Text>
              {entry.nextProgramId ? (
                <Text style={styles.metaText}>
                  {copy.programs.historyContinuedWith(copy.programs.programTitles[entry.nextProgramId] ?? entry.nextProgramId)}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      </Surface>
    );
  }

  if (showDetail && activeProgram && dayPlan && progressSummary && detailSummary) {
    return (
      <Screen title={copy.programs.title} subtitle={copy.programs.subtitle}>
        <Pressable
          accessibilityLabel={copy.programs.backToPrograms}
          accessibilityRole="button"
          onPress={() => setShowDetail(false)}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{copy.programs.backToPrograms}</Text>
        </Pressable>

        <Surface>
          <Text style={styles.eyebrow}>{copy.programs.detailOverview}</Text>
          <Text style={styles.title}>{programTitle}</Text>
          <Text style={styles.body}>{dayLabel}</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailTile}>
              <Text style={styles.detailLabel}>{copy.programs.detailLabels.status}</Text>
              <Text style={styles.detailValue}>{copy.programs.detailChecklistStates[detailSummary.checklistState]}</Text>
            </View>
            <View style={styles.detailTile}>
              <Text style={styles.detailLabel}>{copy.programs.detailLabels.focus}</Text>
              <Text style={styles.detailValue}>{copy.programs.detailFocusLabels[detailSummary.focus]}</Text>
            </View>
            <View style={styles.detailTile}>
              <Text style={styles.detailLabel}>{copy.programs.detailLabels.pace}</Text>
              <Text style={styles.detailValue}>{copy.programs.detailPaceLabels[detailSummary.pace]}</Text>
            </View>
            <View style={styles.detailTile}>
              <Text style={styles.detailLabel}>{copy.programs.detailLabels.stage}</Text>
              <Text style={styles.detailValue}>{copy.programs.detailCompletionBands[detailSummary.completionBand]}</Text>
            </View>
          </View>
          <Text style={styles.body}>{copy.programs.detailConservativeNotes[detailSummary.pace]}</Text>
        </Surface>

        {renderPausedBanner()}

        <Surface>
          <Text style={styles.sectionTitle}>{copy.programs.detailSummaryTitle}</Text>
          <View style={styles.detailSummaryList}>
            <Text style={styles.body}>{copy.programs.percentComplete(completionPercent)}</Text>
            <Text style={styles.body}>{copy.programs.completedDays(progressSummary.completedDays)}</Text>
            <Text style={styles.body}>{copy.programs.restDays(progressSummary.restDays)}</Text>
            <Text style={styles.body}>{copy.programs.skippedDays(progressSummary.skippedDays)}</Text>
            <Text style={styles.body}>{copy.programs.remainingDays(progressSummary.remainingDays)}</Text>
            <Text style={styles.body}>
              {detailSummary.nextMilestoneDay
                ? copy.programs.detailNextMilestone(detailSummary.nextMilestoneDay)
                : copy.programs.detailFinalMilestone}
            </Text>
          </View>
        </Surface>

        {renderCompletionCard()}
        {renderAdjustmentCard()}

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
          {renderTaskList()}
          {renderActionButtons()}
        </Surface>
      </Screen>
    );
  }

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
              <Text style={styles.summaryValue}>{progressSummary.skippedDays}</Text>
              <Text style={styles.summaryLabel}>{copy.programs.skippedDays(progressSummary.skippedDays)}</Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.summaryValue}>{progressSummary.remainingDays}</Text>
              <Text style={styles.summaryLabel}>{copy.programs.remainingDays(progressSummary.remainingDays)}</Text>
            </View>
          </View>
        ) : null}
        {renderPausedBanner()}
        {renderCompletionCard()}
        {renderActionButtons()}
      </Surface>
      {renderAdjustmentCard()}
      {dayPlan && detailSummary ? (
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
          <View style={styles.detailSummaryList}>
            <Text style={styles.body}>{copy.programs.detailChecklistStates[detailSummary.checklistState]}</Text>
            <Text style={styles.body}>{copy.programs.detailFocusLabels[detailSummary.focus]}</Text>
            <Text style={styles.body}>{copy.programs.detailConservativeNotes[detailSummary.pace]}</Text>
          </View>
          <Pressable
            accessibilityLabel={copy.programs.openDetail}
            accessibilityRole="button"
            onPress={() => setShowDetail(true)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>{copy.programs.openDetail}</Text>
          </Pressable>
        </Surface>
      ) : null}
      {renderNextPathsCard()}
      {renderHistoryCard()}
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
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  summaryTile: {
    minWidth: "47%",
    flexGrow: 1,
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
  backButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: "800",
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
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  detailTile: {
    minWidth: "47%",
    flexGrow: 1,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
    padding: spacing.sm,
  },
  detailLabel: {
    color: colors.steel,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  detailSummaryList: {
    gap: spacing.xs,
  },
  candidateList: {
    gap: spacing.sm,
  },
  candidateRow: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
  },
  detailValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
  },
  metaText: {
    color: colors.steel,
    lineHeight: 20,
  },
});
