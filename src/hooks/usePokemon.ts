import { useQueries } from '@tanstack/react-query';
import {
  fetchPokemon,
  fetchPokemonSpecies,
  fetchEvolutionChain,
  fetchEncounters,
} from '../services/pokeapi';
import {
  adaptPokemonDetail,
  adaptPokemonSpecies,
  adaptEvolutionChain,
  adaptEncounters,
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
        queryKey: ['evolution-chain', nameOrId],
        queryFn: async () => {
          const raw = await fetchPokemon(nameOrId);
          const species = await fetchPokemonSpecies(raw.id);
          return fetchEvolutionChain(species.evolution_chain.url);
        },
        select: adaptEvolutionChain,
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
