import { useQuery } from '@tanstack/react-query';
import { fetchAllPokemonNames } from '../services/pokeapi';
import { buildDexIndex } from '../services/dexIndex';
import { artworkUrl, spriteUrl, formatPokemonName, idFromUrl } from '../utils/formatters';
import type { FilterablePokemon } from '../types/filters';

/**
 * Builds the filterable Pokédex index: @pkmn/dex attributes (types, gen,
 * egg groups, base stats) joined with PokéAPI names by national dex number.
 * Cached + persisted to IndexedDB. Disabled until the filter feature is opened
 * so the heavy @pkmn/dex chunk isn't loaded on initial home render.
 */
export function usePokedexIndex(enabled: boolean) {
  return useQuery<FilterablePokemon[]>({
    queryKey: ['pokedex-filter-index'],
    queryFn: async () => {
      const [names, dex] = await Promise.all([fetchAllPokemonNames(), buildDexIndex()]);

      // Map national dex id -> PokéAPI name (for routing/display consistency).
      const nameById = new Map<number, string>();
      for (const r of names.results) nameById.set(idFromUrl(r.url), r.name);

      return dex.map((entry) => {
        const apiName = nameById.get(entry.num) ?? String(entry.num);
        return {
          id: entry.num,
          name: apiName,
          displayName: formatPokemonName(apiName),
          artworkUrl: artworkUrl(entry.num),
          spriteUrl: spriteUrl(entry.num),
          types: entry.types,
          eggGroups: entry.eggGroups,
          gen: entry.gen,
          baseStats: entry.baseStats,
          bst: entry.bst,
        };
      });
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24 * 7,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}
