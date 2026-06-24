import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import type { TeamMember } from '../../types/team';
import {
  STAT_KEYS,
  STAT_LABELS,
  EV_MAX_PER_STAT,
  EV_MAX_TOTAL,
  IV_MAX,
  MAX_MOVES,
  evTotal,
  clampEv,
  clampIv,
} from '../../types/team';
import type { BaseStats } from '../../types/filters';
import type { NatureOption, ItemOption } from '../../services/teamData';
import { ALL_TYPES } from '../../lib/typeChart';
import { spriteUrl, formatPokemonName } from '../../utils/formatters';
import { Combobox } from '../ui/Combobox';
import { useLearnset } from '../../hooks/useLearnset';

interface MemberEditorProps {
  member: TeamMember;
  natures: NatureOption[];
  items: ItemOption[];
  onChange: (patch: Partial<TeamMember>) => void;
  onRemove: () => void;
}

const inputClass =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ' +
  'text-sm text-gray-800 dark:text-gray-100 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400 w-full';

const TERA_TYPES = ALL_TYPES.map((t) => formatPokemonName(t)); // capitalized for Showdown

export function MemberEditor({ member, natures, items, onChange, onRemove }: MemberEditorProps) {
  const total = evTotal(member.evs);
  const { data: moveOptions = [], isLoading: movesLoading } = useLearnset(member.num);

  // All items are selectable (no per-species restriction).
  const itemOptions = useMemo(() => items.map((i) => i.name), [items]);

  function setEv(stat: keyof BaseStats, value: number) {
    onChange({ evs: { ...member.evs, [stat]: clampEv(member.evs, stat, value) } });
  }
  function setIv(stat: keyof BaseStats, value: number) {
    onChange({ ivs: { ...member.ivs, [stat]: clampIv(value) } });
  }
  function setMove(i: number, value: string) {
    const moves = [...member.moves];
    while (moves.length <= i) moves.push('');
    moves[i] = value;
    while (moves.length && !moves[moves.length - 1]) moves.pop(); // drop trailing empties
    onChange({ moves: moves.slice(0, MAX_MOVES) });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img src={spriteUrl(member.num)} alt="" className="w-12 h-12 object-contain shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white truncate">{member.species}</p>
          <label className="text-xs text-gray-400 flex items-center gap-1">
            Nível
            <input
              type="number"
              min={1}
              max={100}
              value={member.level}
              onChange={(e) => onChange({ level: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
              className="w-14 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-1.5 py-0.5 text-gray-700 dark:text-gray-200"
            />
          </label>
        </div>
        <button
          onClick={onRemove}
          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors shrink-0"
          aria-label="Remover membro"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Ability / Item / Nature / Tera */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[11px] text-gray-400">Habilidade</span>
          <select
            className={inputClass}
            value={member.ability ?? ''}
            onChange={(e) => onChange({ ability: e.target.value || null })}
          >
            <option value="">—</option>
            {member.abilityOptions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] text-gray-400">Item</span>
          <Combobox
            value={member.item ?? ''}
            options={itemOptions}
            onChange={(v) => onChange({ item: v || null })}
            placeholder="Item…"
          />
        </label>

        <label className="block">
          <span className="text-[11px] text-gray-400">Nature</span>
          <select
            className={inputClass}
            value={member.nature}
            onChange={(e) => onChange({ nature: e.target.value })}
          >
            {natures.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name}
                {n.plus && n.minus ? ` (+${STAT_LABELS[n.plus as keyof BaseStats]} / -${STAT_LABELS[n.minus as keyof BaseStats]})` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] text-gray-400">Tera Type</span>
          <select
            className={inputClass}
            value={member.teraType ?? ''}
            onChange={(e) => onChange({ teraType: e.target.value || null })}
          >
            <option value="">—</option>
            {TERA_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Moves */}
      <div>
        <span className="text-[11px] text-gray-400">Golpes (até {MAX_MOVES})</span>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {Array.from({ length: MAX_MOVES }).map((_, i) => (
            <Combobox
              key={i}
              value={member.moves[i] ?? ''}
              options={moveOptions}
              onChange={(v) => setMove(i, v)}
              placeholder={`Golpe ${i + 1}`}
              emptyHint={movesLoading ? 'Carregando golpes…' : 'Sem golpes'}
            />
          ))}
        </div>
      </div>

      {/* EVs */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">EVs (máx. {EV_MAX_PER_STAT}/stat)</span>
          <span className={`text-[11px] font-semibold ${total > EV_MAX_TOTAL ? 'text-red-500' : total === EV_MAX_TOTAL ? 'text-green-500' : 'text-gray-400'}`}>
            {total} / {EV_MAX_TOTAL}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-1.5 mt-1">
          {STAT_KEYS.map((k) => (
            <label key={k} className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-gray-400">{STAT_LABELS[k]}</span>
              <input
                type="number"
                min={0}
                max={EV_MAX_PER_STAT}
                value={member.evs[k]}
                onChange={(e) => setEv(k, Number(e.target.value) || 0)}
                className="w-full text-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-1 py-1 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-400"
              />
            </label>
          ))}
        </div>
      </div>

      {/* IVs */}
      <div>
        <span className="text-[11px] text-gray-400">IVs (0–{IV_MAX})</span>
        <div className="grid grid-cols-6 gap-1.5 mt-1">
          {STAT_KEYS.map((k) => (
            <label key={k} className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-gray-400">{STAT_LABELS[k]}</span>
              <input
                type="number"
                min={0}
                max={IV_MAX}
                value={member.ivs[k]}
                onChange={(e) => setIv(k, Number(e.target.value) || 0)}
                className="w-full text-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-1 py-1 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-400"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
