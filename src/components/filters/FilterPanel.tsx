import { X } from 'lucide-react';
import type { FilterState } from '../../types/filters';
import { BST_MIN, BST_MAX, EGG_GROUPS, isFilterActive } from '../../types/filters';
import { ALL_TYPES } from '../../lib/typeChart';
import { getTypeStyle } from '../../utils/typeColors';
import { formatPokemonName } from '../../utils/formatters';
import type { PokemonTypeName } from '../../types/pokemon';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onClear: () => void;
  resultCount: number;
}

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

const selectClass =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ' +
  'text-sm text-gray-800 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400';

export function FilterPanel({ filters, onChange, onClear, resultCount }: FilterPanelProps) {
  function toggleType(t: PokemonTypeName) {
    const has = filters.types.includes(t);
    onChange({
      ...filters,
      types: has ? filters.types.filter((x) => x !== t) : [...filters.types, t],
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-5">
      {/* Types */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Tipos {filters.types.length > 0 && <span className="normal-case text-gray-400">(deve ter todos)</span>}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => {
            const active = filters.types.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  active ? 'ring-2 ring-offset-1 ring-gray-900 dark:ring-white dark:ring-offset-gray-800' : 'opacity-60 hover:opacity-100'
                }`}
                style={getTypeStyle(t)}
                aria-pressed={active}
              >
                {formatPokemonName(t)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Generation */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Geração
          </label>
          <select
            className={`${selectClass} w-full`}
            value={filters.gen ?? ''}
            onChange={(e) => onChange({ ...filters, gen: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Todas</option>
            {GENERATIONS.map((g) => (
              <option key={g} value={g}>Gen {ROMAN[g - 1]}</option>
            ))}
          </select>
        </div>

        {/* Egg group */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Egg Group
          </label>
          <select
            className={`${selectClass} w-full`}
            value={filters.eggGroup ?? ''}
            onChange={(e) => onChange({ ...filters, eggGroup: e.target.value || null })}
          >
            <option value="">Todos</option>
            {EGG_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* BST range */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Total de stats base (BST): {filters.bstMin} – {filters.bstMax}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] text-gray-400">Mínimo</span>
            <input
              type="range"
              min={BST_MIN}
              max={BST_MAX}
              step={5}
              value={filters.bstMin}
              onChange={(e) => onChange({ ...filters, bstMin: Math.min(Number(e.target.value), filters.bstMax) })}
              className="w-full accent-red-500"
              aria-label="BST mínimo"
            />
          </div>
          <div>
            <span className="text-[11px] text-gray-400">Máximo</span>
            <input
              type="range"
              min={BST_MIN}
              max={BST_MAX}
              step={5}
              value={filters.bstMax}
              onChange={(e) => onChange({ ...filters, bstMax: Math.max(Number(e.target.value), filters.bstMin) })}
              className="w-full accent-red-500"
              aria-label="BST máximo"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {resultCount} Pokémon
        </span>
        {isFilterActive(filters) && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            <X size={14} /> Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
