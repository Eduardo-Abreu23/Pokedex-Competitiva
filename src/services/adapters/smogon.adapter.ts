import type { RawSmogonSet } from '../../schemas/smogon.schema';
import type { CompetitiveSet, StatSpread } from '../../types/competitive';

/** Picks the first option when a field carries slashed alternatives. */
function first<T>(value: T | T[] | undefined): T | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function normalizeStats(value: StatSpread | StatSpread[] | undefined): StatSpread {
  const picked = first(value);
  return picked ?? {};
}

function isEmptySpread(spread: StatSpread): boolean {
  return Object.keys(spread).length === 0;
}

export function adaptSmogonSet(raw: RawSmogonSet): CompetitiveSet {
  // Each move slot: join slashed alternatives with " / "
  const moves = raw.moves.map((m) => (Array.isArray(m) ? m.join(' / ') : m));

  const evs = normalizeStats(raw.evs as StatSpread | StatSpread[] | undefined);
  const ivs = normalizeStats(raw.ivs as StatSpread | StatSpread[] | undefined);

  // teraType (singular string) is the runtime field; teratypes (plural array) is the fallback.
  const teraRaw = first(raw.teraType) ?? raw.teratypes?.[0];

  return {
    name: raw.name,
    moves,
    ability: first(raw.ability) ?? null,
    item: first(raw.item) ?? null,
    nature: first(raw.nature) ?? null,
    evs,
    ivs: isEmptySpread(ivs) ? null : ivs,
    teraType: teraRaw ? teraRaw.toLowerCase() : null,
    level: first(raw.level) ?? null,
  };
}

export function adaptSmogonSets(raw: RawSmogonSet[]): CompetitiveSet[] {
  return raw.map(adaptSmogonSet);
}
