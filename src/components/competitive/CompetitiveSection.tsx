import { AlertCircle, RotateCw } from 'lucide-react';
import { useRecommendedBuild } from '../../hooks/useRecommendedBuild';
import { SetCard } from './SetCard';
import { EmptyCompetitive } from './EmptyCompetitive';
import { Skeleton } from '../ui/Skeleton';
import { competitiveSourceLabel } from '../../utils/formatters';

interface CompetitiveSectionProps {
  /** PokéAPI-style name passed to the data layer (e.g. "landorus-therian"). */
  pokemonName: string;
  /** Pretty name for display (e.g. "Landorus Therian"). */
  displayName: string;
}

export function CompetitiveSection({ pokemonName, displayName }: CompetitiveSectionProps) {
  const { data, isLoading, isError, refetch } = useRecommendedBuild(pokemonName);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4">
      {/* Header: title + source label */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Build Recomendada
        </h2>
        {data && (
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
            {competitiveSourceLabel(data.gen, data.formatId)}
          </span>
        )}
      </div>

      {/* States */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center text-center py-10 gap-3">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-gray-600 dark:text-gray-300">
            Não foi possível carregar os dados competitivos.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <RotateCw size={14} /> Tentar novamente
          </button>
        </div>
      ) : !data ? (
        <EmptyCompetitive pokemonName={displayName} />
      ) : (
        <SetCard set={data.set} />
      )}
    </div>
  );
}
