import { matchOneOf, tokenMatcher } from "mini-parse";
const symbolSet =
  "& && -> @ / ! [ ] { } :: : , == = != >>= >> >= > <<= << <= < % - --" +
  " . + ++ | || ( ) ; * ~ ^ // /* */ += -= *= /= %= &= |= ^=" +
  " _";
const symbol = matchOneOf(symbolSet);

/** tokens for a simple lexer */
export const tokens = tokenMatcher({
  symbol,
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
