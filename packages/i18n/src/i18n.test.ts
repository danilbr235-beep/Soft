import { describe, expect, it } from "vitest";
import { getCopy, languageName } from "./index";

describe("i18n copy", () => {
  it("returns English and Russian onboarding copy", () => {
    expect(getCopy("en").onboarding.heroTitle).toBe("A calm daily coach for recovery, confidence, and tracking.");
    expect(getCopy("ru").onboarding.heroTitle).toBe("Спокойный ежедневный коуч для восстановления, уверенности и трекинга.");
  });

  it("names both supported languages in their native labels", () => {
    expect(languageName("en")).toBe("English");
    expect(languageName("ru")).toBe("Русский");
  });

  it("includes Track snapshot copy in both languages", () => {
    expect(getCopy("en").track.snapshotTitle).toBe("Baseline snapshot");
    expect(getCopy("en").quickLog.labels.confidence).toBe("Confidence");
    expect(getCopy("ru").track.snapshotTitle).toBe("Снимок базовой линии");
    expect(getCopy("ru").quickLog.labels.confidence).toBe("Уверенность");
  });
});
