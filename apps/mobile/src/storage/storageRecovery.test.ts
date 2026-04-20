import { describe, expect, it } from "vitest";
import { createMemoryStorage } from "./localStore";
import { clearRecoverableAppStorage, recoverableStorageKeys } from "./storageRecovery";

describe("storage recovery", () => {
  it("clears only recoverable app keys and leaves unrelated browser state alone", async () => {
    const storage = createMemoryStorage({
      "pmhc:onboarding-complete": JSON.stringify({ profile: {} }),
      "pmhc:quick-logs": "not-json",
      "pmhc:debug-force-error": "1",
      "unrelated:theme": "dark",
    });

    await expect(clearRecoverableAppStorage(storage)).resolves.toEqual(recoverableStorageKeys);
    await expect(storage.getItem("pmhc:onboarding-complete")).resolves.toBeNull();
    await expect(storage.getItem("pmhc:quick-logs")).resolves.toBeNull();
    await expect(storage.getItem("pmhc:debug-force-error")).resolves.toBeNull();
    await expect(storage.getItem("unrelated:theme")).resolves.toBe("dark");
  });
});
