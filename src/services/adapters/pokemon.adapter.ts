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
 * Lower score = higher priority when a branch lists several evolution methods.
 *
 * The canonical level-up / trade method wins over a regional `use-item`
 * (e.g. Slowbro = "Nível 37", NOT Galarian "Galarica Cuff"), while `use-item`
 * still beats the obsolete location-based level-ups (Leafeon = "Leaf Stone",
 * not "Nível em Eterna Forest"). Old affection-only methods are deprioritised.
 */
function detailPriority(d: EvolutionDetail): number {
  const t = d.trigger.name;
  if (t === 'trade') return 1;
  if (t === 'level-up') {
    if (d.location) return 20; // obsolete location method (Gen 4–7 Leafeon/Glaceon)
    if (d.min_affection && !d.min_happiness) return 10; // obsolete affection (Gen 6 Sylveon)
    return 1; // canonical level-up
  }
  if (t === 'use-item') return 2; // beats location level-up, loses to canonical level-up/trade
  if (t === 'other') return 2;
  return 3;
}

function timeLabel(t: string): string {
  return t === 'day' ? 'dia' : t === 'night' ? 'noite' : t === 'dusk' ? 'crepúsculo' : t;
}

function genderLabel(g: number): string {
  return g === 1 ? '♀' : g === 2 ? '♂' : '';
}

/** Formats a single evolution_details entry into a human-readable condition. */
function formatOneDetail(d: EvolutionDetail): string {
  const t = d.trigger.name;

  if (t === 'use-item') return formatPokemonName(d.item?.name ?? '');

  if (t === 'trade') {
    if (d.held_item) return `Troca c/ ${formatPokemonName(d.held_item.name)}`;
    if (d.trade_species) return `Troca c/ ${formatPokemonName(d.trade_species.name)}`;
    return 'Troca';
  }

  if (t === 'shed') return 'Shed (nível 20 + vaga)';

  // Qualifiers that refine a base method (Atk/Def for Tyrogue, gender, time, etc.)
  const extras: string[] = [];
  if (d.relative_physical_stats != null) {
    extras.push(d.relative_physical_stats > 0 ? 'Atk > Def' : d.relative_physical_stats < 0 ? 'Atk < Def' : 'Atk = Def');
  }
  if (d.gender) {
    const g = genderLabel(d.gender);
    if (g) extras.push(g);
  }
  if (d.time_of_day) extras.push(timeLabel(d.time_of_day));
  if (d.needs_overworld_rain) extras.push('com chuva');
  if (d.turn_upside_down) extras.push('de cabeça pra baixo');
  if (d.min_happiness && d.known_move_type) extras.push(`Golpe ${formatPokemonName(d.known_move_type.name)}`);

  let base: string;
  if (d.min_happiness) base = 'Alta amizade';
  else if (d.min_affection) base = `Alta afeição${d.known_move_type ? ` + Golpe ${formatPokemonName(d.known_move_type.name)}` : ''}`;
  else if (d.min_beauty) base = 'Alta beleza';
  else if (d.min_level) base = `Nível ${d.min_level}`;
  else if (d.known_move) base = `Aprende ${formatPokemonName(d.known_move.name)}`;
  else if (d.known_move_type) base = `Golpe ${formatPokemonName(d.known_move_type.name)}`;
  else if (d.location) base = `Nível em ${formatPokemonName(d.location.name)}`;
  else if (t === 'level-up') base = 'Subir nível';
  else base = 'Condição especial'; // unexpressible trigger (e.g. random/style) — approximate

  return extras.length ? `${base} (${extras.join(', ')})` : base;
}

/**
 * Returns the distinct highest-priority evolution methods for a branch, keeping
 * the source detail of each (for forme resolution). De-duped by label, so a
 * species reachable several ways yields one entry per method (Rockruff →
 * Lycanroc: 3 — "Nível 25 (dia/noite/crepúsculo)").
 */
function keptMethods(details: EvolutionDetail[]): { label: string | null; detail: EvolutionDetail | null }[] {
  if (!details.length) return [{ label: null, detail: null }];

  const minPriority = Math.min(...details.map(detailPriority));
  const kept = details.filter((d) => detailPriority(d) === minPriority);
  const byLabel = new Map<string, EvolutionDetail>();
  for (const d of kept) {
    const label = formatOneDetail(d);
    if (!byLabel.has(label)) byLabel.set(label, d);
  }
  return [...byLabel.entries()].map(([label, detail]) => ({ label, detail }));
}

/**
 * Builds evolution nodes for one chain link. A link points at a single species
 * but may list several methods (the PokéAPI keeps forme variants — e.g. the
 * three Lycanroc forms — under one species). We emit ONE node per distinct
 * method so each possible destination is its own card. When a species splits
 * into formes this way, `formHint` records the discriminator (time of day) so
 * the forme-specific sprite can be resolved afterwards.
 */
function buildEvolutionNodes(link: RawChainLink): EvolutionNode[] {
  const id = idFromUrl(link.species.url);
  const children = link.evolves_to.flatMap(buildEvolutionNodes);
  const methods = keptMethods(link.evolution_details);
  const isFormeSplit = methods.length > 1;

  return methods.map(({ label, detail }) => ({
    name: link.species.name,
    id,
    spriteUrl: spriteUrl(id),
    triggerLabel: label,
    formHint: isFormeSplit ? detail?.time_of_day || null : null,
    children,
  }));
}

export function adaptEvolutionChain(raw: RawEvolutionChain): EvolutionNode {
  const root = raw.chain;
  const id = idFromUrl(root.species.url);
  return {
    name: root.species.name,
    id,
    spriteUrl: spriteUrl(id),
    triggerLabel: null,
    formHint: null,
    children: root.evolves_to.flatMap(buildEvolutionNodes),
  };
}

type SpeciesVariety = { name: string; id: number; isDefault: boolean };

/** Maps a forme discriminator (time of day) to the matching variety's dex id. */
function resolveFormeSpriteId(
  hint: string | null | undefined,
  varieties: SpeciesVariety[],
  fallbackId: number,
): number {
  const def = varieties.find((v) => v.isDefault);
  if (!hint || hint === 'day') return def?.id ?? fallbackId;
  if (hint === 'night') return varieties.find((v) => /midnight|night/.test(v.name))?.id ?? fallbackId;
  if (hint === 'dusk') return varieties.find((v) => v.name.includes('dusk'))?.id ?? fallbackId;
  return varieties.find((v) => v.name.includes(hint))?.id ?? fallbackId;
}

/**
 * Resolves forme-specific sprites for nodes that share a species but differ by
 * forme (Lycanroc Midday/Midnight/Dusk). Mutates the tree in place, fetching a
 * species' varieties once. `fetchVarieties` is injected to keep the adapter
 * free of network concerns. Failures fall back to the base sprite (no crash).
 */
export async function enrichEvolutionForms(
  node: EvolutionNode,
  fetchVarieties: (name: string) => Promise<SpeciesVariety[]>,
): Promise<void> {
  const formeNodes = node.children.filter((c) => c.formHint);
  for (const name of new Set(formeNodes.map((n) => n.name))) {
    const varieties = await fetchVarieties(name).catch(() => null);
    if (!varieties) continue;
    for (const n of formeNodes.filter((c) => c.name === name)) {
      n.id = resolveFormeSpriteId(n.formHint, varieties, n.id);
      n.spriteUrl = spriteUrl(n.id);
    }
  }
  for (const child of node.children) await enrichEvolutionForms(child, fetchVarieties);
}

export function adaptEncounters(raw: RawEncounters): Encounter[] {
  return raw.map((e) => ({
    locationArea: formatPokemonName(e.location_area.name.replace(/-area$/, '')),
    versions: e.version_details.map((v) => formatPokemonName(v.version.name)),
  }));
}
