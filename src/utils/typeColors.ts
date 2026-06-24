import type { PokemonTypeName } from '../types/pokemon';

export const TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal:   '#9CA3AF',
  fire:     '#EF4444',
  water:    '#3B82F6',
  electric: '#EAB308',
  grass:    '#22C55E',
  ice:      '#06B6D4',
  fighting: '#DC2626',
  poison:   '#A855F7',
  ground:   '#D97706',
  flying:   '#818CF8',
  psychic:  '#EC4899',
  bug:      '#84CC16',
  rock:     '#78716C',
  ghost:    '#7C3AED',
  dragon:   '#4F46E5',
  dark:     '#374151',
  steel:    '#94A3B8',
  fairy:    '#F472B6',
};

export const TYPE_TEXT_COLORS: Record<PokemonTypeName, string> = {
  normal:   '#ffffff',
  fire:     '#ffffff',
  water:    '#ffffff',
  electric: '#1f2937',
  grass:    '#ffffff',
  ice:      '#1f2937',
  fighting: '#ffffff',
  poison:   '#ffffff',
  ground:   '#ffffff',
  flying:   '#ffffff',
  psychic:  '#ffffff',
  bug:      '#1f2937',
  rock:     '#ffffff',
  ghost:    '#ffffff',
  dragon:   '#ffffff',
  dark:     '#ffffff',
  steel:    '#1f2937',
  fairy:    '#1f2937',
};

export function getTypeStyle(type: PokemonTypeName) {
  return {
    backgroundColor: TYPE_COLORS[type],
    color: TYPE_TEXT_COLORS[type],
  };
}

export const STAT_COLORS: Record<string, string> = {
  hp:              '#FF5959',
  attack:          '#F5AC78',
  defense:         '#FAE078',
  'special-attack':  '#9DB7F5',
  'special-defense': '#A7DB8D',
  speed:           '#FA92B2',
};
