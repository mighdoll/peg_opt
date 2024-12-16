import { bench, expect, test } from "vitest";
import { statements } from "../ExpressionGrammar.ts";
import { benchExpression } from "../BenchExpression.ts";
import { deeperGrammar } from "../ExpressionGrammarDeeper.ts";


bench("parse a long expression", () => {
  deeperGrammar.parse(benchExpression);
});

