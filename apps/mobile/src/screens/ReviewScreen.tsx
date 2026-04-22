import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { buildProgramReview } from "@pmhc/programs";
import { buildTrackingPeriodReview, buildTrackingReviewDigest, buildTrackingWeeklyReview } from "@pmhc/tracking";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { LogEntry, ProgramHistoryEntry } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";
import { buildReviewRecap, type ReviewRecapFormat, type ReviewRecapResult, type ReviewSection } from "../reviewRecap";

type Props = {
  copy: LanguageCopy;
  logs: LogEntry[];
  programHistory: ProgramHistoryEntry[];
};

export function ReviewScreen({ copy, logs, programHistory }: Props) {
  const [activeSection, setActiveSection] = useState<ReviewSection>("overview");
  const [activeFormat, setActiveFormat] = useState<ReviewRecapFormat>("snapshot");
  const [recapPreview, setRecapPreview] = useState<ReviewRecapResult | null>(null);
  const reviewDigest = useMemo(() => buildTrackingReviewDigest(logs, programHistory), [logs, programHistory]);
  const weeklyReview = useMemo(() => buildTrackingWeeklyReview(logs, programHistory), [logs, programHistory]);
  const monthlyReview = useMemo(() => buildTrackingPeriodReview(logs, programHistory, 30), [logs, programHistory]);
  const programReview = useMemo(() => buildProgramReview(programHistory), [programHistory]);
  const sectionOrder: ReviewSection[] = ["overview", "week", "month", "cycles"];
  const formatOrder: ReviewRecapFormat[] = ["snapshot", "plan", "coach", "packet"];

  function selectSection(section: ReviewSection) {
    setActiveSection(section);
    setRecapPreview(null);
  }

  function prepareRecap() {
    setRecapPreview(
      buildReviewRecap({
        copy,
        format: activeFormat,
        monthlyReview,
        programReview,
        reviewDigest,
        section: activeSection,
        weeklyReview,
      }),
    );
  }

  function selectFormat(format: ReviewRecapFormat) {
    setActiveFormat(format);
    setRecapPreview(null);
  }

  return (
    <Screen title={copy.review.title} subtitle={copy.review.subtitle}>
      <Surface>
        <View style={styles.filterRow}>
          {sectionOrder.map((section) => {
            const active = section === activeSection;
            return (
              <Pressable
                accessibilityLabel={copy.review.openFilter(copy.review.filterLabels[section])}
                accessibilityRole="button"
                key={section}
                onPress={() => selectSection(section)}
                style={[styles.filterButton, active && styles.activeFilterButton]}
              >
                <Text style={[styles.filterButtonText, active && styles.activeFilterButtonText]}>
                  {copy.review.filterLabels[section]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Surface>
      {activeSection === "overview" ? (
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
      ) : null}
      {activeSection === "week" ? (
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
      ) : null}
      {activeSection === "month" ? (
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
      ) : null}
      {activeSection === "cycles" ? (
        <Surface>
          <Text style={styles.title}>{copy.track.programReviewTitle}</Text>
          <Text style={styles.body}>{copy.track.programReviewBody}</Text>
          {programReview ? (
            <>
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
            </>
          ) : (
            <Text style={styles.body}>{copy.review.noCycles}</Text>
          )}
        </Surface>
      ) : null}
      <Surface>
        <Text style={styles.title}>{copy.review.recapTitle}</Text>
        <Text style={styles.body}>{copy.review.recapBody}</Text>
        <Text style={styles.signalDetail}>{copy.review.summaryFormatTitle}</Text>
        <View style={styles.filterRow}>
          {formatOrder.map((format) => {
            const active = format === activeFormat;
            return (
              <Pressable
                accessibilityLabel={copy.review.openFormat(copy.review.formatLabels[format])}
                accessibilityRole="button"
                key={format}
                onPress={() => selectFormat(format)}
                style={[styles.filterButton, active && styles.activeFilterButton]}
              >
                <Text style={[styles.filterButtonText, active && styles.activeFilterButtonText]}>
                  {copy.review.formatLabels[format]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          accessibilityLabel={copy.review.recapAction}
          accessibilityRole="button"
          onPress={prepareRecap}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>{copy.review.recapAction}</Text>
        </Pressable>
        {recapPreview ? (
          <View style={styles.recapPreview}>
            <Text style={styles.hintMeta}>{copy.review.recapPreview(copy.review.formatLabels[activeFormat])}</Text>
            {recapPreview.kind === "packet" ? (
              <View style={styles.packetList}>
                <Text style={styles.packetHeader}>{recapPreview.title}</Text>
                {recapPreview.blocks.map((block, index) => (
                  <View
                    key={block.id}
                    style={[styles.packetBlock, index > 0 ? styles.packetBlockDivider : null]}
                  >
                    <Text style={styles.packetBlockTitle}>{block.title}</Text>
                    {block.lines.map((line) => (
                      <Text key={`${block.id}-${line}`} style={styles.recapText}>
                        {line}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.recapText}>{recapPreview.text}</Text>
            )}
          </View>
        ) : null}
      </Surface>
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
  recapPreview: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
    padding: spacing.md,
  },
  recapText: {
    color: colors.text,
    lineHeight: 21,
  },
  packetList: {
    gap: spacing.sm,
  },
  packetHeader: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  packetBlock: {
    gap: spacing.xs,
  },
  packetBlockDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
  },
  packetBlockTitle: {
    color: colors.steel,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
