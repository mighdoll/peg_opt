import { kind, or, repeat, seq } from "./Parser.ts";

/** a grammar to parse statements containing expressions like 
 * a > 7 || b < 4; */

const ident = seq(kind("word"));
const literal = or("true", "false", kind("digits"));
const paren_exp = seq("(", () => expression, or(")"));
const primary_exp = seq(or(ident, literal, () => call_exp, paren_exp));
const unary_exp = or(
  seq(or("!", "&", "*", "-", "~"), () => unary_exp),
  primary_exp
);

const arg_list = seq("(", () => expression, or(")"));
const call_exp = seq(kind("word"), arg_list);

const relational_exp = repeat(seq(kind("binarySymbol"), unary_exp));
const expression = seq(unary_exp, relational_exp);

export const statements = repeat(seq(expression, ";"));