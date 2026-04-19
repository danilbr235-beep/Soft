import { Pressable, Text } from "react-native";
import type { LanguageCopy } from "@pmhc/i18n";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppLanguage, LogEntry, QuickLogDefinition, QuickLogType } from "@pmhc/types";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";
import { QuickLogRow } from "../components/TodayComponents";

const manualLogTypes: Array<Pick<QuickLogDefinition, "type" | "input">> = [
  { type: "energy", input: "score" },
  { type: "sleep_quality", input: "score" },
  { type: "symptom_checkin", input: "symptom" },
  { type: "pelvic_floor_done", input: "boolean" },
  { type: "pump_done", input: "boolean" },
];

const manualLogLabels: Record<AppLanguage, Record<QuickLogType, string>> = {
  en: {
    morning_erection: "Morning",
    libido: "Libido",
    confidence: "Confidence",
    energy: "Energy",
    sleep_quality: "Sleep",
    pelvic_floor_done: "Pelvic floor",
    pump_done: "Pump",
    symptom_checkin: "Symptoms",
    sex_happened: "Intimacy",
  },
  ru: {
    morning_erection: "Утро",
    libido: "Либидо",
    confidence: "Уверенность",
    energy: "Энергия",
    sleep_quality: "Сон",
    pelvic_floor_done: "Тазовое дно",
    pump_done: "Помпа",
    symptom_checkin: "Симптомы",
    sex_happened: "Близость",
  },
};

export function TrackScreen({
  logs,
  copy,
  language,
  onLog,
  onSync,
  pendingSyncCount,
}: {
  logs: LogEntry[];
  copy: LanguageCopy;
  language: AppLanguage;
  onLog: (definition: QuickLogDefinition) => void;
  onSync: () => void;
  pendingSyncCount: number;
}) {
  const manualLogs = manualLogTypes.map((log) => ({
    ...log,
    label: manualLogLabels[language][log.type],
  }));

  return (
    <Screen title={copy.track.title} subtitle={copy.track.subtitle}>
      <QuickLogRow accessibilityPrefix={copy.today.quickLog} logs={manualLogs} onLog={onLog} />
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>{copy.track.syncQueue}</Text>
        <Text style={{ color: colors.muted }}>
          {pendingSyncCount > 0 ? copy.track.pendingWrites(pendingSyncCount) : copy.track.synced}
        </Text>
        {pendingSyncCount > 0 ? (
          <Pressable
            accessibilityLabel={copy.track.syncAction}
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
            <Text style={{ color: colors.ink, fontWeight: "900" }}>{copy.track.syncAction}</Text>
          </Pressable>
        ) : null}
      </Surface>
      <Surface>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>{copy.track.recentLogs}</Text>
        {logs.length === 0 ? (
          <Text style={{ color: colors.muted }}>{copy.track.noLogs}</Text>
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
