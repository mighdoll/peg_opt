import { kind, or, Parser, repeat, seq } from "./Parser.ts";

/* add some extra combinators to the expression grammar
in a crude attempt to make the grammar match the wesl
grammar performance characteristics a bit more.
*/

const ident = or(or(or(or(or(seq(kind("word")))))));
const literal = seq(
  seq(seq(seq(or(seq(or("true", "false", kind("digits")))))))
);
const paren_exp = or(
  or(
    or(
      or(
        or(
          seq(
            "(",
            or(() => expression),
            or(")")
          )
        )
      )
    )
  )
);
const primary_exp = or(
  or(
    or(
      or(
        or(
          or(
            or(
              or(
                or(
                  seq(or(() => call_exp, ident, or(literal), or(or(paren_exp))))
                )
              )
            )
          )
        )
      )
    )
  )
);

const unary_exp: Parser<any> = or(
  or(
    or(
      or(
        or(
          or(
            or(
              or(
                or(
                  or(
                    seq(or("!", "&", "*", "-", "~"), () => unary_exp),
                    primary_exp
                  )
                )
              )
            )
          )
        )
      )
    )
  )
);

const arg_list = seq(
  seq(
    or(
      seq("(", () => expression, repeat(seq(",", () => expression)), ")"),
      seq("(", ")")
    )
  )
);
const call_exp = seq(ident, arg_list);

const relational_exp = repeat(seq(kind("binarySymbol"), unary_exp));
const expression = seq(unary_exp, relational_exp);

export const deeperGrammar = repeat(seq(expression, ";"));
