/**
 * Shared lazy loader for @pkmn/dex. The package is heavy, so it's imported on
 * first use and cached — reused by the filter index, the team builder data,
 * and Showdown import/export.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dexPromise: Promise<any> | null = null;

export function getDex() {
  if (!dexPromise) {
    dexPromise = import('@pkmn/dex').then((m) => m.Dex);
  }
  return dexPromise;
}
