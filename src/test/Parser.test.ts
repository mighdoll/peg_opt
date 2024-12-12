import { expect, test } from "vitest";
import { or, seq, text } from "../Parser.ts";

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
