import type { PokemonTypeName } from '../../types/pokemon';
import { computeDefensiveProfile, ALL_TYPES } from '../../lib/typeChart';
import { TYPE_COLORS } from '../../utils/typeColors';
import { formatPokemonName } from '../../utils/formatters';

interface WeaknessGridProps {
  types: PokemonTypeName[];
}

function multiplierLabel(m: number): string {
  if (m === 0)   return '0×';
  if (m === 0.25) return '¼×';
  if (m === 0.5) return '½×';
  if (m === 2)   return '2×';
  if (m === 4)   return '4×';
  return `${m}×`;
}

function multiplierBg(m: number): string {
  if (m === 0)    return '#1f2937';
  if (m <= 0.25)  return '#1e40af';
  if (m <= 0.5)   return '#3b82f6';
  if (m >= 4)     return '#7f1d1d';
  if (m >= 2)     return '#dc2626';
  return '#6b7280';
}

interface TypeCellProps {
  type: PokemonTypeName;
  multiplier: number;
}

function TypeCell({ type, multiplier }: TypeCellProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded w-full text-center"
        style={{ backgroundColor: TYPE_COLORS[type] }}
      >
        {formatPokemonName(type)}
      </span>
      <span
        className="text-[11px] font-bold text-white px-1.5 py-0.5 rounded w-full text-center"
        style={{ backgroundColor: multiplierBg(multiplier) }}
      >
        {multiplierLabel(multiplier)}
      </span>
    </div>
  );
}

export function WeaknessGrid({ types }: WeaknessGridProps) {
  const profile = computeDefensiveProfile(types);
  const profileMap = new Map(profile.map((e) => [e.type, e.multiplier]));

  const weaknesses = ALL_TYPES.filter((t) => (profileMap.get(t) ?? 1) > 1);
  const resistances = ALL_TYPES.filter((t) => {
    const m = profileMap.get(t) ?? 1;
    return m > 0 && m < 1;
  });
  const immunities = ALL_TYPES.filter((t) => (profileMap.get(t) ?? 1) === 0);

  return (
    <div className="space-y-5">
      {weaknesses.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Fraquezas
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {weaknesses.map((t) => (
              <TypeCell key={t} type={t} multiplier={profileMap.get(t) ?? 1} />
            ))}
          </div>
        </div>
      )}

      {resistances.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Resistências
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {resistances.map((t) => (
              <TypeCell key={t} type={t} multiplier={profileMap.get(t) ?? 1} />
            ))}
          </div>
        </div>
      )}

      {immunities.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Imunidades
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {immunities.map((t) => (
              <TypeCell key={t} type={t} multiplier={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
