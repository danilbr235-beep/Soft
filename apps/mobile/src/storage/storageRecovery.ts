import type { KeyValueStorage } from "./localStore";
import { recoverableStorageKeys } from "./appStorageKeys";

export { recoverableStorageKeys } from "./appStorageKeys";

export async function clearRecoverableAppStorage(storage: KeyValueStorage): Promise<string[]> {
  await Promise.all(recoverableStorageKeys.map((key) => storage.removeItem(key)));

  return [...recoverableStorageKeys];
}
