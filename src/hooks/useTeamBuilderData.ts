import { useQuery } from '@tanstack/react-query';
import { loadTeamBuilderData } from '../services/teamData';

/**
 * Loads team-builder dropdown data (natures, item names, move names) from
 * @pkmn/dex. Lazy — only runs on the team editor page. Cached for the session.
 */
export function useTeamBuilderData() {
  return useQuery({
    queryKey: ['team-builder-data'],
    queryFn: loadTeamBuilderData,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
