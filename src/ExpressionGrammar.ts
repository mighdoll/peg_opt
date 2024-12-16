import { kind, or, Parser, repeat, seq } from "./Parser.ts";

/** a grammar to parse statements containing expressions like
 * a > 7 || b < 4;
 * a(b + 4, 9) && true;
 * */

const ident = seq(kind("word"));
const literal = or("true", "false", kind("digits"));
const paren_exp = seq("(", () => expression, ")");
const primary_exp = seq(or(() => call_exp, ident, literal, paren_exp));
const unary_exp: Parser<any> = or(
  seq(or("!", "&", "*", "-", "~"), () => unary_exp),
  primary_exp
);

const arg_list = or(
  seq("(", () => expression, repeat(seq(",", () => expression)), ")"),
  seq("(", ")")
);
const call_exp = seq(ident, arg_list);

const relational_exp = repeat(seq(kind("binarySymbol"), unary_exp));
const expression = seq(unary_exp, relational_exp);

export const statements = repeat(seq(expression, ";"));
