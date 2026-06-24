import { smogonSetsSchema, type RawSmogonSet } from '../schemas/smogon.schema';

/**
 * Competitive data layer (Smogon via the @pkmn ecosystem / data.pkmn.cc).
 *
 * The @pkmn/dex + @pkmn/data + @pkmn/smogon bundle is heavy, so we load it
 * lazily on first use — keeping the home/detail pages lean. The UI never
 * imports these packages directly; it only talks to this service.
 */

type Species = { tier?: string } | undefined;
type Generation = { species: { get: (name: string) => Species } };
type SmogonInstance = {
  sets: (gen: unknown, pokemon?: string, format?: string) => Promise<unknown>;
};
type SmogonClass = { format: (gen: unknown, species: unknown) => string | undefined };
type GenerationsInstance = { get: (n: number) => Generation };

let cache: {
  smogon: SmogonInstance;
  gens: GenerationsInstance;
  Smogon: SmogonClass;
} | null = null;

async function getClient() {
  if (cache) return cache;
  const [{ Dex }, { Generations }, { Smogon }] = await Promise.all([
    import('@pkmn/dex'),
    import('@pkmn/data'),
    import('@pkmn/smogon'),
  ]);
  const gens = new Generations(Dex) as unknown as GenerationsInstance;
  // The Smogon lib calls `this.fetch(url)`, which rebinds the receiver. Native
  // browser fetch must be called with `this === window`/globalThis, so we bind
  // it — otherwise every request throws "Illegal invocation". (Node's fetch is
  // binding-tolerant, which is why this only surfaced in the browser.)
  const smogon = new Smogon(fetch.bind(globalThis)) as unknown as SmogonInstance;
  cache = { smogon, gens, Smogon: Smogon as unknown as SmogonClass };
  return cache;
}

export interface RecommendedBuild {
  /** Generation the build was sourced from (e.g. 8). */
  gen: number;
  /** Smogon format id the set came from (e.g. "gen8ru"); "genN" if any-tier fallback. */
  formatId: string;
  /** Validated raw sets for that (gen, format); first is the most popular. */
  sets: RawSmogonSet[];
}

async function setsFor(
  smogon: SmogonInstance,
  gen: Generation,
  name: string,
  format?: string,
): Promise<RawSmogonSet[]> {
  const raw = await smogon.sets(gen, name, format);
  return smogonSetsSchema.parse(raw ?? []);
}

/**
 * Picks the recommended competitive build for a Pokémon:
 * the most recent generation in which the species exists AND has data,
 * using its native (home-tier) format — falling back to any tier in that gen.
 *
 * Returns null when no generation has competitive data (legitimate empty state).
 * Network/parse failures throw (distinct from the empty state).
 */
export async function fetchRecommendedBuild(
  pokemonName: string,
): Promise<RecommendedBuild | null> {
  const { smogon, gens, Smogon } = await getClient();

  for (let gen = 9; gen >= 1; gen--) {
    const generation = gens.get(gen);
    const species = generation.species.get(pokemonName);
    if (!species) continue; // not present in this generation's dex

    const nativeFormat = Smogon.format(generation, species);

    if (nativeFormat) {
      const native = await setsFor(smogon, generation, pokemonName, nativeFormat);
      if (native.length) return { gen, formatId: nativeFormat, sets: native };
    }

    // Native tier empty (or unknown) → try any tier available this generation.
    const anyTier = await setsFor(smogon, generation, pokemonName);
    if (anyTier.length) return { gen, formatId: `gen${gen}`, sets: anyTier };
  }

  return null;
}
