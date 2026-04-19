import type { SymptomCheckinKey, SymptomCheckinValue } from "@pmhc/types";

export type SymptomCheckinOption = {
  key: SymptomCheckinKey;
  label: string;
};

export const symptomCheckinOptions: SymptomCheckinOption[] = [
  { key: "all_clear", label: "All clear" },
  { key: "pain", label: "Pain" },
  { key: "numbness", label: "Numbness" },
  { key: "blood", label: "Blood" },
  { key: "injury_concern", label: "Injury concern" },
];

export function createSymptomCheckinValue(key: SymptomCheckinKey): SymptomCheckinValue {
  return {
    severity: key === "all_clear" ? "none" : "strong",
    pain: key === "pain",
    numbness: key === "numbness",
    blood: key === "blood",
    injuryConcern: key === "injury_concern",
  };
}

export function hasSymptomRedFlag(value: unknown): value is SymptomCheckinValue {
  if (!value || typeof value !== "object") {
    return false;
  }

  const symptom = value as Partial<SymptomCheckinValue>;
  return (
    symptom.severity === "strong" ||
    symptom.pain === true ||
    symptom.numbness === true ||
    symptom.blood === true ||
    symptom.injuryConcern === true
  );
}
