import { Lexer, matchingLexer, tokenMatcher } from "mini-parse";
import { SeqValues, ParserType } from "./ParserTypes.ts";

/** token for a simple lexer that matches words and whitespace */
const tokens = tokenMatcher({ word: /\w+/, ws: /\s+/ });

/*
  A Lexer has two the followoing functions:
  . next() - returns the next token (one or more characters from the src string)
  . position() - returns the current character position in the src string
  . position(pos) - sets the lexer position 
 */

export class Parser<T> {
  constructor(readonly fn: (lexer: Lexer) => T | null) {}

  /** parse a source string */
  parse(src: string): T | null {
    const lexer = matchingLexer(src, tokens);
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

/**
 * A parser that matches if any of the provided parsers
 * match. The provided parsers are tried in order,
 * and the result from the first match is returned,
 * or null if none of the parsers match.
 */
export function or<P extends Parser<any>[]>(
  ...parsers: P
): Parser<ParserType<P[number]> | null> {
  /** return the first matching parser's result, else null */
  function parseOr(lexer: Lexer) {
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
export function seq<P extends Parser<any>[]>(
  ...parsers: P
): Parser<SeqValues<P> | null> {
  /** return an array of parsed results, or null if any fails */
  function parseSeq(lexer: Lexer): SeqValues<P> | null {
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
