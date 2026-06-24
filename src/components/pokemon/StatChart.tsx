import type { Stat } from '../../types/pokemon';
import { STAT_COLORS } from '../../utils/typeColors';

interface StatChartProps {
  stats: Stat[];
}

const MAX_STAT = 255;

export function StatChart({ stats }: StatChartProps) {
  const total = stats.reduce((s, stat) => s + stat.value, 0);

  return (
    <div className="space-y-2.5">
      {stats.map((stat) => {
        const pct = Math.round((stat.value / MAX_STAT) * 100);
        const color = STAT_COLORS[stat.name] ?? '#94A3B8';

        return (
          <div key={stat.name} className="flex items-center gap-3">
            <span className="w-16 text-xs font-medium text-gray-500 dark:text-gray-400 text-right shrink-0">
              {stat.label}
            </span>
            <span className="w-8 text-sm font-bold text-gray-700 dark:text-gray-200 shrink-0">
              {stat.value}
            </span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
        <span className="w-16 text-xs font-medium text-gray-500 dark:text-gray-400 text-right shrink-0">
          Total
        </span>
        <span className="w-8 text-sm font-bold text-gray-700 dark:text-gray-200 shrink-0">
          {total}
        </span>
        <div className="flex-1" />
      </div>
    </div>
  );
}
