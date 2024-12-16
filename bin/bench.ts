import { benchExpression } from "../src/BenchExpression.ts";
import { statements } from "../src/ExpressionGrammar.ts";
import { deeperGrammar } from "../src/ExpressionGrammarDeeper.ts";

const iterations = 10000;
debugger;

const start = performance.now();
for (let i = 0; i < iterations; i++) {
  deeperGrammar.parse(benchExpression);
}
const time = performance.now() - start;

console.log("ms per iteration:", (time/iterations).toFixed(4));