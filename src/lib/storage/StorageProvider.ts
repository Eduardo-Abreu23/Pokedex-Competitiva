/**
 * Abstract persistence layer. The app persists through a StorageProvider rather
 * than touching localStorage directly, so a future cloud/synced implementation
 * can be swapped in (e.g. after login) without changing the stores.
 *
 * The shape matches Zustand's StateStorage so it can be passed to persist()
 * via createJSONStorage.
 */
export interface StorageProvider {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string) => void | Promise<void>;
  removeItem: (name: string) => void | Promise<void>;
}

/** Default provider backed by window.localStorage, guarded for SSR/unavailable storage. */
export const localStorageProvider: StorageProvider = {
  getItem: (name) => {
    try {
      return globalThis.localStorage?.getItem(name) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      globalThis.localStorage?.setItem(name, value);
    } catch {
      /* quota / unavailable — ignore */
    }
  },
  removeItem: (name) => {
    try {
      globalThis.localStorage?.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

/**
 * The provider the app currently persists through. Swap this (or make it
 * configurable per-user) to enable remote sync later — stores need no changes.
 */
export const storageProvider: StorageProvider = localStorageProvider;
