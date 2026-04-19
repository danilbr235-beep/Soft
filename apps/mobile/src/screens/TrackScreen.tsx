import { Pressable, Text } from "react-native";
import { colors, radii, spacing } from "@pmhc/ui";
import type { LogEntry, QuickLogDefinition } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";
import { QuickLogRow } from "../components/TodayComponents";

const manualLogs: QuickLogDefinition[] = [
  { type: "energy", label: "Energy", input: "score" },
  { type: "sleep_quality", label: "Sleep", input: "score" },
  { type: "symptom_checkin", label: "Symptoms", input: "symptom" },
  { type: "pelvic_floor_done", label: "Pelvic floor", input: "boolean" },
  { type: "pump_done", label: "Pump", input: "boolean" },
];

export function TrackScreen({
  logs,
  onLog,
  onSync,
  pendingSyncCount,
}: {
  logs: LogEntry[];
  onLog: (definition: QuickLogDefinition) => void;
  onSync: () => void;
  pendingSyncCount: number;
}) {
  return (
    <Screen title="Track" subtitle="Fast manual logging, built for low friction.">
      <QuickLogRow logs={manualLogs} onLog={onLog} />
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>Sync queue</Text>
        <Text style={{ color: colors.muted }}>
          {pendingSyncCount > 0 ? `${pendingSyncCount} pending local write${pendingSyncCount === 1 ? "" : "s"}` : "All local writes are synced."}
        </Text>
        {pendingSyncCount > 0 ? (
          <Pressable
            accessibilityLabel="Sync demo writes"
            accessibilityRole="button"
            onPress={onSync}
            style={{
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radii.md,
              backgroundColor: colors.moss,
              marginTop: spacing.sm,
            }}
          >
            <Text style={{ color: colors.ink, fontWeight: "900" }}>Sync demo writes</Text>
          </Pressable>
        ) : null}
      </Surface>
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>Recent logs</Text>
        {logs.length === 0 ? (
          <Text style={{ color: colors.muted }}>No logs yet. Add one signal and Today will update.</Text>
        ) : (
          logs.slice(0, 8).map((log) => (
            <Text key={log.id} style={{ color: colors.muted }}>
              {log.type}: {JSON.stringify(log.value)}
            </Text>
          ))
        )}
      </Surface>
    </Screen>
  );
}
