import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storageProvider } from '../lib/storage/StorageProvider';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    { name: 'pkdx-theme', storage: createJSONStorage(() => storageProvider) },
  ),
);
