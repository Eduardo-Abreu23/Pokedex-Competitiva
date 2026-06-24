import { getDex } from './dex';
import type { TeamMember } from '../types/team';
import { ZERO_EVS, MAX_IVS, newId } from '../types/team';
import type { BaseStats } from '../types/filters';

/**
 * Showdown import/export via @pkmn/sets. The UI never touches @pkmn/sets
 * directly — it goes through these two functions.
 */

function fillStats(partial: Partial<BaseStats> | undefined, fallback: BaseStats): BaseStats {
  return {
    hp: partial?.hp ?? fallback.hp,
    atk: partial?.atk ?? fallback.atk,
    def: partial?.def ?? fallback.def,
    spa: partial?.spa ?? fallback.spa,
    spd: partial?.spd ?? fallback.spd,
    spe: partial?.spe ?? fallback.spe,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setToMember(set: any, Dex: any): TeamMember {
  const sp = Dex.species.get(set.species);
  const abilityOptions = sp?.abilities
    ? (Object.values(sp.abilities).filter(Boolean) as string[])
    : [];
  return {
    id: newId(),
    species: sp?.name ?? set.species,
    num: sp?.num ?? 0,
    ability: set.ability || abilityOptions[0] || null,
    abilityOptions,
    item: set.item || null,
    nature: set.nature || 'Hardy',
    moves: (set.moves ?? []).filter(Boolean).slice(0, 4),
    evs: fillStats(set.evs, ZERO_EVS),
    ivs: fillStats(set.ivs, MAX_IVS),
    teraType: set.teraType || null,
    level: set.level ?? 100,
  };
}

function memberToSet(m: TeamMember) {
  return {
    species: m.species,
    item: m.item ?? undefined,
    ability: m.ability ?? undefined,
    nature: m.nature,
    moves: m.moves.filter(Boolean),
    evs: m.evs,
    ivs: m.ivs,
    level: m.level,
    teraType: m.teraType ?? undefined,
  };
}

/** Parses a Showdown team paste into team members. Throws on unparseable input. */
export async function importShowdownTeam(text: string): Promise<TeamMember[]> {
  const [Dex, { Teams }] = await Promise.all([getDex(), import('@pkmn/sets')]);
  const team = Teams.importTeam(text, Dex);
  if (!team || team.team.length === 0) {
    throw new Error('Não foi possível interpretar o time. Verifique o formato Showdown.');
  }
  return team.team.map((set) => setToMember(set, Dex));
}

/** Exports team members to Showdown paste format. */
export async function exportShowdownTeam(members: TeamMember[]): Promise<string> {
  const [Dex, { Team }] = await Promise.all([getDex(), import('@pkmn/sets')]);
  const sets = members.map(memberToSet);
  const text = new Team(sets, Dex).export();
  // Strip the library's trailing whitespace per line for a clean paste.
  return text
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .trim();
}
