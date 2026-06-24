import { useState, lazy, Suspense } from 'react';
import { BarChart3, Radar as RadarIcon } from 'lucide-react';
import type { Stat } from '../../types/pokemon';
import { StatChart } from './StatChart';
import { Skeleton } from '../ui/Skeleton';

const StatRadar = lazy(() => import('./StatRadar'));

interface StatsPanelProps {
  stats: Stat[];
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const [view, setView] = useState<'bars' | 'radar'>('bars');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Stats Base
        </h2>
        <div className="flex gap-1 p-0.5 rounded-lg bg-gray-100 dark:bg-gray-700">
          <button
            onClick={() => setView('bars')}
            className={`p-1.5 rounded-md transition-colors ${
              view === 'bars' ? 'bg-white dark:bg-gray-800 text-red-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Ver em barras"
            aria-pressed={view === 'bars'}
          >
            <BarChart3 size={16} />
          </button>
          <button
            onClick={() => setView('radar')}
            className={`p-1.5 rounded-md transition-colors ${
              view === 'radar' ? 'bg-white dark:bg-gray-800 text-red-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Ver em radar"
            aria-pressed={view === 'radar'}
          >
            <RadarIcon size={16} />
          </button>
        </div>
      </div>

      {view === 'bars' ? (
        <StatChart stats={stats} />
      ) : (
        <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
          <StatRadar stats={stats} />
        </Suspense>
      )}
    </div>
  );
}
