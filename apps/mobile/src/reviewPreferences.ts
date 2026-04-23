import type { ReviewRecapFormat, ReviewSection } from "./reviewRecap";

export type ReviewPreferences = {
  defaultSection: ReviewSection;
  defaultFormat: ReviewRecapFormat;
  includeMorningRoutineInPacket: boolean;
};

export const defaultReviewPreferences: ReviewPreferences = {
  defaultSection: "overview",
  defaultFormat: "snapshot",
  includeMorningRoutineInPacket: true,
};

export function isReviewPreferences(value: unknown): value is ReviewPreferences {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isReviewSection(value.defaultSection) &&
    isReviewRecapFormat(value.defaultFormat) &&
    typeof value.includeMorningRoutineInPacket === "boolean"
  );
}

function isReviewSection(value: unknown): value is ReviewSection {
  return value === "overview" || value === "week" || value === "month" || value === "cycles";
}

function isReviewRecapFormat(value: unknown): value is ReviewRecapFormat {
  return value === "snapshot" || value === "plan" || value === "coach" || value === "packet";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
