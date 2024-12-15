import { Lexer, matchingLexer } from "mini-parse";
import {
  ArgToParser,
  ParserArg,
  ParserType,
  SeqValues,
} from "./ParserTypes.ts";
import { tokens } from "./SimpleLexer.ts";

/*
    A basic parser combinator library. 
    . Parsers parse strings into values.
    . Parsers can be built on other parsers (that's the combinator part).

    As written here, parsers are self executing, you call Parser with a string
    and the Parser internally calls _run() to produce a value. 

    Some parsers will call other Parser instances in their _run() methods,
    enabling grammar authors ot build complicated parsers by combining
    simple ones with or(), seq() and repeat().
 */

/** A parser combinator. */
export class Parser<T> {
  constructor(readonly fn: (lexer: Lexer) => T | null) {}

  /** parse a source string */
  parse(src: string): T | null {
    const lexer: Lexer = matchingLexer(src, tokens);
    return this.fn(lexer);
  }

  /** run the parser, backtrack the lexer if it fails */
  _run(lexer: Lexer): T | null {
    const start = lexer.position();
    const result = this.fn(lexer);
    if (result === null) {
      lexer.position(start); // backtrack on failure
    }
    return result;
  }
}

/** a parser that matches a text string */
export function text(t: string): Parser<string> {
  /** return the text if it matches */
  function parseText(lexer: Lexer): string | null {
    return lexer.next()?.text === t ? t : null;
  }

  return new Parser(parseText);
}

/** a Parser that matches tokens of a certain kind (e.g. digits) */
export function kind(tokenKind: string): Parser<string> {
  function parseKind(lexer: Lexer): string | null {
    const token = lexer.next();
    return token?.kind === tokenKind ? token.text : null;
  }

  return new Parser(parseKind);
}

/**
 * A parser that matches if any of the provided parsers
 * match. The provided parsers are tried in order,
 * and the result from the first match is returned,
 * or null if none of the parsers match.
 */
export function or<P extends ParserArg[]>(
  ...args: P
): Parser<ParserType<ArgToParser<P[number]>> | null> {
  function parseOr(lexer: Lexer) {
    const parsers = args.map(argToParser);
    for (const p of parsers) {
      const value = p._run(lexer);
      if (value !== null) return value;
    }
    return null;
  }

  return new Parser(parseOr);
}

/**
 * A parser that matches if all of the provided parsers
 * match in the order provided.
 * The result is an array of the parsers results, or
 * null if one of them didn't match.
 */
export function seq<P extends ParserArg[]>(...args: P): Parser<SeqValues<P>> {
  /** return an array of parsed results, or null if any fails */
  function parseSeq(lexer: Lexer): SeqValues<P> | null {
    const parsers = args.map(argToParser);
    const results = [] as any;
    for (const p of parsers) {
      const value = p._run(lexer);
      if (value === null) return null;
      results.push(value);
    }
    return results;
  }

  return new Parser(parseSeq);
}

/** a parser that returns its arguments */
export function fn<P>(toParser: () => Parser<P>) {
  function parseFn(lexer: Lexer): P | null {
    const parser = toParser();
    return parser._run(lexer);
  }
  return new Parser(parseFn);
}

/**
 * Convert a parser argument to a parser
 * . A parser argument is passed through unchanged.
 * . A string argument is converted to a text() parser,
 * . A function arguments are converted to fn() parsers.
 *
 * (this is just for convenience so grammar authors don't have to write out
 *  text() and fn() all the time.)
 */
export function argToParser(arg: ParserArg): ArgToParser<typeof arg> {
  if (typeof arg === "function") {
    return fn(arg);
  } else if (typeof arg === "string") {
    return text(arg);
  } else {
    return arg;
  }
}
