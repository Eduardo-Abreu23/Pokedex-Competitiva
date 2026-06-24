import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useSearchPokemon } from '../../hooks/usePokemonList';
import { formatPokemonName, formatPokemonNumber } from '../../utils/formatters';

interface ComparePickerProps {
  label: string;
  onSelect: (name: string, id: number) => void;
}

export function ComparePicker({ label, onSelect }: ComparePickerProps) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250);
  const { results } = useSearchPokemon(debounced);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={label}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label={label}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpar"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {debounced.trim() && results.length > 0 && (
        <ul className="max-h-60 overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 divide-y divide-gray-50 dark:divide-gray-700/50">
          {results.slice(0, 8).map((p) => (
            <li key={p.id}>
              <button
                onClick={() => { onSelect(p.name, p.id); setQuery(''); }}
                className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <img src={p.spriteUrl} alt="" className="w-9 h-9 object-contain" loading="lazy" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {formatPokemonName(p.name)}
                </span>
                <span className="text-xs text-gray-400 ml-auto">{formatPokemonNumber(p.id)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
