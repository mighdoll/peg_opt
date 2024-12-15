import { Lexer, matchingLexer } from "mini-parse";
import { ArgToReturn, ParserArg } from "./ParserTypes.ts";
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
  _children: Parser<any>[] = []; // keep track of children, not needed for interpeter, but probably handy for compiler?
  _fn?: () => Parser<T>; // track deferred initializers, not needed for interpreter, but probably handy for compiler?

  constructor(
    readonly fn: (lexer: Lexer) => T | null,
    readonly debugName = "parser"
  ) {}

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

  return new Parser(parseText, `'${t}'`);
}

/** a Parser that matches tokens of a certain kind (e.g. digits) */
export function kind(tokenKind: string): Parser<string> {
  function parseKind(lexer: Lexer): string | null {
    const token = lexer.next();
    return token?.kind === tokenKind ? token.text : null;
  }

  return new Parser(parseKind, `kind(${tokenKind})`);
}

/**
 * A parser that matches if any of the provided parsers
 * match. The provided parsers are tried in order,
 * and the result from the first match is returned,
 * or null if none of the parsers match.
 */
export function or<P extends ParserArg[]>(...args: P) {
  const parsers = args.map(argToParser);
  function parseOr(lexer: Lexer) {
    for (const p of parsers) {
      const value = p._run(lexer);
      if (value !== null) return value;
    }
    return null;
  }

  const orParser = new Parser(parseOr, "or");
  orParser._children = parsers;
  return orParser;
}

/**
 * A parser that matches if all of the provided parsers
 * match in the order provided.
 * The result is an array of the parsers results, or
 * null if one of them didn't match.
 */
export function seq<P extends ParserArg[]>(...args: P) {
  const parsers = args.map(argToParser);

  /** return an array of parsed results, or null if any fails */
  function parseSeq(lexer: Lexer) {
    const results = [] as any;
    for (const p of parsers) {
      const value = p._run(lexer);
      if (value === null) return null;
      results.push(value);
    }
    return results;
  }

  const seqParser = new Parser(parseSeq, "seq");
  seqParser._children = parsers;
  return seqParser;
}

export function repeat<A extends ParserArg>(arg: A) {
  const parser = argToParser(arg);

  function parseRepeat(lexer: Lexer) {
    const allResults: ArgToReturn<A>[] = [];
    while (true) {
      const result = parser._run(lexer);
      if (result === null) break;
      allResults.push(result);
    }
    return allResults;
  }

  const repeatParser = new Parser(parseRepeat, "repeat");
  repeatParser._children = [parser];
  return repeatParser;
}

/** a parser that returns its arguments */
export function fn<P>(toParser: () => Parser<P>) {
  function parseFn(lexer: Lexer): P | null {
    const parser = toParser();
    return parser._run(lexer);
  }
  const fnParser = new Parser(parseFn, "fn");
  fnParser._fn = toParser;
  return fnParser;
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
export function argToParser<A extends ParserArg>(arg: A) {
  if (typeof arg === "function") {
    return fn(arg) as any;
  } else if (typeof arg === "string") {
    return text(arg) as any;
  } else {
    return arg as any;
  }
}
