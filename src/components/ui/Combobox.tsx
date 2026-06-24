import { useState, useRef, useMemo } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface ComboboxProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  /** Shown (disabled) when there are no options yet, e.g. learnset loading. */
  emptyHint?: string;
}

const MAX_VISIBLE = 60;

const baseClass =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ' +
  'text-sm text-gray-800 dark:text-gray-100 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400 w-full';

export function Combobox({ value, options, onChange, placeholder, emptyHint }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return list.slice(0, MAX_VISIBLE);
  }, [options, search]);

  function select(option: string) {
    onChange(option);
    setSearch('');
    setOpen(false);
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          className={`${baseClass} pr-7`}
          value={open ? search : value}
          placeholder={placeholder}
          onFocus={() => { setSearch(''); setOpen(true); }}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 120); }}
        />
        {value && !open ? (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange(''); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
            aria-label="Limpar"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        )}
      </div>

      {open && (
        <ul
          className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
          // Keep focus on input long enough to register the click.
          onMouseDown={() => { if (blurTimer.current) clearTimeout(blurTimer.current); }}
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-gray-400">
              {options.length === 0 ? emptyHint ?? 'Sem opções' : 'Nenhum resultado'}
            </li>
          ) : (
            filtered.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => select(option)}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    option === value
                      ? 'font-semibold text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {option}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
