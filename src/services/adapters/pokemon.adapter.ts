import type {
  RawPokemonDetail,
  RawPokemonSpecies,
  RawEvolutionChain,
  RawEncounters,
} from '../../schemas/pokeapi.schema';
import type {
  PokemonDetail,
  PokemonListItem,
  PokemonSpecies,
  EvolutionNode,
  Encounter,
  PokemonTypeName,
} from '../../types/pokemon';
import {
  formatStatLabel,
  formatPokemonName,
  artworkUrl,
  spriteUrl,
  idFromUrl,
} from '../../utils/formatters';

export function adaptPokemonDetail(raw: RawPokemonDetail): PokemonDetail {
  return {
    id: raw.id,
    name: raw.name,
    artworkUrl: raw.sprites.other['official-artwork'].front_default ?? artworkUrl(raw.id),
    spriteUrl: raw.sprites.front_default ?? spriteUrl(raw.id),
    types: raw.types
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name as PokemonTypeName),
    stats: raw.stats.map((s) => ({
      name: s.stat.name,
      label: formatStatLabel(s.stat.name),
      value: s.base_stat,
    })),
    abilities: raw.abilities
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({
        name: a.ability.name,
        displayName: formatPokemonName(a.ability.name),
        isHidden: a.is_hidden,
      })),
    height: raw.height,
    weight: raw.weight,
  };
}

export function adaptPokemonListItem(name: string, url: string): PokemonListItem {
  const id = idFromUrl(url);
  return { id, name, artworkUrl: artworkUrl(id), spriteUrl: spriteUrl(id) };
}

export function adaptPokemonSpecies(raw: RawPokemonSpecies): PokemonSpecies {
  const enEntry = raw.flavor_text_entries.find((e) => e.language.name === 'en');
  const flavorText = enEntry
    ? enEntry.flavor_text.replace(/\f|\n/g, ' ')
    : '';

  return {
    id: raw.id,
    generation: raw.generation.name,
    eggGroups: raw.egg_groups.map((g) => g.name),
    evolutionChainUrl: raw.evolution_chain.url,
    flavorText,
    isLegendary: raw.is_legendary,
    isMythical: raw.is_mythical,
  };
}

type RawChainLink = RawEvolutionChain['chain'];
type EvolutionDetail = RawChainLink['evolution_details'][number];

/**
 * Lower score = higher priority.
 * Penalises old-gen methods (location-based level-up, affection-only)
 * so modern equivalents are always preferred when multiple details exist.
 */
function detailPriority(d: EvolutionDetail): number {
  const t = d.trigger.name;
  if (t === 'use-item') return 0;
  if (t === 'trade')    return 1;
  if (t === 'level-up') {
    if (d.location)                        return 20; // old-gen location (Leafeon/Glaceon Gen 4)
    if (d.min_affection && !d.min_happiness) return 10; // old-gen affection (Sylveon Gen 6)
    return 2;
  }
  return 3;
}

/**
 * Accepts the FULL evolution_details array, picks the best entry,
 * and composes a human-readable label that combines all active conditions.
 */
function formatEvolutionTrigger(details: EvolutionDetail[]): string | null {
  if (!details.length) return null;

  const best = [...details].sort((a, b) => detailPriority(a) - detailPriority(b))[0];
  const t = best.trigger.name;

  if (t === 'use-item') {
    return formatPokemonName(best.item?.name ?? '');
  }

  if (t === 'trade') {
    if (best.held_item)    return `Troca c/ ${formatPokemonName(best.held_item.name)}`;
    if (best.trade_species) return `Troca c/ ${formatPokemonName(best.trade_species.name)}`;
    return 'Troca';
  }

  if (t === 'level-up') {
    const parts: string[] = [];

    if (best.min_happiness) {
      // Combine happiness + optional time of day + optional fairy move (Sylveon)
      let base = 'Alta amizade';
      if (best.time_of_day === 'day')   base += ' (dia)';
      if (best.time_of_day === 'night') base += ' (noite)';
      parts.push(base);
      if (best.known_move_type) {
        parts.push(`Golpe ${formatPokemonName(best.known_move_type.name)}`);
      }
    } else if (best.min_affection) {
      // Fallback: old-gen affection (Sylveon Gen 6 if Gen 8+ entry absent)
      const base = `Alta afeição${best.known_move_type ? ` + Golpe ${formatPokemonName(best.known_move_type.name)}` : ''}`;
      parts.push(base);
    } else if (best.min_beauty) {
      parts.push('Alta beleza');
    } else if (best.min_level) {
      let lvl = `Nível ${best.min_level}`;
      if (best.time_of_day === 'day')   lvl += ' (dia)';
      if (best.time_of_day === 'night') lvl += ' (noite)';
      parts.push(lvl);
    } else if (best.known_move) {
      parts.push(`Aprende ${formatPokemonName(best.known_move.name)}`);
    } else if (best.known_move_type) {
      parts.push(`Golpe ${formatPokemonName(best.known_move_type.name)}`);
    } else if (best.location) {
      parts.push(`Nível em ${formatPokemonName(best.location.name)}`);
    } else if (best.time_of_day === 'day') {
      parts.push('Subir nível (dia)');
    } else if (best.time_of_day === 'night') {
      parts.push('Subir nível (noite)');
    } else {
      parts.push('Subir nível');
    }

    return parts.join(' + ');
  }

  if (t === 'shed') return 'Shed (nível 20 + vaga)';

  return formatPokemonName(t);
}

function parseChainLink(link: RawChainLink): EvolutionNode {
  const id = idFromUrl(link.species.url);

  return {
    name: link.species.name,
    id,
    spriteUrl: spriteUrl(id),
    // Pass the full array so the picker can choose the best detail
    triggerLabel: formatEvolutionTrigger(link.evolution_details),
    children: link.evolves_to.map(parseChainLink),
  };
}

export function adaptEvolutionChain(raw: RawEvolutionChain): EvolutionNode {
  return parseChainLink(raw.chain);
}

export function adaptEncounters(raw: RawEncounters): Encounter[] {
  return raw.map((e) => ({
    locationArea: formatPokemonName(e.location_area.name.replace(/-area$/, '')),
    versions: e.version_details.map((v) => formatPokemonName(v.version.name)),
  }));
}
