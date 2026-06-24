import { useQuery } from '@tanstack/react-query';
import { fetchLearnset } from '../services/pokeapi';
import { getDex } from '../services/dex';

/**
 * Returns the Showdown display-name moves a Pokémon can actually learn.
 * Learnset membership comes from the PokéAPI (pokemon/{id}); names are
 * resolved to Showdown form via @pkmn/dex (e.g. "10000000-volt-thunderbolt"
 * → "10,000,000 Volt Thunderbolt"). Cached + persisted to IndexedDB.
 */
export function useLearnset(num: number) {
  return useQuery({
    queryKey: ['learnset', num],
    queryFn: async () => {
      const [names, Dex] = await Promise.all([fetchLearnset(num), getDex()]);
      const display = new Set<string>();
      for (const name of names) {
        const move = Dex.moves.get(name);
        if (move?.exists) display.add(move.name);
      }
      return [...display].sort();
    },
    enabled: num > 0,
    staleTime: 1000 * 60 * 60 * 24 * 7,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}
