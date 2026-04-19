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
});
