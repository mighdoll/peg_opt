import { matchOneOf, tokenMatcher } from "mini-parse";

const binarySymbolSet = 
  '& | ^ << <= < != == % * / + - && || >> >= >'

const otherSymbolSet =
  "-> @ ! [ ] { } :: : , = >>= --" +
  " . ++ | ( ) ; ~ ^ // /* */ += -= *= /= %= &= |= ^=" +
  " _";
const otherSymbol = matchOneOf(otherSymbolSet);
const binarySymbol = matchOneOf(binarySymbolSet);

/** tokens for a simple lexer */
export const tokens = tokenMatcher({
  binarySymbol,
  otherSymbol,
  digits: /\d+/,
  word: /\w+/,
  ws: /\s+/,
});

/*
  The Lexer (created with matchingLexer()) gives the parser tokens 
  one at a time, and can backtrack.
  The Lexer has the following functions:
  . next() - returns the next token (one or more characters from the src string)
  . position() - returns the current character position in the src string
  . position(pos) - sets the lexer position 
 */