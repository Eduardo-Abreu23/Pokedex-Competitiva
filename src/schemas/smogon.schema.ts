import { z } from 'zod';

/**
 * Schema for the runtime shape returned by `@pkmn/smogon`'s `sets()`.
 * Built against probed real responses + the library's `Moveset` type definition:
 * scalar fields may also arrive as arrays (slashed alternatives), and several
 * fields are optional. We `.passthrough()` so future fields don't break parsing.
 */

const statsTableSchema = z
  .object({
    hp: z.number().optional(),
    atk: z.number().optional(),
    def: z.number().optional(),
    spa: z.number().optional(),
    spd: z.number().optional(),
    spe: z.number().optional(),
  })
  .partial();

const stringOrArray = z.union([z.string(), z.array(z.string())]);
const statsOrArray = z.union([statsTableSchema, z.array(statsTableSchema)]);

export const smogonSetSchema = z
  .object({
    name: z.string(),
    species: z.string().optional(),
    moves: z.array(z.union([z.string(), z.array(z.string())])),
    ability: stringOrArray.optional(),
    item: stringOrArray.optional(),
    nature: stringOrArray.optional(),
    evs: statsOrArray.optional(),
    ivs: statsOrArray.optional(),
    level: z.union([z.number(), z.array(z.number())]).optional(),
    gigantamax: z.boolean().optional(),
    // Runtime uses singular `teraType` (string); type def uses plural `teratypes` (array).
    // Accept both so we never miss the data.
    teraType: stringOrArray.optional(),
    teratypes: z.array(z.string()).optional(),
  })
  .passthrough();

export const smogonSetsSchema = z.array(smogonSetSchema);

export type RawSmogonSet = z.infer<typeof smogonSetSchema>;
export type RawStatsTable = z.infer<typeof statsTableSchema>;
