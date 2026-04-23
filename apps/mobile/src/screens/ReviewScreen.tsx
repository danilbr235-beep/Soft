import { useMemo, useState } from "react";
import { Platform, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { buildProgramReview } from "@pmhc/programs";
import { buildTrackingPeriodReview, buildTrackingReviewDigest, buildTrackingWeeklyReview } from "@pmhc/tracking";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppLanguage, LogEntry, ProgramHistoryEntry } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";
import type { MorningNudgeReview } from "../morningNudgeReview";
import type { MorningRoutineReview } from "../morningRoutineReview";
import type { ReviewPreferences } from "../reviewPreferences";
import type { ReviewPacketHistoryEntry } from "../reviewPacketHistory";
import { buildReviewRecap, type ReviewRecapFormat, type ReviewRecapResult, type ReviewSection } from "../reviewRecap";
import {
  buildReviewPacketExportText,
  filterReviewPacketHistory,
  formatPacketSavedAt as formatReviewPacketSavedAt,
  type ReviewPacketArchiveFilter,
} from "../reviewPacketExport";

type Props = {
  copy: LanguageCopy;
  language: AppLanguage;
  logs: LogEntry[];
  morningNudgeReview: MorningNudgeReview;
  morningRoutineReview: MorningRoutineReview;
  onSavePacket: (section: ReviewSection, packet: Extract<ReviewRecapResult, { kind: "packet" }>) => Promise<void> | void;
  preferences: ReviewPreferences;
  programHistory: ProgramHistoryEntry[];
  reviewPackets: ReviewPacketHistoryEntry[];
};

export function ReviewScreen({
  copy,
  language,
  logs,
  morningNudgeReview,
  morningRoutineReview,
  onSavePacket,
  preferences,
  programHistory,
  reviewPackets,
}: Props) {
  const [activeSection, setActiveSection] = useState<ReviewSection>(preferences.defaultSection);
  const [activeFormat, setActiveFormat] = useState<ReviewRecapFormat>(preferences.defaultFormat);
  const [archiveFilter, setArchiveFilter] = useState<ReviewPacketArchiveFilter>("all");
  const [exportStatus, setExportStatus] = useState<"copied" | "shared" | "unavailable" | null>(null);
  const [recapPreview, setRecapPreview] = useState<ReviewRecapResult | null>(null);
  const reviewDigest = useMemo(() => buildTrackingReviewDigest(logs, programHistory), [logs, programHistory]);
  const weeklyReview = useMemo(() => buildTrackingWeeklyReview(logs, programHistory), [logs, programHistory]);
  const monthlyReview = useMemo(() => buildTrackingPeriodReview(logs, programHistory, 30), [logs, programHistory]);
  const programReview = useMemo(() => buildProgramReview(programHistory), [programHistory]);
  const sectionOrder: ReviewSection[] = ["overview", "week", "month", "cycles"];
  const formatOrder: ReviewRecapFormat[] = ["snapshot", "plan", "coach", "packet"];
  const archiveFilterOrder: ReviewPacketArchiveFilter[] = ["all", ...sectionOrder];
  const visibleReviewPackets = useMemo(
    () => filterReviewPacketHistory(reviewPackets, archiveFilter),
    [archiveFilter, reviewPackets],
  );

  function selectSection(section: ReviewSection) {
    setActiveSection(section);
    setRecapPreview(null);
  }

  function prepareRecap() {
    const nextPreview = buildReviewRecap({
      copy,
      format: activeFormat,
      morningNudgeReview,
      morningRoutineReview,
      monthlyReview,
      packetOptions: {
        includeMorningRoutine: preferences.includeMorningRoutineInPacket,
      },
      programReview,
      reviewDigest,
      section: activeSection,
      weeklyReview,
    });

    setRecapPreview(nextPreview);

    if (nextPreview.kind === "packet") {
      void onSavePacket(activeSection, nextPreview);
    }
  }

  function selectFormat(format: ReviewRecapFormat) {
    setActiveFormat(format);
    setRecapPreview(null);
  }

  function selectArchiveFilter(filter: ReviewPacketArchiveFilter) {
    setArchiveFilter(filter);
    setExportStatus(null);
  }

  async function exportPacket(packet: ReviewPacketHistoryEntry) {
    const text = buildReviewPacketExportText({
      copy,
      entry: packet,
      language,
    });
    const result = await exportReviewPacketText(text);
    setExportStatus(result);
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
        <>
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
          <MorningRoutineReviewCard review={morningRoutineReview} />
          <MorningNudgeReviewCard review={morningNudgeReview} />
        </>
      ) : null}
      {activeSection === "week" ? (
        <>
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
          <MorningRoutineReviewCard review={morningRoutineReview} />
        </>
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
              <PacketBlocksView blocks={recapPreview.blocks} title={recapPreview.title} />
            ) : (
              <Text style={styles.recapText}>{recapPreview.text}</Text>
            )}
          </View>
        ) : null}
      </Surface>
      <Surface>
        <Text style={styles.title}>{copy.review.archiveTitle}</Text>
        <Text style={styles.body}>{copy.review.archiveBody}</Text>
        <Text style={styles.signalDetail}>{copy.review.archiveFilterTitle}</Text>
        <View style={styles.filterRow}>
          {archiveFilterOrder.map((filter) => {
            const active = filter === archiveFilter;
            const label = filter === "all" ? copy.review.archiveFilterLabels.all : copy.review.filterLabels[filter];

            return (
              <Pressable
                accessibilityLabel={copy.review.openArchiveFilter(label)}
                accessibilityRole="button"
                key={filter}
                onPress={() => selectArchiveFilter(filter)}
                style={[styles.filterButton, active && styles.activeFilterButton]}
              >
                <Text style={[styles.filterButtonText, active && styles.activeFilterButtonText]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        {exportStatus ? <Text style={styles.hintMeta}>{copy.review.exportStatuses[exportStatus]}</Text> : null}
        {reviewPackets.length > 0 ? (
          <View style={styles.packetList}>
            {visibleReviewPackets.length > 0 ? visibleReviewPackets.map((packet, index) => (
              <View key={packet.id} style={[styles.archiveEntry, index > 0 ? styles.archiveEntryDivider : null]}>
                <Text style={styles.hintMeta}>
                  {copy.review.archiveSavedAt(
                    copy.review.filterLabels[packet.section],
                    formatReviewPacketSavedAt(packet.createdAt, language),
                  )}
                </Text>
                <PacketBlocksView blocks={packet.blocks} title={packet.title} />
                <Pressable
                  accessibilityLabel={copy.review.exportPacket(packet.title)}
                  accessibilityRole="button"
                  onPress={() => {
                    void exportPacket(packet);
                  }}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>{copy.review.exportPacketAction}</Text>
                </Pressable>
              </View>
            )) : (
              <Text style={styles.body}>
                {copy.review.archiveEmptyFiltered(
                  archiveFilter === "all" ? copy.review.archiveFilterLabels.all : copy.review.filterLabels[archiveFilter],
                )}
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.body}>{copy.review.archiveEmpty}</Text>
        )}
      </Surface>
    </Screen>
  );
}

function MorningNudgeReviewCard({ review }: { review: MorningNudgeReview }) {
  return (
    <Surface>
      <Text style={styles.title}>{review.title}</Text>
      <Text style={styles.body}>{review.body}</Text>
      <Text style={styles.signalDetail}>{review.stateTitle}</Text>
      <Text style={styles.body}>{review.stateLabel}</Text>
      <Text style={styles.signalDetail}>{review.timingTitle}</Text>
      <Text style={styles.body}>{review.timingLabel}</Text>
      <Text style={styles.signalDetail}>{review.styleTitle}</Text>
      <Text style={styles.body}>{review.styleLabel}</Text>
      <Text style={styles.signalDetail}>{review.focusTitle}</Text>
      <Text style={styles.body}>{review.focusLabel}</Text>
      <Text style={styles.signalDetail}>{review.previewTitle}</Text>
      <Text style={styles.body}>{review.previewBody}</Text>
      <Text style={styles.hintMeta}>{review.historyTitle}</Text>
      <Text style={styles.hintMeta}>{review.historyLabel}</Text>
    </Surface>
  );
}

function MorningRoutineReviewCard({ review }: { review: MorningRoutineReview }) {
  return (
    <Surface>
      <Text style={styles.title}>{review.title}</Text>
      <Text style={styles.body}>{review.body}</Text>
      <Text style={styles.hintTitle}>{review.tone}</Text>
      <Text style={styles.body}>{review.reason}</Text>
      <Text style={styles.signalDetail}>{review.nextStepTitle}</Text>
      <Text style={styles.body}>{review.nextStep}</Text>
      <Text style={styles.hintMeta}>{review.meta}</Text>
      {review.stepLines.map((line) => (
        <Text key={line} style={styles.hintMeta}>
          {line}
        </Text>
      ))}
    </Surface>
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

function PacketBlocksView({
  blocks,
  title,
}: {
  blocks: ReviewPacketHistoryEntry["blocks"];
  title: string;
}) {
  return (
    <View style={styles.packetList}>
      <Text style={styles.packetHeader}>{title}</Text>
      {blocks.map((block, index) => (
        <View key={block.id} style={[styles.packetBlock, index > 0 ? styles.packetBlockDivider : null]}>
          <Text style={styles.packetBlockTitle}>{block.title}</Text>
          {block.lines.map((line) => (
            <Text key={`${block.id}-${line}`} style={styles.recapText}>
              {line}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

async function exportReviewPacketText(text: string): Promise<"copied" | "shared" | "unavailable"> {
  if (Platform.OS === "web") {
    const copied = await copyTextOnWeb(text);
    return copied ? "copied" : "unavailable";
  }

  try {
    await Share.share({ message: text });
    return "shared";
  } catch {
    return "unavailable";
  }
}

async function copyTextOnWeb(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.opacity = "0";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return typeof document.execCommand === "function" ? document.execCommand("copy") : false;
  } finally {
    document.body.removeChild(textarea);
  }
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
  secondaryButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.panelSoft,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "800",
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
  archiveEntry: {
    gap: spacing.sm,
  },
  archiveEntryDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.md,
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
