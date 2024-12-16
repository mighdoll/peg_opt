import { expect, test } from "vitest";
import { statements } from "../ExpressionGrammar.ts";
import { or, repeat, seq, text } from "../Parser.ts";
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
  const result = statements.parse("a > 7 || b < 4;");
  console.log(JSON.stringify(result, null, 3));
  expect(result).toBeDefined();
});
