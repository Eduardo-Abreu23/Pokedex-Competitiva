import { Swords, Shield, Sparkles, Zap } from 'lucide-react';
import type { CompetitiveSet, StatSpread } from '../../types/competitive';
import { STAT_ORDER, COMPETITIVE_STAT_LABELS } from '../../types/competitive';
import { TypeBadge } from '../ui/TypeBadge';
import type { PokemonTypeName } from '../../types/pokemon';
import { ALL_TYPES } from '../../lib/typeChart';

interface SetCardProps {
  set: CompetitiveSet;
}

function spreadToString(spread: StatSpread): string {
  const parts = STAT_ORDER.filter((k) => spread[k] !== undefined).map(
    (k) => `${spread[k]} ${COMPETITIVE_STAT_LABELS[k]}`,
  );
  return parts.join(' / ');
}

function ivsToString(spread: StatSpread): string {
  // Only show IVs that deviate from the default 31.
  const parts = STAT_ORDER.filter((k) => spread[k] !== undefined && spread[k] !== 31).map(
    (k) => `${spread[k]} ${COMPETITIVE_STAT_LABELS[k]}`,
  );
  return parts.join(' / ');
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400 dark:text-gray-500 shrink-0">{icon}</span>
      <span className="text-gray-500 dark:text-gray-400 w-16 shrink-0">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
    </div>
  );
}

export function SetCard({ set }: SetCardProps) {
  const evStr = spreadToString(set.evs);
  const ivStr = set.ivs ? ivsToString(set.ivs) : '';
  const teraIsType = set.teraType && ALL_TYPES.includes(set.teraType as PokemonTypeName);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 p-5 space-y-4">
      {/* Header: set name + tera */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-bold text-gray-900 dark:text-white">{set.name}</h3>
        {set.teraType && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Tera
            </span>
            {teraIsType ? (
              <TypeBadge type={set.teraType as PokemonTypeName} size="sm" />
            ) : (
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200 capitalize">
                {set.teraType}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meta: item, ability, nature, level */}
      <div className="space-y-1.5">
        {set.item && <MetaRow icon={<Sparkles size={14} />} label="Item" value={set.item} />}
        {set.ability && <MetaRow icon={<Zap size={14} />} label="Habilidade" value={set.ability} />}
        {set.nature && <MetaRow icon={<Swords size={14} />} label="Nature" value={set.nature} />}
        {set.level && <MetaRow icon={<Shield size={14} />} label="Nível" value={String(set.level)} />}
      </div>

      {/* EVs / IVs */}
      {(evStr || ivStr) && (
        <div className="space-y-1.5 pt-1">
          {evStr && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400 mr-2">EVs:</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">{evStr}</span>
            </div>
          )}
          {ivStr && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400 mr-2">IVs:</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">{ivStr}</span>
            </div>
          )}
        </div>
      )}

      {/* Moves */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {set.moves.map((move, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            {move}
          </div>
        ))}
      </div>
    </div>
  );
}
