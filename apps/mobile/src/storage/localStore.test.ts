import { describe, expect, it } from "vitest";
import { createJsonRepository, createMemoryStorage } from "./localStore";

type DemoState = {
  count: number;
  label: string;
};

describe("createJsonRepository", () => {
  it("returns fallback when storage is empty", async () => {
    const storage = createMemoryStorage();
    const repository = createJsonRepository<DemoState>(storage, "demo", { count: 0, label: "empty" });

    await expect(repository.load()).resolves.toEqual({ count: 0, label: "empty" });
  });

  it("saves and reloads JSON state", async () => {
    const storage = createMemoryStorage();
    const repository = createJsonRepository<DemoState>(storage, "demo", { count: 0, label: "empty" });

    await repository.save({ count: 2, label: "saved" });

    await expect(repository.load()).resolves.toEqual({ count: 2, label: "saved" });
  });

  it("clears state back to fallback", async () => {
    const storage = createMemoryStorage();
    const repository = createJsonRepository<DemoState>(storage, "demo", { count: 0, label: "empty" });

    await repository.save({ count: 2, label: "saved" });
    await repository.clear();

    await expect(repository.load()).resolves.toEqual({ count: 0, label: "empty" });
  });

  it("returns fallback and clears the key when JSON is corrupted", async () => {
    const storage = createMemoryStorage({ demo: "{not-json" });
    const repository = createJsonRepository<DemoState>(storage, "demo", { count: 0, label: "empty" });

    await expect(repository.load()).resolves.toEqual({ count: 0, label: "empty" });
    await expect(storage.getItem("demo")).resolves.toBeNull();
  });

  it("returns fallback and clears the key when saved JSON has the wrong shape", async () => {
    const storage = createMemoryStorage({ demo: "true" });
    const repository = createJsonRepository<DemoState>(
      storage,
      "demo",
      { count: 0, label: "empty" },
      (value): value is DemoState =>
        typeof value === "object" &&
        value != null &&
        "count" in value &&
        "label" in value &&
        typeof value.count === "number" &&
        typeof value.label === "string",
    );

    await expect(repository.load()).resolves.toEqual({ count: 0, label: "empty" });
    await expect(storage.getItem("demo")).resolves.toBeNull();
  });
});
