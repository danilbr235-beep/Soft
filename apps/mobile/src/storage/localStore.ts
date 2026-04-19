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
): JsonRepository<T> {
  return {
    async load() {
      const raw = await storage.getItem(key);
      return raw == null ? fallback : (JSON.parse(raw) as T);
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
