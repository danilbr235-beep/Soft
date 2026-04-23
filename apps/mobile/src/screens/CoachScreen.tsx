import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import { buildCoachQuickAnswers, type CoachQuickAnswer } from "@pmhc/rules";
import type { AppLanguage, TodayPayload } from "@pmhc/types";
import type { CoachQuestionId, CoachReviewDigest } from "@pmhc/rules";
import type { CoachAdaptiveNudge } from "../coachAdaptiveNudge";
import { buildDaySimplificationGuidance } from "../daySimplificationGuidance";
import type { DaySimplificationState } from "../daySimplification";
import { buildCoachMorningAnswer, type CoachMorningAnswer } from "../coachMorningAnswer";
import type { MorningRoutineReview } from "../morningRoutineReview";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type CoachScreenAnswer = CoachQuickAnswer | CoachAdaptiveNudge | CoachMorningAnswer;
type CoachScreenQuestionId = CoachQuestionId | CoachAdaptiveNudge["id"] | CoachMorningAnswer["id"];

export function CoachScreen({
  actionCardCount,
  adaptiveDayGuidance,
  copy,
  daySimplification,
  language,
  morningRoutineReview,
  onApplyDaySimplification,
  onClearDaySimplification,
  programTaskCount,
  reviewDigest,
  today,
}: {
  actionCardCount: number;
  adaptiveDayGuidance: CoachAdaptiveNudge;
  copy: LanguageCopy;
  daySimplification: DaySimplificationState;
  language: AppLanguage;
  morningRoutineReview: MorningRoutineReview;
  onApplyDaySimplification: () => void;
  onClearDaySimplification: () => void;
  programTaskCount: number;
  reviewDigest: CoachReviewDigest;
  today: TodayPayload;
}) {
  const [selectedId, setSelectedId] = useState<CoachScreenQuestionId>("priority");
  const answers = useMemo<CoachScreenAnswer[]>(() => {
    return [
      ...buildCoachQuickAnswers(today, language, reviewDigest),
      adaptiveDayGuidance,
      buildCoachMorningAnswer(morningRoutineReview, language),
    ];
  }, [adaptiveDayGuidance, language, morningRoutineReview, reviewDigest, today]);
  const selectedAnswer = answers.find((answer) => answer.id === selectedId) ?? answers[0];
  const simplificationGuidance = buildDaySimplificationGuidance({
    actionCardCount,
    adaptiveDayGuidance,
    daySimplification,
    language,
    programTaskCount,
  });
  const showSimplificationAction = selectedAnswer.id === adaptiveDayGuidance.id && simplificationGuidance.ctaLabel;

  return (
    <Screen title={copy.coach.title} subtitle={copy.coach.subtitle}>
      <View style={styles.questionBlock}>
        <Text style={styles.sectionTitle}>{copy.coach.quickQuestions}</Text>
        <View style={styles.questionGrid}>
          {answers.map((answer) => {
            const selected = answer.id === selectedAnswer.id;

            return (
              <Pressable
                accessibilityLabel={copy.coach.openQuestion(answer.title)}
                accessibilityRole="button"
                key={answer.id}
                onPress={() => setSelectedId(answer.id)}
                style={[styles.questionButton, selected ? styles.questionButtonActive : null]}
              >
                <Text style={[styles.questionText, selected ? styles.questionTextActive : null]}>{answer.title}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Surface>
        <Text style={styles.answerEyebrow}>{copy.coach.title}</Text>
        <Text style={styles.answerTitle}>{selectedAnswer.title}</Text>
        <Text style={styles.answerBody}>{selectedAnswer.body}</Text>
        {selectedAnswer.nextStep ? (
          <View style={styles.nextStepBlock}>
            <Text style={styles.nextStepLabel}>{copy.coach.nextStep}</Text>
            <Text style={styles.nextStepText}>{selectedAnswer.nextStep}</Text>
            {selectedAnswer.id === adaptiveDayGuidance.id ? (
              <>
                <Text style={styles.hintText}>{simplificationGuidance.statusLabel}</Text>
                {simplificationGuidance.lines.map((line) => (
                  <Text key={line} style={styles.hintText}>
                    {line}
                  </Text>
                ))}
              </>
            ) : null}
          </View>
        ) : null}
        {showSimplificationAction ? (
          <Pressable
            accessibilityLabel={simplificationGuidance.ctaLabel ?? undefined}
            accessibilityRole="button"
            onPress={simplificationGuidance.action === "restore" ? onClearDaySimplification : onApplyDaySimplification}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>{simplificationGuidance.ctaLabel}</Text>
          </Pressable>
        ) : null}
      </Surface>
      <Surface>
        <Text style={styles.answerTitle}>{copy.coach.boundary}</Text>
        <Text style={styles.answerBody}>{copy.coach.boundaryBody}</Text>
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  questionBlock: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  questionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  questionButton: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  questionButtonActive: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.moss,
  },
  questionText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  questionTextActive: {
    color: colors.text,
  },
  answerEyebrow: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  answerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  answerBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  nextStepBlock: {
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  nextStepLabel: {
    color: colors.steel,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  nextStepText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  hintText: {
    color: colors.steel,
    fontSize: 13,
    lineHeight: 19,
  },
  actionButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.moss,
    backgroundColor: colors.panelSoft,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
});
