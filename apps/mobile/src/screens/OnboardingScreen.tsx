import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { createOnboardingResult } from "@pmhc/onboarding";
import { colors, radii, spacing } from "@pmhc/ui";
import type { GoalType, OnboardingResult, UserMode } from "@pmhc/types";

type Props = {
  onComplete: (result: OnboardingResult) => void;
};

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [primaryGoal, setPrimaryGoal] = useState<GoalType>("sexual_confidence");
  const [mode, setMode] = useState<UserMode>("Simple");
  const [baselinePreset, setBaselinePreset] = useState<"low" | "mixed" | "stable">("mixed");
  const [hasRedFlag, setHasRedFlag] = useState(false);

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
        language: "ru",
      }),
    );
  }

  if (step === 1) {
    return (
      <View style={styles.wrap}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Step 1 of 4</Text>
          <Text style={styles.title}>Choose the main focus.</Text>
          <Text style={styles.body}>This sets the first program and the first Today priority.</Text>
        </View>
        <View style={styles.optionStack}>
          <Choice label="Confidence" active={primaryGoal === "sexual_confidence"} onPress={() => setPrimaryGoal("sexual_confidence")} />
          <Choice label="Pelvic floor" active={primaryGoal === "pelvic_floor"} onPress={() => setPrimaryGoal("pelvic_floor")} />
          <Choice label="Recovery" active={primaryGoal === "recovery"} onPress={() => setPrimaryGoal("recovery")} />
          <Choice label="Sleep setup" active={primaryGoal === "sleep_environment"} onPress={() => setPrimaryGoal("sleep_environment")} />
        </View>
        <Footer onBack={() => setStep(0)} onNext={() => setStep(2)} />
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.wrap}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Step 2 of 4</Text>
          <Text style={styles.title}>Set a simple baseline.</Text>
          <Text style={styles.body}>Use a rough starting point. You can refine it with quick logs later.</Text>
        </View>
        <View style={styles.optionStack}>
          <Choice label="Low energy / high stress" active={baselinePreset === "low"} onPress={() => setBaselinePreset("low")} />
          <Choice label="Mixed signals" active={baselinePreset === "mixed"} onPress={() => setBaselinePreset("mixed")} />
          <Choice label="Mostly stable" active={baselinePreset === "stable"} onPress={() => setBaselinePreset("stable")} />
        </View>
        <Footer onBack={() => setStep(1)} onNext={() => setStep(3)} />
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={styles.wrap}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Step 3 of 4</Text>
          <Text style={styles.title}>Choose operating style.</Text>
          <Text style={styles.body}>Simple keeps Today lighter. Pro adds more detail once you want it.</Text>
        </View>
        <View style={styles.optionStack}>
          <Choice label="Simple mode" active={mode === "Simple"} onPress={() => setMode("Simple")} />
          <Choice label="Pro mode" active={mode === "Pro"} onPress={() => setMode("Pro")} />
          <Choice label="Use conservative guidance" active={hasRedFlag} onPress={() => setHasRedFlag(!hasRedFlag)} />
        </View>
        <Footer onBack={() => setStep(2)} onNext={finish} nextLabel="Generate Today" />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Private by design</Text>
        <Text style={styles.title}>A calm daily coach for recovery, confidence, and tracking.</Text>
        <Text style={styles.body}>
          Start with a light baseline. The app explains patterns, supports routines, and keeps sensitive details discreet.
        </Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Before you start</Text>
        <Text style={styles.panelText}>This is educational tracking support. It does not diagnose, treat, or replace urgent care.</Text>
        <Text style={styles.panelText}>You control what gets logged. Sensitive sections can stay behind a vault lock later.</Text>
      </View>
      <Pressable style={styles.primary} onPress={() => setStep(1)}>
        <Text style={styles.primaryText}>Start privately</Text>
      </Pressable>
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

function Footer({ onBack, onNext, nextLabel = "Next" }: { onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <View style={styles.footer}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" style={styles.secondary} onPress={onBack}>
        <Text style={styles.secondaryText}>Back</Text>
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
