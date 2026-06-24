import type { BaseStats } from './filters';

export const EV_MAX_PER_STAT = 252;
export const EV_MAX_TOTAL = 510;
export const IV_MAX = 31;
export const MAX_MEMBERS = 6;
export const MAX_MOVES = 4;

export interface TeamMember {
  id: string;
  /** Canonical Showdown species name (e.g. "Garchomp") — used for export. */
  species: string;
  /** National dex number — for sprite/artwork. */
  num: number;
  ability: string | null;
  /** Legal abilities for this species (incl. hidden), resolved at add/import. */
  abilityOptions: string[];
  item: string | null;
  nature: string;
  moves: string[];
  evs: BaseStats;
  ivs: BaseStats;
  teraType: string | null;
  level: number;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  createdAt: number;
  updatedAt: number;
}

export const ZERO_EVS: BaseStats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
export const MAX_IVS: BaseStats = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

export const STAT_KEYS: (keyof BaseStats)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
export const STAT_LABELS: Record<keyof BaseStats, string> = {
  hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe',
};

export function evTotal(evs: BaseStats): number {
  return STAT_KEYS.reduce((sum, k) => sum + (evs[k] || 0), 0);
}

/** Clamps a proposed EV value so it respects the per-stat and total caps. */
export function clampEv(evs: BaseStats, stat: keyof BaseStats, value: number): number {
  const capped = Math.max(0, Math.min(EV_MAX_PER_STAT, value));
  const otherTotal = evTotal(evs) - (evs[stat] || 0);
  const remaining = EV_MAX_TOTAL - otherTotal;
  return Math.max(0, Math.min(capped, remaining));
}

export function clampIv(value: number): number {
  return Math.max(0, Math.min(IV_MAX, value));
}

export function newId(): string {
  const c = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}
