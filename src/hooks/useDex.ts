import { useState, useEffect } from 'react';
import { getDex } from '../services/dex';

/**
 * Loads the @pkmn/dex object into component state for synchronous analysis use.
 * Not stored in React Query — the Dex is large and non-serializable, so it must
 * not be persisted to IndexedDB. Returns null until loaded.
 */
export function useDex() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dex, setDex] = useState<any>(null);

  useEffect(() => {
    let active = true;
    getDex().then((d) => {
      if (active) setDex(d);
    });
    return () => {
      active = false;
    };
  }, []);

  return dex;
}
