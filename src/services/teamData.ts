import { getDex } from './dex';

export interface NatureOption {
  name: string;
  plus?: string;
  minus?: string;
}

export interface ItemOption {
  name: string;
  /** Species that exclusively use this item (Mega Stones, Light Ball…); null = universal. */
  itemUser: string[] | null;
}

export interface TeamBuilderData {
  natures: NatureOption[];
  items: ItemOption[];
}

export interface ResolvedSpecies {
  species: string; // canonical Showdown name
  num: number;
  abilityOptions: string[];
}

/** Loads the dropdown data for the team builder (natures, items, moves). */
export async function loadTeamBuilderData(): Promise<TeamBuilderData> {
  const Dex = await getDex();
  return {
    natures: Dex.natures
      .all()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((n: any) => ({ name: n.name, plus: n.plus, minus: n.minus }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.name.localeCompare(b.name)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemNames: Dex.items.all().map((i: any) => i.name).sort(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    moveNames: Dex.moves.all().map((m: any) => m.name).sort(),
  };
}

/** Resolves a PokéAPI-style name to its Showdown species, dex number and abilities. */
export async function resolveSpeciesForTeam(
  pokeApiName: string,
  fallbackNum: number,
): Promise<ResolvedSpecies> {
  const Dex = await getDex();
  const sp = Dex.species.get(pokeApiName);
  return {
    species: sp?.name ?? pokeApiName,
    num: sp?.num ?? fallbackNum,
    abilityOptions: sp?.abilities ? Object.values(sp.abilities).filter(Boolean) as string[] : [],
  };
}
