import { z } from 'zod';

const namedResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const pokemonListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(namedResourceSchema),
});

export const pokemonDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  sprites: z.object({
    front_default: z.string().nullable(),
    other: z.object({
      'official-artwork': z.object({
        front_default: z.string().nullable(),
      }),
    }),
  }),
  types: z.array(
    z.object({
      slot: z.number(),
      type: namedResourceSchema,
    }),
  ),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      effort: z.number(),
      stat: namedResourceSchema,
    }),
  ),
  abilities: z.array(
    z.object({
      ability: namedResourceSchema,
      is_hidden: z.boolean(),
      slot: z.number(),
    }),
  ),
  species: namedResourceSchema,
});

export const pokemonSpeciesSchema = z.object({
  id: z.number(),
  name: z.string(),
  generation: namedResourceSchema,
  egg_groups: z.array(namedResourceSchema),
  evolution_chain: z.object({ url: z.string() }),
  flavor_text_entries: z.array(
    z.object({
      flavor_text: z.string(),
      language: namedResourceSchema,
      version: namedResourceSchema,
    }),
  ),
  is_legendary: z.boolean(),
  is_mythical: z.boolean(),
});

const evolutionDetailSchema = z.object({
  trigger: namedResourceSchema,
  min_level: z.number().nullable(),
  item: namedResourceSchema.nullable(),
  held_item: namedResourceSchema.nullable(),
  min_happiness: z.number().nullable(),
  min_beauty: z.number().nullable(),
  min_affection: z.number().nullable(),
  known_move: namedResourceSchema.nullable(),
  known_move_type: namedResourceSchema.nullable(),
  location: namedResourceSchema.nullable(),
  gender: z.number().nullable(),
  needs_overworld_rain: z.boolean(),
  party_species: namedResourceSchema.nullable(),
  party_type: namedResourceSchema.nullable(),
  relative_physical_stats: z.number().nullable(),
  time_of_day: z.string(),
  trade_species: namedResourceSchema.nullable(),
  turn_upside_down: z.boolean(),
});

type RawChainLink = {
  species: { name: string; url: string };
  evolution_details: z.infer<typeof evolutionDetailSchema>[];
  evolves_to: RawChainLink[];
  is_baby: boolean;
};

const chainLinkSchema: z.ZodType<RawChainLink> = z.lazy(() =>
  z.object({
    species: namedResourceSchema,
    evolution_details: z.array(evolutionDetailSchema),
    evolves_to: z.array(chainLinkSchema),
    is_baby: z.boolean(),
  }),
);

export const evolutionChainSchema = z.object({
  id: z.number(),
  chain: chainLinkSchema,
});

/** Minimal schema for a species' formes/varieties — for forme-specific sprites. */
export const speciesVarietiesSchema = z.object({
  varieties: z.array(
    z.object({
      is_default: z.boolean(),
      pokemon: z.object({ name: z.string(), url: z.string() }),
    }),
  ),
});

/** Minimal schema for a Pokémon's learnset — only the move names matter. */
export const learnsetSchema = z.object({
  moves: z.array(
    z.object({
      move: z.object({ name: z.string() }),
    }),
  ),
});

export const encountersSchema = z.array(
  z.object({
    location_area: namedResourceSchema,
    version_details: z.array(
      z.object({
        version: namedResourceSchema,
        max_chance: z.number(),
        encounter_details: z.array(z.unknown()),
      }),
    ),
  }),
);

export type RawPokemonDetail = z.infer<typeof pokemonDetailSchema>;
export type RawPokemonSpecies = z.infer<typeof pokemonSpeciesSchema>;
export type RawEvolutionChain = z.infer<typeof evolutionChainSchema>;
export type RawEncounters = z.infer<typeof encountersSchema>;
