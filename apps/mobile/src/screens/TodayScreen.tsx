import { StyleSheet, Text, View } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, spacing } from "@pmhc/ui";
import type { PrivacyLockState, QuickLogDefinition, TodayPayload } from "@pmhc/types";
import type { CoachAdaptiveNudge } from "../coachAdaptiveNudge";
import type { DailySession, DailySessionStepId } from "../dailySession";
import type { MorningExperiments } from "../morningExperiments";
import type { MorningNudgePlan } from "../morningNudge";
import type { MorningNudgeReview } from "../morningNudgeReview";
import type { MorningRoutine } from "../morningRoutine";
import type { MorningRoutineStepId } from "../morningRoutineProgress";
import {
  AdaptiveDayGuidanceBlock,
  AlertStrip,
  DailySessionBlock,
  MorningExperimentsBlock,
  MorningNudgeBlock,
  MorningRoutineBlock,
  PriorityCard,
  QuickLogRow,
  StateGrid,
  TodayStatusRow,
} from "../components/TodayComponents";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";
import { buildTodayStatusItems } from "../todayStatus";

type Props = {
  today: TodayPayload;
  copy: LanguageCopy;
  dailySession: DailySession;
  adaptiveDayGuidance: CoachAdaptiveNudge;
  morningExperiments: MorningExperiments;
  morningNudge: MorningNudgePlan;
  morningNudgeReview: MorningNudgeReview;
  morningRoutine: MorningRoutine;
  privacyLock: PrivacyLockState;
  onAskCoach: () => void;
  onCompleteMorningRoutineStep: (stepId: MorningRoutineStepId) => void;
  onLog: (definition: QuickLogDefinition) => void;
  onOpenDailySessionStep: (stepId: DailySessionStepId) => void;
  onOpenMorningExperiment: (itemId: string | null) => void;
  onOpenMorningGuide: () => void;
  onOpenMorningLog: () => void;
};

export function TodayScreen({
  adaptiveDayGuidance,
  copy,
  dailySession,
  morningExperiments,
  morningNudge,
  morningNudgeReview,
  morningRoutine,
  onAskCoach,
  onCompleteMorningRoutineStep,
  onLog,
  onOpenDailySessionStep,
  onOpenMorningExperiment,
  onOpenMorningGuide,
  onOpenMorningLog,
  privacyLock,
  today,
}: Props) {
  const activeProgramTitle = today.activeProgram
    ? copy.programs.programTitles[today.activeProgram.id] ?? today.activeProgram.title
    : copy.today.noActiveProgram;
  const statusItems = buildTodayStatusItems({
    copy,
    privacyLock,
    programTitle: today.activeProgram ? activeProgramTitle : null,
    today,
  });

  return (
    <Screen eyebrow={today.todayMode} title={copy.today.title} subtitle={activeProgramTitle}>
      <TodayStatusRow items={statusItems} />
      <MorningRoutineBlock
        routine={morningRoutine}
        onCompleteStep={onCompleteMorningRoutineStep}
        onOpenGuide={onOpenMorningGuide}
        onOpenLog={onOpenMorningLog}
      />
      {morningNudge.enabled ? <MorningNudgeBlock plan={morningNudge} review={morningNudgeReview} /> : null}
      <MorningExperimentsBlock experiments={morningExperiments} onOpenExperiment={onOpenMorningExperiment} />
      <AdaptiveDayGuidanceBlock copy={copy} guidance={adaptiveDayGuidance} onAskCoach={onAskCoach} />
      <PriorityCard copy={copy} priority={today.currentPriority} onAskCoach={onAskCoach} />
      <DailySessionBlock session={dailySession} onOpenStep={onOpenDailySessionStep} />
      <StateGrid tiles={today.dailyState} />
      <AlertStrip alerts={today.alerts} />
      <View style={styles.actions}>
        {today.actionCards.map((card) => (
          <Surface key={card.id}>
            <Text style={styles.actionKind}>{copy.today.actionKinds[card.kind]}</Text>
            <Text style={styles.actionTitle}>{card.title}</Text>
            <Text style={styles.actionBody}>{card.description}</Text>
            <Text style={styles.actionCta}>{card.cta}</Text>
          </Surface>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{copy.today.quickLog}</Text>
        <QuickLogRow accessibilityPrefix={copy.today.quickLog} logs={today.quickLogs} onLog={onLog} />
      </View>
      <Surface>
        <Text style={styles.sectionTitle}>{copy.today.liveUpdate}</Text>
        <Text style={styles.actionTitle}>{today.liveUpdates[0]?.title}</Text>
        <Text style={styles.actionBody}>{today.liveUpdates[0]?.sourceLabel}</Text>
      </Surface>
      <Surface>
        <Text style={styles.sectionTitle}>{copy.today.insight}</Text>
        <Text style={styles.actionTitle}>{today.insights[0]?.title}</Text>
        <Text style={styles.actionBody}>{today.insights[0]?.summary}</Text>
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  actionKind: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  actionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  actionBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  actionCta: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
