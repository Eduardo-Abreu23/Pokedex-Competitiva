import { QueryClient } from '@tanstack/react-query';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { get, set, del } from 'idb-keyval';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,     // 24h — dados de pokemon não mudam
      gcTime:    1000 * 60 * 60 * 24 * 7,  // 7d em memória
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const IDB_KEY = 'pokemon-query-cache';

export const idbPersister: Persister = {
  persistClient: (client: PersistedClient) => set(IDB_KEY, client),
  restoreClient: () => get<PersistedClient>(IDB_KEY),
  removeClient: () => del(IDB_KEY),
};
