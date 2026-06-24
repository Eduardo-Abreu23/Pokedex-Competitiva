import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT = 12;

export interface HistoryEntry {
  id: number;
  name: string;
}

interface HistoryStore {
  /** Most-recently viewed, newest first (deduped, capped). */
  recent: HistoryEntry[];
  /** View counts keyed by Pokémon name → for the "most viewed" ranking. */
  counts: Record<string, { id: number; name: string; count: number }>;
  recordView: (id: number, name: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      recent: [],
      counts: {},
      recordView: (id, name) => {
        const { recent, counts } = get();
        const nextRecent = [
          { id, name },
          ...recent.filter((e) => e.name !== name),
        ].slice(0, MAX_RECENT);

        const prev = counts[name];
        const nextCounts = {
          ...counts,
          [name]: { id, name, count: (prev?.count ?? 0) + 1 },
        };

        set({ recent: nextRecent, counts: nextCounts });
      },
      clearHistory: () => set({ recent: [], counts: {} }),
    }),
    { name: 'pkdx-history' },
  ),
);

/** Top N most-viewed Pokémon, descending by count. */
export function selectMostViewed(
  counts: HistoryStore['counts'],
  limit = 6,
): HistoryEntry[] {
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ id, name }) => ({ id, name }));
}
