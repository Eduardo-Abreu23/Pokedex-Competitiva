import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    { name: 'pkdx-favorites' },
  ),
);
