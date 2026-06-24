import { Link } from 'react-router-dom';
import type { HistoryEntry } from '../../store/historyStore';
import { spriteUrl, formatPokemonName, formatPokemonNumber } from '../../utils/formatters';

interface MiniPokemonRowProps {
  title: string;
  icon: React.ReactNode;
  entries: HistoryEntry[];
}

export function MiniPokemonRow({ title, icon, entries }: MiniPokemonRowProps) {
  if (entries.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {entries.map((e) => (
          <Link
            key={e.name}
            to={`/pokemon/${e.name}`}
            className="flex flex-col items-center gap-1 shrink-0 w-20 p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all"
          >
            <img
              src={spriteUrl(e.id)}
              alt={formatPokemonName(e.name)}
              className="w-12 h-12 object-contain"
              loading="lazy"
            />
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {formatPokemonNumber(e.id)}
            </span>
            <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200 text-center leading-tight truncate w-full">
              {formatPokemonName(e.name)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
