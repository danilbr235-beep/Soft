import type { AppLanguage } from "@pmhc/types";
import type { MorningRoutineReview } from "./morningRoutineReview";
import type { ReviewPreferences } from "./reviewPreferences";
import type { ReviewPacketHistoryEntry } from "./reviewPacketHistory";
import type { ReviewRecapFormat, ReviewSection } from "./reviewRecap";

type ReviewPreferenceGuidanceState =
  | "weekly_packet"
  | "monthly_packet"
  | "overview_packet"
  | "cycles_packet"
  | "overview_snapshot";

export type ReviewPreferencesGuidance = {
  title: string;
  tone: string;
  body: string;
  meta: string;
  changeLines: string[];
  ctaLabel: string | null;
  statusLabel: string;
  recommendedPreferences: ReviewPreferences | null;
};

type LocalizedCopy = {
  title: string;
  sectionLabel: string;
  formatLabel: string;
  morningLabel: string;
  sections: Record<ReviewSection, string>;
  formats: Record<ReviewRecapFormat, string>;
  morningStates: Record<"on" | "off", string>;
  tones: Record<ReviewPreferenceGuidanceState, string>;
  bodies: Record<ReviewPreferenceGuidanceState, string>;
  ctas: Record<ReviewPreferenceGuidanceState, string>;
  keepCurrent: string;
  alreadyAligned: string;
  basedOnPackets: (count: number, section: string) => string;
  basedOnMorning: (meta: string) => string;
  changeLine: (field: string, from: string, to: string) => string;
};

const copy: Record<AppLanguage, LocalizedCopy> = {
  en: {
    title: "Recommended review setup",
    sectionLabel: "Section",
    formatLabel: "Format",
    morningLabel: "Morning block",
    sections: {
      overview: "Overview",
      week: "7 days",
      month: "30 days",
      cycles: "Cycles",
    },
    formats: {
      snapshot: "Snapshot",
      plan: "Action plan",
      coach: "Coach note",
      packet: "Packet",
    },
    morningStates: {
      on: "On",
      off: "Off",
    },
    tones: {
      weekly_packet: "Lean into weekly packets",
      monthly_packet: "Keep the 30-day packet close",
      overview_packet: "Open on the digest packet",
      cycles_packet: "Start from cycle history",
      overview_snapshot: "Keep the default review lighter",
    },
    bodies: {
      weekly_packet:
        "Recent behavior fits a weekly packet flow better than a broad overview. Let Review open where the next useful action usually is.",
      monthly_packet:
        "Recent review use leans toward a wider monthly recap. Keep the 30-day packet one tap away by default.",
      overview_packet:
        "Recent packet use still points to the overview digest first. Keep the combined read as the default landing.",
      cycles_packet:
        "Recent saved packets lean on finished cycles, so it makes sense to open Review there first.",
      overview_snapshot:
        "The morning loop is steady enough to keep Review lighter by default and leave packet mode for deliberate handoffs.",
    },
    ctas: {
      weekly_packet: "Apply weekly packet setup",
      monthly_packet: "Apply 30-day packet setup",
      overview_packet: "Apply digest packet setup",
      cycles_packet: "Apply cycle packet setup",
      overview_snapshot: "Apply lighter review setup",
    },
    keepCurrent: "Leave the current review setup as it is for now.",
    alreadyAligned: "Current review settings already match this pattern.",
    basedOnPackets: (count, section) => `Based on ${count} recent saved packet${count === 1 ? "" : "s"} around ${section}.`,
    basedOnMorning: (meta) => `Based on the current morning read: ${meta}`,
    changeLine: (field, from, to) => `${field}: ${from} -> ${to}`,
  },
  ru: {
    title: "Рекомендованная схема обзора",
    sectionLabel: "Срез",
    formatLabel: "Формат",
    morningLabel: "Утренний блок",
    sections: {
      overview: "Обзор",
      week: "7 дней",
      month: "30 дней",
      cycles: "Циклы",
    },
    formats: {
      snapshot: "Снимок",
      plan: "План действий",
      coach: "Заметка коуча",
      packet: "Packet",
    },
    morningStates: {
      on: "Включен",
      off: "Выключен",
    },
    tones: {
      weekly_packet: "Открывать обзор с недели",
      monthly_packet: "Держать ближе 30-дневный packet",
      overview_packet: "Стартовать с digest packet",
      cycles_packet: "Начинать с истории циклов",
      overview_snapshot: "Оставить обзор легче по умолчанию",
    },
    bodies: {
      weekly_packet:
        "По текущему паттерну использования больше подходит недельный packet, чем широкий общий обзор. Пусть Review открывается там, где чаще всего есть следующий полезный шаг.",
      monthly_packet:
        "Последние действия в Review тяготеют к более широкому 30-дневному recap. Логично держать этот packet по умолчанию.",
      overview_packet:
        "Последние сохраненные packet все еще ведут сначала к общему digest. Пусть комбинированный обзор остается первым экраном.",
      cycles_packet:
        "Недавние сохраненные packet чаще опираются на завершенные циклы, значит логично открывать Review с этого среза.",
      overview_snapshot:
        "Утренняя рутина уже держится достаточно ровно, поэтому по умолчанию можно оставить более легкий обзор, а packet включать только когда он действительно нужен.",
    },
    ctas: {
      weekly_packet: "Применить недельный packet",
      monthly_packet: "Применить 30-дневный packet",
      overview_packet: "Применить digest packet",
      cycles_packet: "Применить packet по циклам",
      overview_snapshot: "Применить более легкий обзор",
    },
    keepCurrent: "Пока лучше оставить текущую схему обзора как есть.",
    alreadyAligned: "Текущие настройки обзора уже совпадают с этой схемой.",
    basedOnPackets: (count, section) => `Основано на ${count} недавн${count === 1 ? "ем" : "их"} сохраненн${count === 1 ? "ом" : "ых"} packet вокруг среза «${section}».`,
    basedOnMorning: (meta) => `Основано на текущем утреннем обзоре: ${meta}`,
    changeLine: (field, from, to) => `${field}: ${from} -> ${to}`,
  },
};

export function buildReviewPreferencesGuidance({
  history,
  language,
  morningRoutineReview,
  preferences,
}: {
  history: ReviewPacketHistoryEntry[];
  language: AppLanguage;
  morningRoutineReview: MorningRoutineReview;
  preferences: ReviewPreferences;
}): ReviewPreferencesGuidance {
  const languageCopy = copy[language];
  const state = selectGuidanceState(history, morningRoutineReview);
  const recommendedPreferences = buildRecommendedPreferences(state, morningRoutineReview);
  const nextPreferences = arePreferencesEqual(preferences, recommendedPreferences) ? null : recommendedPreferences;
  const changeLines = nextPreferences ? buildChangeLines(languageCopy, preferences, nextPreferences) : [];
  const meta = buildMeta(languageCopy, history, morningRoutineReview, recommendedPreferences.defaultSection);

  return {
    title: languageCopy.title,
    tone: languageCopy.tones[state],
    body: languageCopy.bodies[state],
    meta,
    changeLines,
    ctaLabel: nextPreferences ? languageCopy.ctas[state] : null,
    statusLabel: nextPreferences ? languageCopy.bodies[state] : languageCopy.alreadyAligned,
    recommendedPreferences: nextPreferences,
  };
}

function selectGuidanceState(
  history: ReviewPacketHistoryEntry[],
  morningRoutineReview: MorningRoutineReview,
): ReviewPreferenceGuidanceState {
  const recentHistory = history.slice(0, 3);

  if (recentHistory.length > 0) {
    const firstSection = recentHistory[0]?.section;
    const secondSection = recentHistory[1]?.section;
    const dominantSection = firstSection && firstSection === secondSection ? firstSection : firstSection;

    if (dominantSection === "week") {
      return "weekly_packet";
    }

    if (dominantSection === "month") {
      return "monthly_packet";
    }

    if (dominantSection === "cycles") {
      return "cycles_packet";
    }

    return "overview_packet";
  }

  if (morningRoutineReview.toneId === "steady" && morningRoutineReview.fullDays >= 4) {
    return "overview_snapshot";
  }

  return "weekly_packet";
}

function buildRecommendedPreferences(
  state: ReviewPreferenceGuidanceState,
  morningRoutineReview: MorningRoutineReview,
): ReviewPreferences {
  if (state === "weekly_packet") {
    return {
      defaultSection: "week",
      defaultFormat: "packet",
      includeMorningRoutineInPacket: true,
    };
  }

  if (state === "monthly_packet") {
    return {
      defaultSection: "month",
      defaultFormat: "packet",
      includeMorningRoutineInPacket: morningRoutineReview.toneId !== "steady",
    };
  }

  if (state === "cycles_packet") {
    return {
      defaultSection: "cycles",
      defaultFormat: "packet",
      includeMorningRoutineInPacket: false,
    };
  }

  if (state === "overview_snapshot") {
    return {
      defaultSection: "overview",
      defaultFormat: "snapshot",
      includeMorningRoutineInPacket: false,
    };
  }

  return {
    defaultSection: "overview",
    defaultFormat: "packet",
    includeMorningRoutineInPacket: morningRoutineReview.toneId !== "steady",
  };
}

function buildMeta(
  languageCopy: LocalizedCopy,
  history: ReviewPacketHistoryEntry[],
  morningRoutineReview: MorningRoutineReview,
  section: ReviewSection,
) {
  if (history.length > 0) {
    return languageCopy.basedOnPackets(Math.min(history.length, 3), languageCopy.sections[section]);
  }

  return languageCopy.basedOnMorning(morningRoutineReview.meta);
}

function buildChangeLines(
  languageCopy: LocalizedCopy,
  current: ReviewPreferences,
  next: ReviewPreferences,
) {
  const lines: string[] = [];

  if (current.defaultSection !== next.defaultSection) {
    lines.push(
      languageCopy.changeLine(
        languageCopy.sectionLabel,
        languageCopy.sections[current.defaultSection],
        languageCopy.sections[next.defaultSection],
      ),
    );
  }

  if (current.defaultFormat !== next.defaultFormat) {
    lines.push(
      languageCopy.changeLine(
        languageCopy.formatLabel,
        languageCopy.formats[current.defaultFormat],
        languageCopy.formats[next.defaultFormat],
      ),
    );
  }

  if (current.includeMorningRoutineInPacket !== next.includeMorningRoutineInPacket) {
    lines.push(
      languageCopy.changeLine(
        languageCopy.morningLabel,
        current.includeMorningRoutineInPacket ? languageCopy.morningStates.on : languageCopy.morningStates.off,
        next.includeMorningRoutineInPacket ? languageCopy.morningStates.on : languageCopy.morningStates.off,
      ),
    );
  }

  return lines;
}

function arePreferencesEqual(left: ReviewPreferences, right: ReviewPreferences) {
  return (
    left.defaultSection === right.defaultSection &&
    left.defaultFormat === right.defaultFormat &&
    left.includeMorningRoutineInPacket === right.includeMorningRoutineInPacket
  );
}
