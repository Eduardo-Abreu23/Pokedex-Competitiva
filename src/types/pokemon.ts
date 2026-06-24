export type PokemonTypeName =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface Stat {
  name: string;
  label: string;
  value: number;
}

export interface Ability {
  name: string;
  displayName: string;
  isHidden: boolean;
}

export interface EvolutionNode {
  name: string;
  id: number;
  spriteUrl: string;
  triggerLabel: string | null;
  children: EvolutionNode[];
}

export interface Encounter {
  locationArea: string;
  versions: string[];
}

export interface PokemonListItem {
  id: number;
  name: string;
  artworkUrl: string;
  spriteUrl: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  artworkUrl: string;
  spriteUrl: string;
  types: PokemonTypeName[];
  stats: Stat[];
  abilities: Ability[];
  height: number;
  weight: number;
}

export interface PokemonSpecies {
  id: number;
  generation: string;
  eggGroups: string[];
  evolutionChainUrl: string;
  flavorText: string;
  isLegendary: boolean;
  isMythical: boolean;
}

export interface TypeEffectiveness {
  type: PokemonTypeName;
  multiplier: number;
}
