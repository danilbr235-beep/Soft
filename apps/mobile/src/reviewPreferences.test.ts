import { describe, expect, it } from "vitest";
import { defaultReviewPreferences, isReviewPreferences } from "./reviewPreferences";

describe("reviewPreferences", () => {
  it("accepts the default preference shape", () => {
    expect(isReviewPreferences(defaultReviewPreferences)).toBe(true);
  });

  it("rejects unsupported preference values", () => {
    expect(
      isReviewPreferences({
        defaultSection: "daily",
        defaultFormat: "snapshot",
        includeMorningRoutineInPacket: true,
      }),
    ).toBe(false);
  });
});
