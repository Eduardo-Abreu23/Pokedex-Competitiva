import { SearchX } from 'lucide-react';

interface EmptyCompetitiveProps {
  pokemonName: string;
}

/**
 * Shown when a Pokémon has no competitive set in any generation. This is a
 * legitimate empty state — neutral styling, no error iconography.
 */
export function EmptyCompetitive({ pokemonName }: EmptyCompetitiveProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
      <SearchX size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-gray-600 dark:text-gray-300 font-medium">
        Sem dados competitivos para {pokemonName}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
        Este Pokémon não tem builds registradas na Smogon em nenhuma geração.
      </p>
    </div>
  );
}
