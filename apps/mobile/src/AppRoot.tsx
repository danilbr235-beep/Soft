import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
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
        <PrivacyLockScreen onUnlock={app.unlock} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.shell}>
        {app.activeTab === "Today" ? (
          <TodayScreen today={app.today} onLog={app.openQuickLog} />
        ) : null}
        {app.activeTab === "Track" ? (
          <TrackScreen
            logs={app.logs}
            pendingSyncCount={app.pendingSyncCount}
            onLog={app.openQuickLog}
            onSync={app.syncQueuedWrites}
          />
        ) : null}
        {app.activeTab === "Learn" ? (
          <LearnScreen
            content={app.content}
            onMarkCompleted={app.completeContent}
            onToggleSaved={app.toggleSavedContent}
          />
        ) : null}
        {app.activeTab === "Programs" ? <ProgramsScreen activeProgram={app.today.activeProgram} /> : null}
        {app.activeTab === "Coach" ? <CoachScreen priority={app.today.currentPriority} /> : null}
        {app.activeTab === "Settings" ? (
          <SettingsScreen
            privacyLock={app.privacyLock}
            onLockNow={app.lockNow}
            onToggleVaultLock={app.togglePrivacyVault}
            resetOnboarding={app.resetOnboarding}
          />
        ) : null}
      </View>
      <BottomNav activeTab={app.activeTab} onChange={app.setActiveTab} />
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
