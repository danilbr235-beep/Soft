import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { languageName, type LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppLanguage, PrivacyLockState } from "@pmhc/types";
import type { CoachAdaptiveNudge } from "../coachAdaptiveNudge";
import type {
  MorningNudgePlan,
  MorningNudgePreferences,
  MorningNudgeTimePreset,
  MorningNudgeTone,
} from "../morningNudge";
import type { MorningNudgeReview } from "../morningNudgeReview";
import { buildMorningNudgeSettingsGuidance } from "../morningNudgeSettingsGuidance";
import type { MorningRoutineReview } from "../morningRoutineReview";
import type { ReviewPreferences } from "../reviewPreferences";
import { buildReviewPreferencesGuidance } from "../reviewPreferencesGuidance";
import type { ReviewPacketHistoryEntry } from "../reviewPacketHistory";
import type { ReviewRecapFormat, ReviewSection } from "../reviewRecap";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type Props = {
  privacyLock: PrivacyLockState;
  hasPrivacyPin: boolean;
  adaptiveDayGuidance: CoachAdaptiveNudge;
  copy: LanguageCopy;
  language: AppLanguage;
  morningNudgePlan: MorningNudgePlan;
  morningNudgePreferences: MorningNudgePreferences;
  morningNudgeReview: MorningNudgeReview;
  onApplyMorningNudgePreferences: (preferences: MorningNudgePreferences) => void;
  morningRoutineReview: MorningRoutineReview;
  onChangeLanguage: (language: AppLanguage) => void;
  onChangeMorningNudgeTimePreset: (timePreset: MorningNudgeTimePreset) => void;
  onChangeMorningNudgeTone: (tone: MorningNudgeTone) => void;
  onChangeMorningNudgeWeekdaysOnly: (weekdaysOnly: boolean) => void;
  onChangeReviewDefaultFormat: (format: ReviewRecapFormat) => void;
  onChangeReviewDefaultSection: (section: ReviewSection) => void;
  onClearPrivacyPin: () => void;
  onLockNow: () => void;
  onSetPrivacyPin: (pin: string) => void;
  onApplyReviewPreferences: (preferences: ReviewPreferences) => void;
  onToggleMorningNudgesEnabled: () => void;
  onToggleMorningRoutineInPacket: () => void;
  onToggleVaultLock: () => void;
  resetOnboarding: () => void;
  reviewPackets: ReviewPacketHistoryEntry[];
  reviewPreferences: ReviewPreferences;
};

export function SettingsScreen({
  adaptiveDayGuidance,
  copy,
  hasPrivacyPin,
  language,
  morningNudgePlan,
  morningNudgePreferences,
  morningNudgeReview,
  onApplyMorningNudgePreferences,
  morningRoutineReview,
  onChangeLanguage,
  onChangeMorningNudgeTimePreset,
  onChangeMorningNudgeTone,
  onChangeMorningNudgeWeekdaysOnly,
  onChangeReviewDefaultFormat,
  onChangeReviewDefaultSection,
  onClearPrivacyPin,
  onLockNow,
  onApplyReviewPreferences,
  onSetPrivacyPin,
  onToggleMorningNudgesEnabled,
  onToggleMorningRoutineInPacket,
  onToggleVaultLock,
  privacyLock,
  resetOnboarding,
  reviewPackets,
  reviewPreferences,
}: Props) {
  const [pinDraft, setPinDraft] = useState("");
  const normalizedPin = pinDraft.replace(/\D/g, "").slice(0, 8);
  const canSavePin = normalizedPin.length >= 4;
  const morningNudgeTones: MorningNudgeTone[] = ["discreet", "supportive"];
  const morningNudgeTimings: MorningNudgeTimePreset[] = ["early", "standard", "late"];
  const reviewSections: ReviewSection[] = ["overview", "week", "month", "cycles"];
  const reviewFormats: ReviewRecapFormat[] = ["snapshot", "plan", "coach", "packet"];
  const morningNudgeSettingsGuidance = buildMorningNudgeSettingsGuidance({
    language,
    preferences: morningNudgePreferences,
    review: morningNudgeReview,
  });
  const reviewPreferencesGuidance = buildReviewPreferencesGuidance({
    history: reviewPackets,
    language,
    morningRoutineReview,
    preferences: reviewPreferences,
  });

  function savePin() {
    if (!canSavePin) {
      return;
    }

    onSetPrivacyPin(normalizedPin);
    setPinDraft("");
  }

  return (
    <Screen title={copy.settings.title} subtitle={copy.settings.subtitle}>
      <Surface>
        <Text style={styles.title}>{copy.settings.languageTitle}</Text>
        <Text style={styles.body}>{copy.settings.languageBody}</Text>
        <View style={styles.actions}>
          {(["en", "ru"] as AppLanguage[]).map((option) => (
            <Pressable
              key={option}
              accessibilityLabel={option === "en" ? copy.common.useEnglish : copy.common.useRussian}
              accessibilityRole="button"
              onPress={() => onChangeLanguage(option)}
              style={[styles.button, language === option && styles.activeButton]}
            >
              <Text style={styles.buttonText}>{languageName(option)}</Text>
            </Pressable>
          ))}
        </View>
      </Surface>
      <Surface>
        <Text style={styles.title}>{copy.settings.privacyVault}</Text>
        <Text style={styles.body}>{copy.settings.vaultStatus(privacyLock.vaultLockEnabled, privacyLock.discreetNotifications)}</Text>
        <Text style={styles.statusText}>{hasPrivacyPin ? copy.settings.pinIsSet : copy.settings.pinNotSet}</Text>
        {privacyLock.autoLockAfterMs ? (
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>{copy.settings.autoLockTitle}</Text>
            <Text style={styles.body}>{copy.settings.autoLockStatus(Math.max(1, Math.round(privacyLock.autoLockAfterMs / 60000)))}</Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={privacyLock.vaultLockEnabled ? copy.settings.turnVaultOff : copy.settings.turnVaultOn}
            accessibilityRole="button"
            onPress={onToggleVaultLock}
            style={[styles.button, privacyLock.vaultLockEnabled && styles.activeButton]}
          >
            <Text style={styles.buttonText}>{privacyLock.vaultLockEnabled ? copy.settings.vaultOn : copy.settings.vaultOff}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={copy.settings.lockDemoVault}
            accessibilityRole="button"
            disabled={!privacyLock.vaultLockEnabled}
            onPress={onLockNow}
            style={[styles.button, !privacyLock.vaultLockEnabled && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>{copy.settings.lockDemoVault}</Text>
          </Pressable>
        </View>
      </Surface>
      <Surface>
        <Text style={styles.title}>{copy.settings.morningNudgeTitle}</Text>
        <Text style={styles.body}>{copy.settings.morningNudgeBody}</Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={
              morningNudgePreferences.enabled
                ? copy.settings.disableMorningNudge
                : copy.settings.enableMorningNudge
            }
            accessibilityRole="button"
            onPress={onToggleMorningNudgesEnabled}
            style={[styles.button, morningNudgePreferences.enabled && styles.activeButton]}
          >
            <Text style={styles.buttonText}>
              {morningNudgePreferences.enabled ? copy.settings.morningNudgeOn : copy.settings.morningNudgeOff}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.infoTitle}>{copy.settings.morningNudgeStyleTitle}</Text>
        <View style={styles.actions}>
          {morningNudgeTones.map((tone) => (
            <Pressable
              key={tone}
              accessibilityLabel={copy.settings.setMorningNudgeStyle(copy.settings.morningNudgeStyles[tone])}
              accessibilityRole="button"
              onPress={() => onChangeMorningNudgeTone(tone)}
              style={[styles.button, morningNudgePreferences.tone === tone && styles.activeButton]}
            >
              <Text style={styles.buttonText}>{copy.settings.morningNudgeStyles[tone]}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.infoTitle}>{copy.settings.morningNudgeTimingTitle}</Text>
        <View style={styles.actions}>
          {morningNudgeTimings.map((timePreset) => (
            <Pressable
              key={timePreset}
              accessibilityLabel={copy.settings.setMorningNudgeTiming(copy.settings.morningNudgeTimings[timePreset])}
              accessibilityRole="button"
              onPress={() => onChangeMorningNudgeTimePreset(timePreset)}
              style={[styles.button, morningNudgePreferences.timePreset === timePreset && styles.activeButton]}
            >
              <Text style={styles.buttonText}>{copy.settings.morningNudgeTimings[timePreset]}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.infoTitle}>{copy.settings.morningNudgeCadenceTitle}</Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={copy.settings.setMorningNudgeCadence(copy.settings.morningNudgeCadence.weekdays)}
            accessibilityRole="button"
            onPress={() => onChangeMorningNudgeWeekdaysOnly(true)}
            style={[styles.button, morningNudgePreferences.weekdaysOnly && styles.activeButton]}
          >
            <Text style={styles.buttonText}>{copy.settings.morningNudgeCadence.weekdays}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={copy.settings.setMorningNudgeCadence(copy.settings.morningNudgeCadence.daily)}
            accessibilityRole="button"
            onPress={() => onChangeMorningNudgeWeekdaysOnly(false)}
            style={[styles.button, !morningNudgePreferences.weekdaysOnly && styles.activeButton]}
          >
            <Text style={styles.buttonText}>{copy.settings.morningNudgeCadence.daily}</Text>
          </Pressable>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>{morningNudgePlan.previewTitle}</Text>
          <Text style={styles.body}>{morningNudgePlan.previewBody}</Text>
          <Text style={styles.hintText}>{`${morningNudgePlan.timingTitle}: ${morningNudgePlan.timingLabel}`}</Text>
          <Text style={styles.hintText}>{`${morningNudgePlan.styleTitle}: ${morningNudgePlan.styleLabel}`}</Text>
          <Text style={styles.hintText}>{`${morningNudgePlan.focusTitle}: ${morningNudgePlan.focusLabel}`}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>{adaptiveDayGuidance.title}</Text>
          <Text style={styles.statusText}>{adaptiveDayGuidance.tone}</Text>
          <Text style={styles.body}>{adaptiveDayGuidance.body}</Text>
          <Text style={styles.hintText}>{adaptiveDayGuidance.nextStep}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>{morningNudgeSettingsGuidance.title}</Text>
          <Text style={styles.statusText}>{morningNudgeSettingsGuidance.tone}</Text>
          <Text style={styles.body}>{morningNudgeSettingsGuidance.body}</Text>
          {morningNudgeSettingsGuidance.changeLines.map((line) => (
            <Text key={line} style={styles.hintText}>
              {line}
            </Text>
          ))}
          <Text style={styles.hintText}>{morningNudgeSettingsGuidance.meta}</Text>
          {morningNudgeSettingsGuidance.recommendedPreferences && morningNudgeSettingsGuidance.ctaLabel ? (
            <Pressable
              accessibilityLabel={morningNudgeSettingsGuidance.ctaLabel}
              accessibilityRole="button"
              onPress={() => onApplyMorningNudgePreferences(morningNudgeSettingsGuidance.recommendedPreferences!)}
              style={[styles.button, styles.activeButton]}
            >
              <Text style={styles.buttonText}>{morningNudgeSettingsGuidance.ctaLabel}</Text>
            </Pressable>
          ) : (
            <Text style={styles.body}>{morningNudgeSettingsGuidance.statusLabel}</Text>
          )}
        </View>
        <Text style={styles.body}>{copy.settings.morningNudgeHint}</Text>
      </Surface>
      <Surface>
        <Text style={styles.title}>{copy.settings.pinTitle}</Text>
        <Text style={styles.body}>{copy.settings.pinBody}</Text>
        <TextInput
          accessibilityLabel={copy.settings.pinPlaceholder}
          inputMode="numeric"
          keyboardType="number-pad"
          maxLength={8}
          onChangeText={(value) => setPinDraft(value.replace(/\D/g, "").slice(0, 8))}
          placeholder={copy.settings.pinPlaceholder}
          placeholderTextColor={colors.steel}
          secureTextEntry
          style={styles.input}
          value={normalizedPin}
        />
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={hasPrivacyPin ? copy.settings.updatePin : copy.settings.savePin}
            accessibilityRole="button"
            disabled={!canSavePin}
            onPress={savePin}
            style={[styles.button, canSavePin && styles.activeButton, !canSavePin && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>{hasPrivacyPin ? copy.settings.updatePin : copy.settings.savePin}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={copy.settings.clearPin}
            accessibilityRole="button"
            disabled={!hasPrivacyPin}
            onPress={onClearPrivacyPin}
            style={[styles.button, !hasPrivacyPin && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>{copy.settings.clearPin}</Text>
          </Pressable>
        </View>
      </Surface>
      <Surface>
        <Text style={styles.title}>{copy.settings.medicalBoundary}</Text>
        <Text style={styles.body}>{copy.settings.medicalBoundaryBody}</Text>
      </Surface>
      <Surface>
        <Text style={styles.title}>{copy.settings.reviewPacketsTitle}</Text>
        <Text style={styles.body}>{copy.settings.reviewPacketsBody}</Text>
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>{reviewPreferencesGuidance.title}</Text>
          <Text style={styles.statusText}>{reviewPreferencesGuidance.tone}</Text>
          <Text style={styles.body}>{reviewPreferencesGuidance.body}</Text>
          {reviewPreferencesGuidance.changeLines.map((line) => (
            <Text key={line} style={styles.hintText}>
              {line}
            </Text>
          ))}
          <Text style={styles.hintText}>{reviewPreferencesGuidance.meta}</Text>
          {reviewPreferencesGuidance.recommendedPreferences && reviewPreferencesGuidance.ctaLabel ? (
            <Pressable
              accessibilityLabel={reviewPreferencesGuidance.ctaLabel}
              accessibilityRole="button"
              onPress={() => onApplyReviewPreferences(reviewPreferencesGuidance.recommendedPreferences!)}
              style={[styles.button, styles.activeButton]}
            >
              <Text style={styles.buttonText}>{reviewPreferencesGuidance.ctaLabel}</Text>
            </Pressable>
          ) : (
            <Text style={styles.body}>{reviewPreferencesGuidance.statusLabel}</Text>
          )}
        </View>
        <Text style={styles.infoTitle}>{copy.settings.defaultReviewSectionTitle}</Text>
        <View style={styles.actions}>
          {reviewSections.map((section) => (
            <Pressable
              key={section}
              accessibilityLabel={copy.settings.setDefaultReviewSection(copy.review.filterLabels[section])}
              accessibilityRole="button"
              onPress={() => onChangeReviewDefaultSection(section)}
              style={[styles.button, reviewPreferences.defaultSection === section && styles.activeButton]}
            >
              <Text style={styles.buttonText}>{copy.review.filterLabels[section]}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.infoTitle}>{copy.settings.defaultReviewFormatTitle}</Text>
        <View style={styles.actions}>
          {reviewFormats.map((format) => (
            <Pressable
              key={format}
              accessibilityLabel={copy.settings.setDefaultReviewFormat(copy.review.formatLabels[format])}
              accessibilityRole="button"
              onPress={() => onChangeReviewDefaultFormat(format)}
              style={[styles.button, reviewPreferences.defaultFormat === format && styles.activeButton]}
            >
              <Text style={styles.buttonText}>{copy.review.formatLabels[format]}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>{copy.settings.packetMorningTitle}</Text>
          <Text style={styles.body}>{copy.settings.packetMorningBody}</Text>
          <Pressable
            accessibilityLabel={
              reviewPreferences.includeMorningRoutineInPacket
                ? copy.settings.excludeMorningRoutineInPacket
                : copy.settings.includeMorningRoutineInPacket
            }
            accessibilityRole="button"
            onPress={onToggleMorningRoutineInPacket}
            style={[styles.button, reviewPreferences.includeMorningRoutineInPacket && styles.activeButton]}
          >
            <Text style={styles.buttonText}>
              {reviewPreferences.includeMorningRoutineInPacket
                ? copy.settings.morningRoutineInPacketOn
                : copy.settings.morningRoutineInPacketOff}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.body}>{copy.settings.reviewPacketsHint}</Text>
      </Surface>
      <Pressable accessibilityRole="button" onPress={resetOnboarding} style={styles.resetButton}>
        <Text style={styles.buttonText}>{copy.settings.reset}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  body: {
    color: colors.muted,
    lineHeight: 21,
  },
  statusText: {
    color: colors.amber,
    fontWeight: "800",
    lineHeight: 20,
  },
  infoBlock: {
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  infoTitle: {
    color: colors.text,
    fontWeight: "900",
  },
  hintText: {
    color: colors.steel,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  button: {
    minHeight: 44,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  activeButton: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.moss,
  },
  disabledButton: {
    opacity: 0.45,
  },
  input: {
    minHeight: 48,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: spacing.md,
  },
  resetButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "800",
  },
});
