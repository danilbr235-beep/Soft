import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { buildProgramReview } from "@pmhc/programs";
import { buildTrackingPeriodReview, buildTrackingReviewDigest, buildTrackingWeeklyReview } from "@pmhc/tracking";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors } from "@pmhc/ui";
import type { LogEntry, ProgramHistoryEntry } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  copy: LanguageCopy;
  logs: LogEntry[];
  programHistory: ProgramHistoryEntry[];
};

export function ReviewScreen({ copy, logs, programHistory }: Props) {
  const reviewDigest = useMemo(() => buildTrackingReviewDigest(logs, programHistory), [logs, programHistory]);
  const weeklyReview = useMemo(() => buildTrackingWeeklyReview(logs, programHistory), [logs, programHistory]);
  const monthlyReview = useMemo(() => buildTrackingPeriodReview(logs, programHistory, 30), [logs, programHistory]);
  const programReview = useMemo(() => buildProgramReview(programHistory), [programHistory]);

  return (
    <Screen title={copy.review.title} subtitle={copy.review.subtitle}>
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
      <PeriodReviewCard
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
      <PeriodReviewCard
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
    </Screen>
  );
}

function PeriodReviewCard({
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
  hintTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  signalDetail: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  hintMeta: {
    color: colors.steel,
    fontSize: 12,
    fontWeight: "800",
  },
});
