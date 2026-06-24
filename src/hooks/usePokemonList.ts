import { useQuery } from '@tanstack/react-query';
import { fetchAllPokemonNames, fetchPokemonList } from '../services/pokeapi';
import { adaptPokemonListItem } from '../services/adapters/pokemon.adapter';
import type { PokemonListItem } from '../types/pokemon';

const PAGE_SIZE = 24;

// Full name list for client-side search (fetched once, cached 24h)
export function useAllPokemonNames() {
  return useQuery({
    queryKey: ['pokemon-names-all'],
    queryFn: async () => {
      const data = await fetchAllPokemonNames();
      return data.results.map((r) => adaptPokemonListItem(r.name, r.url));
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useSearchPokemon(query: string): { results: PokemonListItem[]; isLoading: boolean } {
  const { data, isLoading } = useAllPokemonNames();

  if (!query.trim()) return { results: [], isLoading };

  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const isNumeric = /^\d+$/.test(trimmed);

  const filtered = (data ?? []).filter((p) => {
    if (isNumeric) {
      // Prefix match on ID so "79" finds #79 Slowpoke and #790 Cosmog, etc.
      return String(p.id).startsWith(trimmed);
    }
    return p.name.includes(lower);
  });

  // Sort: exact ID match first, then ascending by ID / name order
  const results = (isNumeric
    ? filtered.sort((a, b) => {
        const aExact = String(a.id) === trimmed ? 0 : 1;
        const bExact = String(b.id) === trimmed ? 0 : 1;
        return aExact - bExact || a.id - b.id;
      })
    : filtered
  ).slice(0, 20);

  return { results, isLoading };
}

export function usePokemonPage(page: number) {
  return useQuery({
    queryKey: ['pokemon-page', page],
    queryFn: async () => {
      const data = await fetchPokemonList(PAGE_SIZE, page * PAGE_SIZE);
      return {
        items: data.results.map((r) => adaptPokemonListItem(r.name, r.url)),
        total: data.count,
      };
    },
  });
}

export { PAGE_SIZE };
