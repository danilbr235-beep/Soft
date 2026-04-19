import { describe, expect, it } from "vitest";
import { createSymptomCheckinValue, symptomCheckinOptions } from "./symptomCheckin";

describe("symptom check-in values", () => {
  it("creates an all-clear value without red flags", () => {
    expect(createSymptomCheckinValue("all_clear")).toEqual({
      severity: "none",
      pain: false,
      numbness: false,
      blood: false,
      injuryConcern: false,
    });
  });

  it("creates conservative red-flag values for safety symptoms", () => {
    expect(createSymptomCheckinValue("pain")).toMatchObject({ severity: "strong", pain: true });
    expect(createSymptomCheckinValue("numbness")).toMatchObject({ severity: "strong", numbness: true });
    expect(createSymptomCheckinValue("blood")).toMatchObject({ severity: "strong", blood: true });
    expect(createSymptomCheckinValue("injury_concern")).toMatchObject({
      severity: "strong",
      injuryConcern: true,
    });
  });

  it("exposes discreet symptom options for quick entry", () => {
    expect(symptomCheckinOptions.map((option) => option.label)).toEqual([
      "All clear",
      "Pain",
      "Numbness",
      "Blood",
      "Injury concern",
    ]);
  });
});
