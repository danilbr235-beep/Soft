import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { getCopy } from "@pmhc/i18n";
import { colors } from "@pmhc/ui";
import { BottomNav } from "./components/BottomNav";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { TodayScreen } from "./screens/TodayScreen";
import { TrackScreen } from "./screens/TrackScreen";
import { LearnScreen } from "./screens/LearnScreen";
import { ProgramsScreen } from "./screens/ProgramsScreen";
import { CoachScreen } from "./screens/CoachScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { PrivacyLockScreen } from "./screens/PrivacyLockScreen";
import { useAppState } from "./state/useAppState";

export function AppRoot() {
  const app = useAppState();
  const copy = getCopy(app.language);

  if (!app.hasCompletedOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <OnboardingScreen onComplete={app.completeOnboarding} />
      </SafeAreaView>
    );
  }

  if (app.privacyLock.locked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <PrivacyLockScreen copy={copy} onUnlock={app.unlock} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.shell}>
        {app.activeTab === "Today" ? (
          <TodayScreen copy={copy} today={app.today} onAskCoach={() => app.setActiveTab("Coach")} onLog={app.openQuickLog} />
        ) : null}
        {app.activeTab === "Track" ? (
          <TrackScreen
            logs={app.logs}
            copy={copy}
            language={app.language}
            pendingSyncCount={app.pendingSyncCount}
            onLog={app.openQuickLog}
            onSync={app.syncQueuedWrites}
          />
        ) : null}
        {app.activeTab === "Learn" ? (
          <LearnScreen
            content={app.content}
            copy={copy}
            language={app.language}
            onMarkCompleted={app.completeContent}
            onToggleSaved={app.toggleSavedContent}
          />
        ) : null}
        {app.activeTab === "Programs" ? (
          <ProgramsScreen
            activeProgram={app.today.activeProgram}
            copy={copy}
            completionPercent={app.programCompletionPercent}
            onCompleteToday={app.completeProgramToday}
          />
        ) : null}
        {app.activeTab === "Coach" ? <CoachScreen copy={copy} language={app.language} priority={app.today.currentPriority} /> : null}
        {app.activeTab === "Settings" ? (
          <SettingsScreen
            copy={copy}
            language={app.language}
            privacyLock={app.privacyLock}
            onChangeLanguage={app.changeLanguage}
            onLockNow={app.lockNow}
            onToggleVaultLock={app.togglePrivacyVault}
            resetOnboarding={app.resetOnboarding}
          />
        ) : null}
      </View>
      <BottomNav activeTab={app.activeTab} copy={copy} onChange={app.setActiveTab} />
      {app.quickLogSheet}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  shell: {
    flex: 1,
  },
});
