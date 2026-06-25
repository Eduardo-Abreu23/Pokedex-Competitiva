import { useQueries } from '@tanstack/react-query';
import {
  fetchPokemon,
  fetchPokemonSpecies,
  fetchEvolutionChain,
  fetchEncounters,
  fetchSpeciesVarieties,
} from '../services/pokeapi';
import {
  adaptPokemonDetail,
  adaptPokemonSpecies,
  adaptEvolutionChain,
  adaptEncounters,
  enrichEvolutionForms,
} from '../services/adapters/pokemon.adapter';

export function usePokemonDetail(nameOrId: string) {
  const enabled = !!nameOrId;
  const [pokemonQ, speciesQ, chainQ, encountersQ] = useQueries({
    queries: [
      {
        queryKey: ['pokemon', nameOrId],
        queryFn: () => fetchPokemon(nameOrId),
        select: adaptPokemonDetail,
        enabled,
      },
      {
        queryKey: ['pokemon-species', nameOrId],
        queryFn: async () => {
          const raw = await fetchPokemon(nameOrId);
          return fetchPokemonSpecies(raw.id);
        },
        select: adaptPokemonSpecies,
        enabled,
      },
      {
        // v2: query now returns the adapted + forme-enriched tree (shape change
        // from the raw chain), so the key is bumped to drop stale persisted data.
        queryKey: ['evolution-tree-v2', nameOrId],
        queryFn: async () => {
          const raw = await fetchPokemon(nameOrId);
          const species = await fetchPokemonSpecies(raw.id);
          const chain = await fetchEvolutionChain(species.evolution_chain.url);
          const tree = adaptEvolutionChain(chain);
          await enrichEvolutionForms(tree, fetchSpeciesVarieties);
          return tree;
        },
        enabled,
      },
      {
        queryKey: ['encounters', nameOrId],
        queryFn: async () => {
          const raw = await fetchPokemon(nameOrId);
          return fetchEncounters(raw.id);
        },
        select: adaptEncounters,
        enabled,
      },
    ],
  });

  return {
    pokemon: pokemonQ.data,
    species: speciesQ.data,
    evolutionChain: chainQ.data,
    encounters: encountersQ.data,
    isLoading: pokemonQ.isLoading || speciesQ.isLoading,
    isError: pokemonQ.isError,
    error: pokemonQ.error,
  };
}
