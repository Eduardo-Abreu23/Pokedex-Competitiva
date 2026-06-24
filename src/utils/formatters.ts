export const STAT_LABELS: Record<string, string> = {
  hp:               'HP',
  attack:           'Atk',
  defense:          'Def',
  'special-attack':   'Sp. Atk',
  'special-defense':  'Sp. Def',
  speed:            'Spd',
};

export function formatStatLabel(apiName: string): string {
  return STAT_LABELS[apiName] ?? apiName;
}

export function formatPokemonNumber(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}

export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatGeneration(gen: string): string {
  const map: Record<string, string> = {
    'generation-i':    'Gen I',
    'generation-ii':   'Gen II',
    'generation-iii':  'Gen III',
    'generation-iv':   'Gen IV',
    'generation-v':    'Gen V',
    'generation-vi':   'Gen VI',
    'generation-vii':  'Gen VII',
    'generation-viii': 'Gen VIII',
    'generation-ix':   'Gen IX',
  };
  return map[gen] ?? gen;
}

/**
 * Builds the source label for a recommended build, e.g. "Gen 8 · RU".
 * Derives the tier from the format id we actually queried; falls back to
 * just the generation when the tier is unknown (any-tier fallback).
 */
export function competitiveSourceLabel(gen: number, formatId: string): string {
  const suffix = formatId.replace(/^gen\d+/, '');
  const tierMap: Record<string, string> = {
    ou: 'OU',
    uu: 'UU',
    ru: 'RU',
    nu: 'NU',
    pu: 'PU',
    zu: 'ZU',
    lc: 'LC',
    ubers: 'Ubers',
    anythinggoes: 'AG',
    nfe: 'NFE',
    cap: 'CAP',
  };
  const tier = tierMap[suffix];
  return tier ? `Gen ${gen} · ${tier}` : `Gen ${gen}`;
}

/** Maps a PokéAPI generation name ("generation-ix") to its number (9). */
export function generationNameToNumber(gen: string): number {
  const map: Record<string, number> = {
    'generation-i': 1,
    'generation-ii': 2,
    'generation-iii': 3,
    'generation-iv': 4,
    'generation-v': 5,
    'generation-vi': 6,
    'generation-vii': 7,
    'generation-viii': 8,
    'generation-ix': 9,
  };
  return map[gen] ?? 1;
}

export function formatEggGroup(name: string): string {
  const map: Record<string, string> = {
    'monster':          'Monster',
    'water1':           'Water 1',
    'water2':           'Water 2',
    'water3':           'Water 3',
    'bug':              'Bug',
    'flying':           'Flying',
    'ground':           'Ground',
    'fairy':            'Fairy',
    'plant':            'Grass',
    'humanshape':       'Human-Like',
    'mineral':          'Mineral',
    'indeterminate':    'Amorphous',
    'ditto':            'Ditto',
    'dragon':           'Dragon',
    'no-eggs':          'Undiscovered',
    'field':            'Field',
  };
  return map[name] ?? formatPokemonName(name);
}

export function formatHeight(dm: number): string {
  const m = dm / 10;
  const ft = Math.floor(m * 3.28084);
  const inch = Math.round((m * 3.28084 - ft) * 12);
  return `${m.toFixed(1)} m (${ft}'${inch}")`;
}

export function formatWeight(hg: number): string {
  const kg = hg / 10;
  const lbs = (kg * 2.20462).toFixed(1);
  return `${kg.toFixed(1)} kg (${lbs} lbs)`;
}

export function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function spriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? parseInt(m[1], 10) : 0;
}
