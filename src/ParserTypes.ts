import { Parser } from "./Parser.ts";

/* some tricksy TypeScript to give seq() and or() nicer types.
 * (got a little carried away here with the typing,
 *  it's not at all necessary for functionality)
 */

/**
 * This takes an type P like [Parser<string>, Parser<number>]
 * and sucks out the type arguments to return the type [string, number].
 */
export type SeqValues<P extends ParserArg[]> = {
  [key in keyof P]: ArgToReturn<P[key]>;
};

// prettier-ignore
/**
 * This takes a type Parser<T> and returns the type T.
 */
export type ParserReturns<A extends Parser<any>> = 
  A extends Parser<infer R> ? R
  : never;

/** Allow convenient shortcut arguments for text() and fn() parsers
 * where a Parser is expected.
 */
export type ParserArg = Parser<any> | string | (() => Parser<any>);

/** Parser type from a ParserArg */
export type ArgToParser<P> = P extends Parser<P>
  ? P
  : P extends string
  ? Parser<string>
  : P extends () => Parser<infer R>
  ? Parser<R>
  : never;

/** Parser return type from a ParserArg */
export type ArgToReturn<P> = P extends Parser<infer R>
  ? R
  : P extends string
  ? string
  : P extends () => Parser<infer R>
  ? R
  : never;
