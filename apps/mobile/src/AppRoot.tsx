import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { getCopy } from "@pmhc/i18n";
import { colors } from "@pmhc/ui";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { BottomNav } from "./components/BottomNav";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { LoadingScreen } from "./screens/LoadingScreen";
import { TodayScreen } from "./screens/TodayScreen";
import { TrackScreen } from "./screens/TrackScreen";
import { LearnScreen } from "./screens/LearnScreen";
import { ProgramsScreen } from "./screens/ProgramsScreen";
import { CoachScreen } from "./screens/CoachScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { PrivacyLockScreen } from "./screens/PrivacyLockScreen";
import { useAppState } from "./state/useAppState";
import { debugStorageKeys } from "./storage/appStorageKeys";

export function AppRoot() {
  return (
    <AppErrorBoundary>
      <AppRootContent />
    </AppErrorBoundary>
  );
}

function AppRootContent() {
  const app = useAppState();
  const copy = getCopy(app.language);

  if (shouldForceStartupError()) {
    throw new Error("Forced startup recovery check");
  }

  if (!app.isReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <LoadingScreen />
      </SafeAreaView>
    );
  }

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
        <PrivacyLockScreen
          copy={copy}
          failedAttempts={app.privacyLock.failedUnlockAttempts}
          hasPrivacyPin={app.hasPrivacyPin}
          onUnlock={app.unlock}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.shell}>
        {app.activeTab === "Today" ? (
          <TodayScreen
            copy={copy}
            privacyLock={app.privacyLock}
            today={app.today}
            onAskCoach={() => app.setActiveTab("Coach")}
            onLog={app.openQuickLog}
          />
        ) : null}
        {app.activeTab === "Track" ? (
          <TrackScreen
            logs={app.logs}
            copy={copy}
            pendingSyncCount={app.pendingSyncCount}
            onDeleteLog={app.deleteLog}
            onUpdateLog={app.updateLogValue}
            onLog={app.openQuickLog}
            onSync={app.syncQueuedWrites}
            programHistory={app.programHistory}
          />
        ) : null}
        {app.activeTab === "Learn" ? (
          <LearnScreen
            activeProgramCategory={app.today.activeProgram?.category ?? null}
            content={app.content}
            copy={copy}
            language={app.language}
            onMarkCompleted={app.completeContent}
            onToggleSaved={app.toggleSavedContent}
            priorityDomain={app.today.currentPriority.domain}
          />
        ) : null}
        {app.activeTab === "Programs" ? (
          <ProgramsScreen
            alerts={app.today.alerts}
            activeProgram={app.today.activeProgram}
            copy={copy}
            completionPercent={app.programCompletionPercent}
            currentPriority={app.today.currentPriority}
            dayPlan={app.programDayPlan}
            history={app.programHistory}
            isPaused={app.programPaused}
            progressSummary={app.programSummary}
            onCompleteToday={app.completeProgramToday}
            onPauseProgram={app.pauseProgram}
            onRestToday={app.restProgramToday}
            onResumeProgram={app.resumeProgram}
            onStartRecommendedProgram={app.startRecommendedProgram}
            onSkipToday={app.skipProgramToday}
            onToggleTask={app.toggleProgramTask}
            todayMode={app.today.todayMode}
          />
        ) : null}
        {app.activeTab === "Coach" ? <CoachScreen copy={copy} language={app.language} today={app.today} /> : null}
        {app.activeTab === "Settings" ? (
          <SettingsScreen
            copy={copy}
            hasPrivacyPin={app.hasPrivacyPin}
            language={app.language}
            onClearPrivacyPin={app.clearPrivacyPin}
            privacyLock={app.privacyLock}
            onChangeLanguage={app.changeLanguage}
            onLockNow={app.lockNow}
            onSetPrivacyPin={app.setPrivacyPin}
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

function shouldForceStartupError() {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(debugStorageKeys[0]) === "1";
}
