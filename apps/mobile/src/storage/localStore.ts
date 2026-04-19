export type KeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export type JsonRepository<T> = {
  load: () => Promise<T>;
  save: (value: T) => Promise<void>;
  clear: () => Promise<void>;
};

export function createJsonRepository<T>(
  storage: KeyValueStorage,
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): JsonRepository<T> {
  return {
    async load() {
      const raw = await storage.getItem(key);
      if (raw == null) {
        return fallback;
      }

      try {
        const parsed = JSON.parse(raw) as unknown;

        if (validate && !validate(parsed)) {
          await storage.removeItem(key);
          return fallback;
        }

        return parsed as T;
      } catch {
        await storage.removeItem(key);
        return fallback;
      }
    },
    async save(value) {
      await storage.setItem(key, JSON.stringify(value));
    },
    async clear() {
      await storage.removeItem(key);
    },
  };
}

export function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const values = new Map(Object.entries(initial));

  return {
    async getItem(key) {
      return values.get(key) ?? null;
    },
    async setItem(key, value) {
      values.set(key, value);
    },
    async removeItem(key) {
      values.delete(key);
    },
  };
}
