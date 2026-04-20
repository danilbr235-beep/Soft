import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PropsWithChildren } from "react";
import { Component } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { colors } from "@pmhc/ui";
import { ErrorRecoveryScreen } from "../screens/ErrorRecoveryScreen";
import { clearRecoverableAppStorage } from "../storage/storageRecovery";

type State = {
  error: Error | null;
  recovering: boolean;
};

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = {
    error: null,
    recovering: false,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  private recover = async () => {
    this.setState({ recovering: true });
    await clearRecoverableAppStorage(AsyncStorage);
    this.setState({ error: null, recovering: false });

    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.error) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          <ErrorRecoveryScreen onRecover={this.recover} recovering={this.state.recovering} />
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ink,
  },
});
