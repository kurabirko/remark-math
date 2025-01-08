# rehype-temml

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[rehype][]** plugin to render elements with a `language-math` class with
[Temml][].

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`unified().use(rehypeKatex[, options])`](#unifieduserehypetemml-options)
  * [`Options`](#options)
* [Markdown](#markdown)
* [HTML](#html)
* [CSS](#css)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package is a [unified][] ([rehype][]) plugin to render math.
You can add classes to HTML elements, use fenced code in markdown, or combine
with [`remark-math`][remark-math] for a `$C$` syntax extension.

## When should I use this?

This project is useful as it renders math with KaTeX at compile time, which
means that there is no client side JavaScript needed.

A different plugin, [`rehype-katex`][rehype-katex], does the same but with
[KaTeX][]. Similarly, [`rehype-mathjax`][rehype-mathjax] plugin does the same with [MathJax][].

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install rehype-temml
```

In Deno with [`esm.sh`][esmsh]:

```js
import rehypeTemml from 'https://esm.sh/rehype-temml@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import rehypeTemml from 'https://esm.sh/rehype-temml@1?bundle'
</script>
```

## Use

Say our document `input.html` contains:

```html
<p>
  Lift(<code class="language-math">L</code>) can be determined by Lift Coefficient
  (<code class="language-math">C_L</code>) like the following equation.
</p>
<pre><code class="language-math">
  L = \frac{1}{2} \rho v^2 S C_L
</code></pre>
```

…and our module `example.js` contains:

```js
import rehypeDocument from 'rehype-document'
import rehypeTemml from 'rehype-temml'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import {read, write} from 'to-vfile'
import {unified} from 'unified'

const file = await unified()
  .use(rehypeParse, {fragment: true})
  .use(rehypeDocument, {
    // Get the latest one from: <https://github.com/ronkok/Temml/releases>.
    css: 'https://cdn.jsdelivr.net/npm/temml@0.10.32/dist/temml.min.js'
  })
  .use(rehypeTemml)
  .use(rehypeStringify)
  .process(await read('input.html'))

file.basename = 'output.html'
await write(file)
```

…then running `node example.js` creates an `output.html` with:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>input</title>
<meta content="width=device-width, initial-scale=1" name="viewport">
<link href="https://cdn.jsdelivr.net/npm/temml@0.10.32/dist/temml.min.js" rel="stylesheet">
</head>
<body>
<p>
  Lift(<math display="inline"><!--…--></math>) can be determined by Lift Coefficient
  (<math display="inline"><!--…--></math>) like the following equation.
  <math display="block"><!--…--></math>
</p>
</body>
</html>
```

…open `output.html` in a browser to see the rendered math.

## API

This package exports no identifiers.
The default export is [`rehypeTemml`][api-rehype-temml].

### `unified().use(rehypeTemml[, options])`

Render elements with a `language-math` (or `math-display`, `math-inline`)
class with [Temml][].

###### Parameters

* `options` ([`Options`][api-options])
  — configuration

###### Returns

Transform ([`Transformer`][unified-transformer]).

### `Options`

Configuration (TypeScript type).

###### Type

```ts
import { Options as TemmlOptions } from 'temml'

type Options = Omit<TemmlOptions, 'displayMode' | 'throwOnError'>
```

See [*Options* on `temml.org`][temml-options] for more info.

## Markdown

This plugin supports the syntax extension enabled by
[`remark-math`][remark-math].
It also supports math generated by using fenced code:

````markdown
```math
C_L
```
````

## HTML

The content of any element with a `language-math`, `math-inline`, or
`math-display` class is transformed.
The elements are replaced by native MathML Core elements determined by Temml.
Either a `math-display` class or using `<pre><code class="language-math">` will
result in “display” math: math that is a centered block on its own line.

## CSS

While MathML does not require any CSS to be rendered, font support for mathematics can sometimes be problematic. To remedy this, Temml comes with several pre-written CSS files to provide various fonts. See [*Fonts* on `temml.org`][temml-fonts] for more info.

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `rehype-temml@^1`,
compatible with Node.js 16.

This plugin works with unified version 6+ and rehype version 4+.

## Security

Assuming you trust KaTeX, using `rehype-temml` is safe.
A vulnerability in it could open you to a
[cross-site scripting (XSS)][wiki-xss] attack.
Be wary of user input and use [`rehype-sanitize`][rehype-sanitize].

When you don’t trust user content but do trust Temml, run `rehype-temml`
*after* `rehype-sanitize`:

```js
import rehypeTemml from 'rehype-temml'
import rehypeSanitize, {defaultSchema} from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'

const file = await unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      // The `language-*` regex is allowed by default.
      code: [['className', /^language-./, 'math-inline', 'math-display']]
    }
  })
  .use(rehypeTemml)
  .use(rehypeStringify)
  .process('$C$')

console.log(String(file))
```

## Related

* [`rehype-katex`][rehype-katex]
  — same but with KaTeX
* [`rehype-mathjax`][rehype-mathjax]
  — same but with MathJax
* [`rehype-highlight`](https://github.com/rehypejs/rehype-highlight)
  — highlight code blocks
* [`rehype-autolink-headings`](https://github.com/rehypejs/rehype-autolink-headings)
  — add links to headings
* [`rehype-sanitize`](https://github.com/rehypejs/rehype-sanitize)
  — sanitize HTML
* [`rehype-document`](https://github.com/rehypejs/rehype-document)
  — wrap a document around the tree

## Contribute

See [`contributing.md`][contributing] in [`remarkjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Junyoung Choi][author]

<!-- Definitions -->

[build-badge]: https://github.com/remarkjs/remark-math/workflows/main/badge.svg

[build]: https://github.com/remarkjs/remark-math/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark-math.svg

[coverage]: https://codecov.io/github/remarkjs/remark-math

[downloads-badge]: https://img.shields.io/npm/dm/rehype-katex.svg

[downloads]: https://www.npmjs.com/package/rehype-katex

[size-badge]: https://img.shields.io/bundlejs/size/rehype-katex

[size]: https://bundlejs.com/?q=rehype-katex

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/main/contributing.md

[support]: https://github.com/remarkjs/.github/blob/main/support.md

[coc]: https://github.com/remarkjs/.github/blob/main/code-of-conduct.md

[license]: https://github.com/remarkjs/remark-math/blob/main/license

[author]: https://rokt33r.github.io

[katex]: https://github.com/Khan/KaTeX

[temml]: https://temml.org

[temml-options]: https://temml.org/docs/en/administration#options
[temml-fonts]: https://temml.org/docs/en/administration#fonts

[rehype]: https://github.com/rehypejs/rehype

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[unified]: https://github.com/unifiedjs/unified

[unified-transformer]: https://github.com/unifiedjs/unified#transformer

[typescript]: https://www.typescriptlang.org

[wiki-xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[mathjax]: https://www.mathjax.org

[remark-math]: ../remark-math/

[rehype-mathjax]: ../rehype-mathjax/
[rehype-katex]: ../rehype-katex/

[api-options]: #options

[api-rehype-temml]: #unifieduserehypetemml-options