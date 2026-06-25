import {
  pokemonListResponseSchema,
  pokemonDetailSchema,
  pokemonSpeciesSchema,
  evolutionChainSchema,
  encountersSchema,
  learnsetSchema,
  speciesVarietiesSchema,
  type RawPokemonDetail,
  type RawPokemonSpecies,
  type RawEvolutionChain,
  type RawEncounters,
} from '../schemas/pokeapi.schema';
import { idFromUrl } from '../utils/formatters';

const BASE = 'https://pokeapi.co/api/v2';

async function fetchAndParse<T>(url: string, schema: { parse: (data: unknown) => T }): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`PokéAPI error ${res.status} — ${url}`);
  }
  const json = await res.json();
  return schema.parse(json);
}

export async function fetchPokemonList(limit: number, offset: number) {
  return fetchAndParse(
    `${BASE}/pokemon?limit=${limit}&offset=${offset}`,
    pokemonListResponseSchema,
  );
}

export async function fetchAllPokemonNames() {
  return fetchAndParse(
    `${BASE}/pokemon?limit=10000&offset=0`,
    pokemonListResponseSchema,
  );
}

export async function fetchPokemon(nameOrId: string | number): Promise<RawPokemonDetail> {
  return fetchAndParse(`${BASE}/pokemon/${nameOrId}`, pokemonDetailSchema);
}

export async function fetchPokemonSpecies(id: number): Promise<RawPokemonSpecies> {
  return fetchAndParse(`${BASE}/pokemon-species/${id}`, pokemonSpeciesSchema);
}

export async function fetchEvolutionChain(url: string): Promise<RawEvolutionChain> {
  return fetchAndParse(url, evolutionChainSchema);
}

export async function fetchEncounters(id: number): Promise<RawEncounters> {
  return fetchAndParse(`${BASE}/pokemon/${id}/encounters`, encountersSchema);
}

/** Returns the PokéAPI move names (kebab-case) a Pokémon can learn. */
export async function fetchLearnset(id: number | string): Promise<string[]> {
  const data = await fetchAndParse(`${BASE}/pokemon/${id}`, learnsetSchema);
  return data.moves.map((m) => m.move.name);
}

export interface SpeciesVariety {
  name: string;
  id: number;
  isDefault: boolean;
}

/** Returns a species' formes/varieties (name + dex id) — for forme-specific sprites. */
export async function fetchSpeciesVarieties(name: string): Promise<SpeciesVariety[]> {
  const data = await fetchAndParse(`${BASE}/pokemon-species/${name}`, speciesVarietiesSchema);
  return data.varieties.map((v) => ({
    name: v.pokemon.name,
    id: idFromUrl(v.pokemon.url),
    isDefault: v.is_default,
  }));
}
