import type { PokemonTypeName } from '../types/pokemon';
import type { TeamMember } from '../types/team';
import {
  ALL_TYPES,
  attackMultiplier,
  typesResisting,
  typesSuperEffectiveAgainst,
} from './typeChart';

export const WEAKNESS_HIGH = 3; // 3+ members weak → strong alert
export const WEAKNESS_MEDIUM = 2; // 2 members weak → subtle alert

export interface MemberRef {
  num: number;
  species: string;
}

export interface DefensiveRow {
  type: PokemonTypeName;
  weak: number;
  resist: number;
  immune: number;
}

export interface WeaknessAlert {
  type: PokemonTypeName;
  count: number;
  members: MemberRef[];
  severity: 'high' | 'medium';
}

export interface ResistanceRow {
  type: PokemonTypeName;
  count: number; // members resisting or immune
}

export interface OffensiveCell {
  type: PokemonTypeName; // defending type
  bestMult: number;
}

export interface MemberSpeed {
  species: string;
  num: number;
  speed: number;
}

export interface TeamAnalysis {
  size: number;
  defensive: DefensiveRow[];
  weaknessAlerts: WeaknessAlert[];
  resistances: ResistanceRow[];
  offensive: OffensiveCell[];
  offensiveTypes: PokemonTypeName[];
  coveredCount: number;
  offensiveGaps: PokemonTypeName[];
  hasDamagingMoves: boolean;
  avgSpeed: number;
  speedTier: string;
  memberSpeeds: MemberSpeed[];
  suggestions: string[];
  rating: { score: number; grade: string; summary: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dex = any;

interface MemberContext {
  num: number;
  species: string;
  types: PokemonTypeName[];
  speed: number;
}

function computeSpeed(base: number, ev: number, iv: number, level: number, natureMod: number): number {
  const inner = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  return Math.floor(inner * natureMod);
}

function memberContext(m: TeamMember, dex: Dex): MemberContext | null {
  const sp = dex.species.get(m.species);
  if (!sp?.types) return null;
  const types = sp.types.map((t: string) => t.toLowerCase() as PokemonTypeName);

  const nat = dex.natures.get(m.nature);
  const natureMod = nat?.plus === 'spe' ? 1.1 : nat?.minus === 'spe' ? 0.9 : 1;
  const speed = computeSpeed(sp.baseStats.spe, m.evs.spe, m.ivs.spe, m.level, natureMod);

  return { num: m.num, species: m.species, types, speed };
}

export function analyzeTeam(members: TeamMember[], dex: Dex): TeamAnalysis {
  const ctx = members.map((m) => memberContext(m, dex)).filter((c): c is MemberContext => !!c);
  const size = ctx.length;

  // ── Defensive matrix ──
  const defensive: DefensiveRow[] = ALL_TYPES.map((type) => {
    let weak = 0, resist = 0, immune = 0;
    for (const member of ctx) {
      const mult = attackMultiplier(type, member.types);
      if (mult === 0) immune++;
      else if (mult > 1) weak++;
      else if (mult < 1) resist++;
    }
    return { type, weak, resist, immune };
  });

  const weaknessAlerts: WeaknessAlert[] = defensive
    .filter((r) => r.weak >= WEAKNESS_MEDIUM)
    .map((r) => ({
      type: r.type,
      count: r.weak,
      severity: (r.weak >= WEAKNESS_HIGH ? 'high' : 'medium') as 'high' | 'medium',
      members: ctx
        .filter((m) => attackMultiplier(r.type, m.types) > 1)
        .map((m) => ({ num: m.num, species: m.species })),
    }))
    .sort((a, b) => b.count - a.count);

  const resistances: ResistanceRow[] = defensive
    .map((r) => ({ type: r.type, count: r.resist + r.immune }))
    .filter((r) => r.count >= 3)
    .sort((a, b) => b.count - a.count);

  // ── Offensive coverage ──
  const offensiveTypeSet = new Set<PokemonTypeName>();
  for (const m of members) {
    for (const moveName of m.moves) {
      if (!moveName) continue;
      const mv = dex.moves.get(moveName);
      if (mv?.exists && mv.category !== 'Status') {
        offensiveTypeSet.add(mv.type.toLowerCase() as PokemonTypeName);
      }
    }
  }
  const offensiveTypes = [...offensiveTypeSet];
  const hasDamagingMoves = offensiveTypes.length > 0;

  const offensive: OffensiveCell[] = ALL_TYPES.map((defType) => {
    let bestMult = 0;
    for (const atk of offensiveTypes) {
      bestMult = Math.max(bestMult, attackMultiplier(atk, [defType]));
    }
    return { type: defType, bestMult: hasDamagingMoves ? bestMult : 1 };
  });
  const offensiveGaps = offensive.filter((o) => o.bestMult < 2).map((o) => o.type);
  const coveredCount = 18 - offensiveGaps.length;

  // ── Speed ──
  const memberSpeeds: MemberSpeed[] = ctx
    .map((m) => ({ species: m.species, num: m.num, speed: m.speed }))
    .sort((a, b) => b.speed - a.speed);
  const avgSpeed = size > 0 ? Math.round(ctx.reduce((s, m) => s + m.speed, 0) / size) : 0;
  const avgBaseSpeed =
    size > 0
      ? ctx.reduce((s, m) => s + (dex.species.get(m.species)?.baseStats.spe ?? 0), 0) / size
      : 0;
  const speedTier = avgBaseSpeed >= 95 ? 'Rápido' : avgBaseSpeed >= 65 ? 'Médio' : 'Lento';

  // ── Suggestions (heuristic) ──
  const suggestions: string[] = [];
  for (const alert of weaknessAlerts.slice(0, 2)) {
    const resisters = typesResisting(alert.type).slice(0, 3).map(cap).join(', ');
    suggestions.push(
      `${alert.count} membros fracos a ${cap(alert.type)} — considere um tipo que resista (${resisters}).`,
    );
  }
  if (hasDamagingMoves && offensiveGaps.length > 0) {
    // Suggest the offensive type(s) that patch the most gaps.
    const coverageCount = new Map<PokemonTypeName, number>();
    for (const gap of offensiveGaps) {
      for (const t of typesSuperEffectiveAgainst(gap)) {
        coverageCount.set(t, (coverageCount.get(t) ?? 0) + 1);
      }
    }
    const best = [...coverageCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => cap(t));
    if (best.length) {
      suggestions.push(
        `O time não bate forte em ${offensiveGaps.length} tipo(s) — golpes de ${best.join(' ou ')} ajudariam na cobertura.`,
      );
    }
  }
  if (!hasDamagingMoves && size > 0) {
    suggestions.push('Adicione golpes de ataque para avaliar a cobertura ofensiva.');
  }
  if (weaknessAlerts.length === 0 && offensiveGaps.length <= 3 && size >= 4) {
    suggestions.push('Time bem equilibrado — sem fraquezas compartilhadas críticas e boa cobertura.');
  }

  // ── Rating (heuristic, mitigation-aware) ──
  // A shared weakness only hurts to the extent the team can't switch into it:
  // netWeak counts, per attacking type, the members weak BEYOND those that resist/are immune.
  const netWeak = defensive.reduce((sum, r) => sum + Math.max(0, r.weak - (r.resist + r.immune)), 0);
  // Defensive breadth: how many of the 18 types at least one member resists/blocks.
  const typesResisted = defensive.filter((r) => r.resist + r.immune > 0).length;
  const offCov = coveredCount / 18;
  const defBreadth = typesResisted / 18;

  // Balanced: penalize only unmitigated weaknesses; reward offense + defensive breadth.
  const raw = 100 - 5 * netWeak - 12 * (1 - offCov) - 10 * (1 - defBreadth);
  // Incomplete teams (< 6) are gently discounted so a lone strong mon isn't graded as a team.
  const completeness = 0.5 + 0.5 * (size / 6);
  const score = size === 0 ? 0 : Math.max(0, Math.min(100, Math.round(raw * completeness)));
  const grade = score >= 90 ? 'S' : score >= 78 ? 'A' : score >= 64 ? 'B' : score >= 48 ? 'C' : 'D';

  const topWeakness = weaknessAlerts.find((a) => a.severity === 'high');
  let summary: string;
  if (size === 0) summary = 'Adicione Pokémon para analisar.';
  else if (!hasDamagingMoves) summary = 'Adicione golpes de ataque para avaliar a cobertura ofensiva.';
  else if (score >= 78) summary = 'Time forte: ótima cobertura e fraquezas bem distribuídas.';
  else if (score >= 64)
    summary = topWeakness
      ? `Time sólido — de olho na fraqueza compartilhada a ${cap(topWeakness.type)}.`
      : 'Time sólido e equilibrado.';
  else if (score >= 48) summary = 'Time mediano — reduza fraquezas sem resposta ou amplie a cobertura.';
  else summary = 'Time frágil: muitas fraquezas sem resposta e/ou cobertura ofensiva limitada.';

  return {
    size,
    defensive,
    weaknessAlerts,
    resistances,
    offensive,
    offensiveTypes,
    coveredCount,
    offensiveGaps,
    hasDamagingMoves,
    avgSpeed,
    speedTier,
    memberSpeeds,
    suggestions,
    rating: { score, grade, summary },
  };
}

function cap(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}
