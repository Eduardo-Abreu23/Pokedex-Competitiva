import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storageProvider } from '../lib/storage/StorageProvider';

interface FavoritesStore {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id) => {
        const cur = get().favorites;
        set({
          favorites: cur.includes(id) ? cur.filter((f) => f !== id) : [...cur, id],
        });
      },
      isFavorite: (id) => get().favorites.includes(id),
    }),
    { name: 'pkdx-favorites', storage: createJSONStorage(() => storageProvider) },
  ),
);
