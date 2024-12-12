# A fast PEG executor for javascript

Dear Programmer,

Your task, should you choose to accept it, is to create a fast PEG parser.
(Or determine why that's unwise or impossible!)

I wrote a TypeScript PEG parser combinator library, [mini-parse]
that we're using to parse WGSL. It's relatively slow though.
This repo contains an even smaller combinator library for experimentation,
called micro-parse.

Like mini-parse, micro-parse uses a naiive execution model,
basically an intepreter.
While I'm sure the interpreter could be sped up, a compiler
would surely be faster.
Let's try building a simple code code generator and see
how fast we can make it go.

If PEG can be fast, that'd be useful for us
and useful for the wider open source communinity too. 
Grammar descriptions are much easier to maintain than custom parsers.
The lua folks seem to have done a sort of comipiler to a sort
of tiny state machine called a parsing machine and claim it to be fast,
so there's good evidence that it's possible in principle.

## Simple PEG

A simple Parsing Expression Grammar (PEG) has three kinds of rules:

```ts
// sequence: match sequence of b, c, d
a = b c d

// choice: match a, or f if a doesn't match, or g if f doesn't match
e = a / f / g

// repeat: match e zero or more times
h = e*
```

In [mini-parse] or `micro-parse` parser combinator form that would look like this
in JavaScript or TypeScript:

```ts
const a = seq(b, c, d);
const e = or(a, f, g);
const h = repeat(e);
```

## Basic PEG execution

The basic execution model 


### Compiled to JavaScript

An basic translation might look something like this:

```ts

// ----   element parsers all look the same ----

function b() {  // parse element
  const pos = tokens.pos();
  const token = tokens.next();
  if (token.value) === "bee") return token;

  tokens.setPos(pos);
  return undefined;
} 

function c() {  // parse element
  const pos = tokens.pos();
  const token = tokens.next();
  if (token.value) === "ccc") return token;

  tokens.setPos(pos);
  return null;
} 

function d() {  // parse element
  const pos = tokens.pos();
  const token = tokens.next();
  if (token.value) === "deh") return token;

  tokens.setPos(pos);
  return null;
} 

function f() {  // parse element
  const pos = tokens.pos();
  const token = tokens.next();
  if (token.value) === "fuhf") return token;

  tokens.setPos(pos);
  return null;
} 

function g() {  // parse element
  const pos = tokens.pos();
  const token = tokens.next();
  if (token.value) === "gogo") return token;

  tokens.setPos(pos);
  return null;
} 

// ---- combination parsers ---- 

function a() { // parse sequence
  return b() && c() && d() || null;
}

function e() { // parse choice
  return a() || f() || g() || null; 
}

function h() { // parse repeat
  while (e()) { }
  return true;
}
```

If you were writing this by hand, you'd probably refactor choice operations for speed.
e.g. imagine parsing "gogo". This first version would make a bunch of pos() and next() and setPos() calls.

A more clever translator could notice that parsing "gogo" would unnecessarily repeat many steps.

```ts
function e() {
  const token = 
  
}

```


### Bonus Grammar Features

We'll want to be able capture key parts of the parsed text.

So run a function when the parser 


```wgsl
```


### Parsing backgrounder

For non-trivial parsing, a grammar description is easier to write and maintain
than custom code.
We use regular expressions, or the modern variations of yacc and lex.
There are many classes of grammar description. LALR, LR, GLR, LL, Earley, PEG, etc.
In the JavaScript/TypeScript world,
Lezer is a good LR implementation,
Nearley is a good Earley implementation,
but there's no great PEG implementation AFAIK.

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
where the grammar is defined in the host language (TypeScript/JavaScript) in this case.
Using the host language for grammar definition is nice because the IDE language tools can help
and because it makes integrating with the host language easy.

PEG allows a very broad class of grammar rules,
though potentially at the cost of increased parsing time.
It'd be nice if PEG could be fast for common grammars, even
while supporting 

[mini-parse]: https://github.com/wgsl-tooling-wg/wgsl-linker/blob/main/packages/mini-parse/README.md