# A fast PEG executor for javascript

Dear Programmer,

Your task, should you choose to accept it, is to create a fast PEG parser
by compiling bits of the grammar into JavaScript.

This repo contains a small parser combinator library
for experimenting with performance ideas for PEG parsers.
The library has the same structure as [mini-parse], which
we're using to parse WGSL/WESL.

A grammar in this library is a directed graph of
parsers.
More complicated parsers are built by
combining simpler ones.
Parsing proceeds by traversing through the graph
while parsing.

Likely it'd be a lot faster to analyze the parser graph
and generate some JavaScript, rather than travesing the
graph while parsing.
If PEG can be fast, that'd be useful for us
and useful for the wider open source communinity too.
Grammar descriptions are much easier to maintain than custom parsers!

The [lua folks](https://www.inf.puc-rio.br/~roberto/docs/peg.pdf)
seem to be happy with their PEG compiler.
They compile PEG grammars to a tiny state machine. I
imagine we'd compile to JavaScript.

## Simple PEG

A simple Parsing Expression Grammar (PEG) has three kinds of rules:

```ts
// sequence: match sequence of 'b', 'c', 'd' tokens
a = 'b' 'c' 'd'

// choice: match a, or 'f' if a doesn't match, or 'g' if 'f' doesn't match
e = a / 'f' / 'g'

// repeat: match e zero or more times
h = e*
```

In parser combinator form, the grammar is written
in JavaScript or TypeScript:

```ts
const a = seq('b', 'c', 'd');
const e = or(a, 'f', 'g');
const h = repeat(e);
```

And then you run the parser like this:

```ts
// use the h parser to parse a string
const result = h.parse("f g b c d b c d f g f g");
```

## PEG interpeter

Take a look at [Parser.ts](src/Parser.ts) in this repo.

- Trace through the `text()` parser.
You can see how its execution flows through the `Parser` class
and checks to see if the next token contains the text it's looking for.
- Then look at the `or()` parser.
It doesn't touch tokens directly, but instead
runs a list of provided parsers until it fines a parser that succeeds.
i.e. `or()` _combines_ the provided parsers to make a more complicated parser.
- Note that lexing aka tokenizing (to divide the source into tokens) is handled separately.
A provided lexer produces tokens on demand via `next()`, and supports backtracking by calling `position()`.

So execution proceeds by calling the `_run()` method on various
parsers, which call other parsers, and some of those parsers
call the lexer to consume tokens and/or to backtrack.

With complicated nested parsers
like the [WESL grammar],
a lot of the time goes into parsers calling each other,
which is mostly middle-management overhead.
The real work is in reading the tokens and deciding what to do next.

### Compiling to JavaScript

Instead of having all these parsers talk to each other,
the basic idea is to analyze the graph of parsers and generate
some JavaScript code to do the real work.

For example, consider the parser:

```ts
const p = or(seq('a', 'b'), seq('c', 'd'));
```

#### Interpreter

To `p.parse("c")` the current library would start by executing like this:

```ts
or._run() ..
  seq._run() ..
    text('a')._run() ..
      { const token = lexer.next(); 
        return token === 'a' ? 'a' : null; }
  // seq('a', 'b') fails, so backtrack
  lexer.position(origPosition);
  seq._run() ..
    text('c')._run() ..
      { const token = lexer.next(); 
        return token === 'c' ? 'c' : null;` }
```

That's just part of the execution, and we can already see that there's
a lot of overhead to get to the actual logic.

But with a little cleverness, I think we could automatically refactor this.
Notice that both seq() operations are going to read the same `next()` token.
So a little compiler could generate something that reads the next token
first, and then decides what to do.

#### Compiler

In fact the whole parser `p` could be compiled into something like this:

```ts
const origPosition = lexer.position();

const token = next();
if (token === 'a' && next() === 'b') return success;
else if (token === 'c' && next() === 'd') return success;

lexer.position(origPosition);
return null;
```

The library could generate that JavaScript text for `p` and execute it.

## Profiling

There's a little benchmark script that runs a small grammar on some sample input.
You can see where the time goes in the Chrome profiler.

Launch with:

```sh
pnpm tsx --inspect-brk bin/bench.ts 
```

And then launch the chrome debugger and press the green node button, and press play
to continue execution of the script.
See instructions [here](https://developer.chrome.com/docs/devtools/performance/nodejs).

You can see the overhead show up in the trace.
With the larger [WESL grammar],
an even higher percentage of the time is spent in overhead.

## Parsing backgrounder

For non-trivial parsing, a grammar description is easier to write and maintain
than custom code.
We use regular expressions, or the modern variations of yacc and lex.
There are many classes of grammar description. LALR, LR, GLR, LL, Earley, PEG, etc.
In the JavaScript/TypeScript world,
Lezer is a good LR implementation,
Nearley is a good Earley implementation,
but there's no great PEG implementation as far as I know.

PEG is an interesting grammar class for several reasons.
One reason is that parsing is easy to understand.
It works by recursive descent just like you'd just like you'd probably write parsing code yourself,
`parse_paragraph` calls `parse_sentence` calls `parse_word`, etc.
Most other parsing classes generate hard to understand errors
about 'shift reduce conflict', etc.
The PEG grammar dialect is unambiguous by construction,
in the same way that language constructions like `||` `&&` and function calls
are unambiguous.

PEG also maps very nicely to parser combinators
where the grammar is defined in the host language (TypeScript/JavaScript in this case).
Using the host language for grammar definition is nice because the IDE language tools can help
and because it makes integrating with the host language easy.

PEG allows a very broad class of grammar rules.
It'd be nice if PEG could be fast for common case too.

[mini-parse]: https://github.com/wgsl-tooling-wg/wgsl-linker/blob/main/packages/mini-parse/README.md

[WESL grammar]: https://github.com/wgsl-tooling-wg/wgsl-linker/blob/main/linker/packages/linker/src/WESLGrammar.ts
