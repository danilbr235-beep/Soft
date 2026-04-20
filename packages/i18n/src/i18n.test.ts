import { describe, expect, it } from "vitest";
import { getCopy, languageName } from "./index";

describe("i18n copy", () => {
  it("returns English and Russian onboarding copy", () => {
    expect(getCopy("en").onboarding.heroTitle).toBe("A calm daily coach for recovery, confidence, and tracking.");
    expect(getCopy("ru").onboarding.heroTitle).toBe("Спокойный ежедневный коуч для восстановления, уверенности и наблюдения за собой.");
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

  it("uses natural Russian copy for core product surfaces", () => {
    const ru = getCopy("ru");

    expect(languageName("ru")).toBe("Русский");
    expect(ru.onboarding.heroTitle).toBe("Спокойный ежедневный коуч для восстановления, уверенности и наблюдения за собой.");
    expect(ru.programs.dayPlanTitle).toBe("План на сегодня");
    expect(ru.programs.taskProgress(2, 3)).toBe("2 из 3 уже сделано");
    expect(JSON.stringify(ru)).not.toContain("РЎ");
    expect(JSON.stringify(ru)).not.toContain("Рќ");
  });
});

describe("Track pattern hint copy", () => {
  it("stays conservative in English", () => {
    const track = getCopy("en").track;
    const text = [
      track.patternHintsBody,
      track.patternHintObservedBody(track.patternDirectionLabels.together),
      track.patternHintLowDataBody,
    ].join(" ");

    expect(text).not.toMatch(/\b(cause|caused|diagnose|treat|guarantee|proves?)\b/i);
  });
});
