import { Parser } from "./Parser.ts";

/** log the nested parser structure to the console */
export function printParser(p: Parser<any>): void {
  setFnChildrenDeep(p, new Set());
  printDeep(p, 0, new Set());
}

/** traverse parser graph defined by _children and print all parser debug names */
function printDeep(
  p: Parser<any>,
  indent: number,
  visited: Set<Parser<any>>
): void {
  const pad = " ".repeat(indent);
  if (visited.has(p)) {
    console.log(pad + "->" + p.debugName);
  } else {
    visited.add(p);
    console.log(pad + p.debugName);
    p._children?.forEach((c) => printDeep(c, indent + 2, visited));
  }
}

/** traverse parser graph and mutate all parsers to add fn()-deferred initalized parsers to _children */
function setFnChildrenDeep(p: Parser<any>, visited: Set<Parser<any>>): void {
  if (!visited.has(p)) {
    visited.add(p);
    if (p._fn) {
      const newChild = p._fn();
      p._children = [newChild];
    }
    p._children?.forEach((c) => setFnChildrenDeep(c, visited));
  }
}