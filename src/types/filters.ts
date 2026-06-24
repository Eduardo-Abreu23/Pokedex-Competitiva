import type { PokemonTypeName } from './pokemon';

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

/** One Pokémon enriched with attributes used for filtering (from @pkmn/dex). */
export interface FilterablePokemon {
  id: number; // national dex number (=== PokéAPI id for base forms)
  name: string; // PokéAPI name for routing (fallback: String(id))
  displayName: string;
  artworkUrl: string;
  spriteUrl: string;
  types: PokemonTypeName[];
  eggGroups: string[];
  gen: number;
  baseStats: BaseStats;
  bst: number;
}

export interface FilterState {
  /** Pokémon must have ALL selected types (intersection). */
  types: PokemonTypeName[];
  gen: number | null;
  eggGroup: string | null;
  bstMin: number;
  bstMax: number;
}

export const BST_MIN = 150;
export const BST_MAX = 800;

export const DEFAULT_FILTERS: FilterState = {
  types: [],
  gen: null,
  eggGroup: null,
  bstMin: BST_MIN,
  bstMax: BST_MAX,
};

/** Egg groups as exposed by @pkmn/dex (already display-friendly). */
export const EGG_GROUPS: string[] = [
  'Monster', 'Water 1', 'Water 2', 'Water 3', 'Bug', 'Flying', 'Field',
  'Fairy', 'Grass', 'Human-Like', 'Mineral', 'Amorphous', 'Dragon',
  'Ditto', 'Undiscovered',
];

export function isFilterActive(f: FilterState): boolean {
  return (
    f.types.length > 0 ||
    f.gen !== null ||
    f.eggGroup !== null ||
    f.bstMin !== BST_MIN ||
    f.bstMax !== BST_MAX
  );
}

export function applyFilters(
  list: FilterablePokemon[],
  f: FilterState,
): FilterablePokemon[] {
  return list.filter((p) => {
    if (f.types.length > 0 && !f.types.every((t) => p.types.includes(t))) return false;
    if (f.gen !== null && p.gen !== f.gen) return false;
    if (f.eggGroup !== null && !p.eggGroups.includes(f.eggGroup)) return false;
    if (p.bst < f.bstMin || p.bst > f.bstMax) return false;
    return true;
  });
}
