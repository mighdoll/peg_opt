import { Parser } from "./Parser.ts";

/* some TypeScript tricks to give seq and or nicer types. */

/**
 * This takes an type P like [Parser<string>, Parser<number>]
 * and sucks out the type arguments to return the type [string, number].
 */
export type SeqValues<P extends Parser<any>[]> = {
  [key in keyof P]: ParserType<P[key]>;
};

// prettier-ignore
/**
 * This takes a type Parser<T> and returns the type T.
 */
export type ParserType<A extends Parser<any>> = 
  A extends Parser<infer R> ? R
  : never;
