import { useQuery } from '@tanstack/react-query';
import { loadTeamBuilderData } from '../services/teamData';

/**
 * Loads team-builder dropdown data (natures, items) from @pkmn/dex. Lazy —
 * only runs on the team editor page. Cached for the session.
 *
 * The key carries a shape version: this query is persisted to IndexedDB with
 * staleTime Infinity, so when the returned shape changes the version must be
 * bumped, otherwise the stale-shape cache is served forever and never refetched.
 */
const SHAPE_VERSION = 2; // 1 → { natures, itemNames, moveNames }; 2 → { natures, items }

export function useTeamBuilderData() {
  return useQuery({
    queryKey: ['team-builder-data', SHAPE_VERSION],
    queryFn: loadTeamBuilderData,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
