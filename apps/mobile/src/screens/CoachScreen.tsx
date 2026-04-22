import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import { buildCoachQuickAnswers } from "@pmhc/rules";
import type { AppLanguage, TodayPayload } from "@pmhc/types";
import type { CoachQuestionId, CoachReviewDigest } from "@pmhc/rules";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

export function CoachScreen({
  copy,
  language,
  reviewDigest,
  today,
}: {
  copy: LanguageCopy;
  language: AppLanguage;
  reviewDigest: CoachReviewDigest;
  today: TodayPayload;
}) {
  const [selectedId, setSelectedId] = useState<CoachQuestionId>("priority");
  const answers = useMemo(() => buildCoachQuickAnswers(today, language, reviewDigest), [language, reviewDigest, today]);
  const selectedAnswer = answers.find((answer) => answer.id === selectedId) ?? answers[0];

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
          </View>
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
});
