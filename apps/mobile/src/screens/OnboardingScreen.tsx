import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { createOnboardingResult } from "@pmhc/onboarding";
import { getCopy, languageName } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppLanguage, GoalType, OnboardingResult, UserMode } from "@pmhc/types";

type Props = {
  onComplete: (result: OnboardingResult) => void;
};

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [primaryGoal, setPrimaryGoal] = useState<GoalType>("sexual_confidence");
  const [mode, setMode] = useState<UserMode>("Simple");
  const [baselinePreset, setBaselinePreset] = useState<"low" | "mixed" | "stable">("mixed");
  const [hasRedFlag, setHasRedFlag] = useState(false);
  const copy = getCopy(language);

  function finish() {
    onComplete(
      createOnboardingResult({
        primaryGoal,
        secondaryGoals: primaryGoal === "pelvic_floor" ? ["recovery"] : ["recovery", "tracking"],
        mode,
        baseline: baselineForPreset(baselinePreset),
        redFlags: hasRedFlag ? ["needs_conservative_review"] : [],
        privacy: {
          vaultLockEnabled: true,
          discreetNotifications: true,
        },
        language,
      }),
    );
  }

  if (step === 1) {
    return (
      <View style={styles.wrap}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{copy.onboarding.stepOneEyebrow}</Text>
          <Text style={styles.title}>{copy.onboarding.stepOneTitle}</Text>
          <Text style={styles.body}>{copy.onboarding.stepOneBody}</Text>
        </View>
        <View style={styles.optionStack}>
          <Choice label={copy.onboarding.goals.sexual_confidence} active={primaryGoal === "sexual_confidence"} onPress={() => setPrimaryGoal("sexual_confidence")} />
          <Choice label={copy.onboarding.goals.pelvic_floor} active={primaryGoal === "pelvic_floor"} onPress={() => setPrimaryGoal("pelvic_floor")} />
          <Choice label={copy.onboarding.goals.recovery} active={primaryGoal === "recovery"} onPress={() => setPrimaryGoal("recovery")} />
          <Choice label={copy.onboarding.goals.sleep_environment} active={primaryGoal === "sleep_environment"} onPress={() => setPrimaryGoal("sleep_environment")} />
        </View>
        <Footer backLabel={copy.common.back} nextLabel={copy.common.next} onBack={() => setStep(0)} onNext={() => setStep(2)} />
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.wrap}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{copy.onboarding.stepTwoEyebrow}</Text>
          <Text style={styles.title}>{copy.onboarding.stepTwoTitle}</Text>
          <Text style={styles.body}>{copy.onboarding.stepTwoBody}</Text>
        </View>
        <View style={styles.optionStack}>
          <Choice label={copy.onboarding.baselines.low} active={baselinePreset === "low"} onPress={() => setBaselinePreset("low")} />
          <Choice label={copy.onboarding.baselines.mixed} active={baselinePreset === "mixed"} onPress={() => setBaselinePreset("mixed")} />
          <Choice label={copy.onboarding.baselines.stable} active={baselinePreset === "stable"} onPress={() => setBaselinePreset("stable")} />
        </View>
        <Footer backLabel={copy.common.back} nextLabel={copy.common.next} onBack={() => setStep(1)} onNext={() => setStep(3)} />
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={styles.wrap}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{copy.onboarding.stepThreeEyebrow}</Text>
          <Text style={styles.title}>{copy.onboarding.stepThreeTitle}</Text>
          <Text style={styles.body}>{copy.onboarding.stepThreeBody}</Text>
        </View>
        <View style={styles.optionStack}>
          <Choice label={copy.onboarding.modes.Simple} active={mode === "Simple"} onPress={() => setMode("Simple")} />
          <Choice label={copy.onboarding.modes.Pro} active={mode === "Pro"} onPress={() => setMode("Pro")} />
          <Choice label={copy.onboarding.conservative} active={hasRedFlag} onPress={() => setHasRedFlag(!hasRedFlag)} />
        </View>
        <Footer backLabel={copy.common.back} onBack={() => setStep(2)} onNext={finish} nextLabel={copy.onboarding.generateToday} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <LanguageSelector language={language} setLanguage={setLanguage} />
        <Text style={styles.eyebrow}>{copy.onboarding.heroEyebrow}</Text>
        <Text style={styles.title}>{copy.onboarding.heroTitle}</Text>
        <Text style={styles.body}>{copy.onboarding.heroBody}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{copy.onboarding.beforeTitle}</Text>
        <Text style={styles.panelText}>{copy.onboarding.beforeLine1}</Text>
        <Text style={styles.panelText}>{copy.onboarding.beforeLine2}</Text>
      </View>
      <Pressable style={styles.primary} onPress={() => setStep(1)}>
        <Text style={styles.primaryText}>{copy.onboarding.start}</Text>
      </Pressable>
    </View>
  );
}

function LanguageSelector({
  language,
  setLanguage,
}: {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}) {
  const copy = getCopy(language);

  return (
    <View style={styles.languageBlock}>
      <Text style={styles.languageLabel}>{copy.common.language}</Text>
      <View style={styles.languageRow}>
        {(["en", "ru"] as AppLanguage[]).map((option) => (
          <Pressable
            key={option}
            accessibilityLabel={option === "en" ? copy.common.useEnglish : copy.common.useRussian}
            accessibilityRole="button"
            onPress={() => setLanguage(option)}
            style={[styles.languageButton, language === option && styles.activeChoice]}
          >
            <Text style={[styles.choiceText, language === option && styles.activeChoiceText]}>
              {languageName(option)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Choice({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.choice, active && styles.activeChoice]}>
      <Text style={[styles.choiceText, active && styles.activeChoiceText]}>{label}</Text>
    </Pressable>
  );
}

function Footer({ backLabel, onBack, onNext, nextLabel }: { backLabel: string; onBack: () => void; onNext: () => void; nextLabel: string }) {
  return (
    <View style={styles.footer}>
      <Pressable accessibilityRole="button" accessibilityLabel={backLabel} style={styles.secondary} onPress={onBack}>
        <Text style={styles.secondaryText}>{backLabel}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={nextLabel} style={styles.footerPrimary} onPress={onNext}>
        <Text style={styles.primaryText}>{nextLabel}</Text>
      </Pressable>
    </View>
  );
}

function baselineForPreset(preset: "low" | "mixed" | "stable") {
  if (preset === "low") {
    return { sleep: 3, energy: 3, confidence: 3, libido: 3, stress: 8 };
  }

  if (preset === "stable") {
    return { sleep: 7, energy: 7, confidence: 6, libido: 6, stress: 3 };
  }

  return { sleep: 5, energy: 5, confidence: 4, libido: 4, stress: 6 };
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.xl,
    backgroundColor: colors.ink,
  },
  copy: {
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  eyebrow: {
    color: colors.moss,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  panelText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  primary: {
    minHeight: 54,
    borderRadius: radii.md,
    backgroundColor: colors.moss,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  optionStack: {
    gap: spacing.sm,
  },
  languageBlock: {
    gap: spacing.sm,
  },
  languageLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  languageRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  languageButton: {
    minHeight: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  choice: {
    minHeight: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  activeChoice: {
    borderColor: colors.moss,
    backgroundColor: colors.panelSoft,
  },
  choiceText: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "800",
  },
  activeChoiceText: {
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondary: {
    flex: 1,
    minHeight: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  footerPrimary: {
    flex: 2,
    minHeight: 54,
    borderRadius: radii.md,
    backgroundColor: colors.moss,
    alignItems: "center",
    justifyContent: "center",
  },
});
