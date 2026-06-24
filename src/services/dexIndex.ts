import type { PokemonTypeName } from '../types/pokemon';
import type { BaseStats } from '../types/filters';
import { getDex } from './dex';

/**
 * Local filter index sourced from @pkmn/dex (no PokéAPI calls). Heavy package,
 * so loaded lazily — only when the filter feature is first used. The same
 * @pkmn/dex chunk is already used by the competitive section, so no new cost.
 */

export interface DexEntry {
  num: number;
  types: PokemonTypeName[];
  eggGroups: string[];
  gen: number;
  baseStats: BaseStats;
  bst: number;
}

type RawSpecies = {
  num: number;
  forme: string;
  types: string[];
  eggGroups: string[];
  gen: number;
  baseStats: BaseStats;
  bst: number;
};

/**
 * Builds the dex index of base-form species (num 1–1025), including
 * non-standard / past-gen Pokémon — a Pokédex should list them all.
 */
export async function buildDexIndex(): Promise<DexEntry[]> {
  const Dex = await getDex();
  const all = Dex.species.all() as unknown as RawSpecies[];

  const entries: DexEntry[] = [];
  for (const s of all) {
    if (s.num < 1 || s.num > 1025) continue; // skip CAP/fakes and out-of-range
    if (s.forme) continue; // one entry per dex number (base form)
    entries.push({
      num: s.num,
      types: s.types.map((t) => t.toLowerCase() as PokemonTypeName),
      eggGroups: s.eggGroups ?? [],
      gen: s.gen,
      baseStats: s.baseStats,
      bst: s.bst,
    });
  }

  // Dedupe by num (some base species can repeat across cosmetic entries) and sort.
  const byNum = new Map<number, DexEntry>();
  for (const e of entries) if (!byNum.has(e.num)) byNum.set(e.num, e);
  return [...byNum.values()].sort((a, b) => a.num - b.num);
}
