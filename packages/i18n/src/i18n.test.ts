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
});
