import { expect, test } from "vitest";
import { kind, or, repeat, seq, text } from "../Parser.ts";
import { printParser } from "../PrintParser.ts";

test("text parser", () => {
  const a = text("a");
  const result = a.parse("a");

  expect(result).toBe("a");
});

test("seq parser", () => {
  const s = seq(text("a"), text("b"));
  const result = s.parse("a b");

  expect(result).toEqual(["a", "b"]);
});

test("or parser", () => {
  const s = or(text("a"), text("b"));
  const result = s.parse("b");

  expect(result).toEqual("b");
});

test("repeat ", () => {
  const s = repeat("a");
  const result = s.parse("a a");
  expect(result).toEqual(["a", "a"]);
});

test("pretty", () => {
  const s = or(seq("a", "b"), seq("1", "2", "3"));
  const pretty = printParser(s);
  expect(pretty).toMatchInlineSnapshot(`
    "or
      seq
        'a'
        'b'
      seq
        '1'
        '2'
        '3'"
  `);
});

test("expression parser", () => {
  const literal = or("true", "false", kind("digits"));
  const paren_exp = seq("(", () => expression, or(")"));
  const primary_exp = seq(or(literal, paren_exp));
  const unary_exp = or(
    seq(or("!", "&", "*", "-", "~"), () => unary_exp),
    primary_exp
  );

  const arg_list = seq("(", () => expression, or(")"));
  const call_exp = seq(kind("word"), arg_list);
  const ident = seq(kind("word"));

  const expression = or(unary_exp, primary_exp, call_exp, ident);
  const statements = repeat(seq(expression, ";"));

  const result = statements.parse("a; b;");
  console.log(result);
  expect(result).toBeDefined();
});
