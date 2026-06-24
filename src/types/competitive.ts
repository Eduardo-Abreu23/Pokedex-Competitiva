/** Competitive stat spread — Showdown stat keys (partial: only set stats present). */
export interface StatSpread {
  hp?: number;
  atk?: number;
  def?: number;
  spa?: number;
  spd?: number;
  spe?: number;
}

/** Normalized competitive set — already flattened from the @pkmn/smogon raw shape. */
export interface CompetitiveSet {
  /** Set name, e.g. "TankChomp", "Choice Specs". */
  name: string;
  /** 1–4 move slots; slashed alternatives are joined with " / ". */
  moves: string[];
  ability: string | null;
  item: string | null;
  nature: string | null;
  /** EV spread — empty object when the set defines none. */
  evs: StatSpread;
  /** IV spread — null when the set uses default 31s. */
  ivs: StatSpread | null;
  /** Suggested Tera Type (Gen 9+), lowercase for type styling. null otherwise. */
  teraType: string | null;
  level: number | null;
}

export const STAT_ORDER: (keyof StatSpread)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

export const COMPETITIVE_STAT_LABELS: Record<keyof StatSpread, string> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe',
};
