import { useQuery } from '@tanstack/react-query';
import { fetchRecommendedBuild } from '../services/smogon';
import { adaptSmogonSet } from '../services/adapters/smogon.adapter';
import type { CompetitiveSet } from '../types/competitive';

export interface RecommendedBuildResult {
  gen: number;
  formatId: string;
  set: CompetitiveSet;
}

/**
 * Fetches the auto-selected recommended build for a Pokémon (most recent
 * generation with competitive data, in its native tier). Returns null when
 * no generation has data — a legitimate empty state, distinct from a fetch
 * error (which surfaces via isError). Cached 24h + persisted to IndexedDB.
 */
export function useRecommendedBuild(pokemonName: string) {
  return useQuery<RecommendedBuildResult | null>({
    queryKey: ['recommended-build', pokemonName],
    queryFn: async () => {
      const build = await fetchRecommendedBuild(pokemonName);
      if (!build) return null;
      return {
        gen: build.gen,
        formatId: build.formatId,
        set: adaptSmogonSet(build.sets[0]),
      };
    },
    enabled: !!pokemonName,
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}
