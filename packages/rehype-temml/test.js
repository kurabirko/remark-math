import assert from 'node:assert/strict'
import test from 'node:test'
import temml from 'temml'
import rehypeTemml from 'rehype-temml'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'

test('rehype-temml', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('rehype-temml')).sort(), [
      'default'
    ])
  })

  await t.test('should transform math with temml', async function () {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeTemml)
          .use(rehypeStringify)
          .process(
            [
              '<p>Inline math <span class="math-inline">\\alpha</span>.</p>',
              '<p>Block math:</p>',
              '<div class="math-display">\\gamma</div>'
            ].join('\n')
          )
      ),
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeStringify)
          .process(
            [
              '<p>Inline math ' + temml.renderToString('\\alpha') + '.</p>',
              '<p>Block math:</p>',
              temml.renderToString('\\gamma', {displayMode: true})
            ].join('\n')
          )
      )
    )
  })

  await t.test('should support markdown fenced code', async function () {
    assert.deepEqual(
      String(
        await unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeTemml)
          .use(rehypeStringify)
          .process('```math\n\\gamma\n```')
      ),
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeStringify)
          .process(temml.renderToString('\\gamma\n', {displayMode: true}))
      )
    )
  })

  await t.test('should integrate with `remark-math`', async function () {
    assert.deepEqual(
      String(
        await unified()
          .use(remarkParse)
          .use(remarkMath)
          .use(remarkRehype)
          .use(rehypeTemml)
          .use(rehypeStringify)
          .process(
            [
              'Inline math $\\alpha$.',
              '',
              'Block math:',
              '',
              '$$',
              '\\gamma',
              '$$'
            ].join('\n')
          )
      ),
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeStringify)
          .process(
            [
              '<p>Inline math ' + temml.renderToString('\\alpha') + '.</p>',
              '<p>Block math:</p>',
              temml.renderToString('\\gamma', {displayMode: true})
            ].join('\n')
          )
      )
    )
  })

  await t.test(
    'should transform `.math-inline.math-display` math with `displayMode: true`',
    async function () {
      assert.deepEqual(
        String(
          await unified()
            .use(rehypeParse, {fragment: true})
            .use(rehypeTemml)
            .use(rehypeStringify)
            .process(
              '<p>Double math <code class="math-inline math-display">\\alpha</code>.</p>'
            )
        ),
        String(
          await unified()
            .use(rehypeParse, {fragment: true})
            .use(rehypeStringify)
            .process(
              '<p>Double math ' +
                temml.renderToString('\\alpha', {displayMode: true}) +
                '.</p>'
            )
        )
      )
    }
  )

  await t.test('should support `macros`', async function () {
    const macros = {'\\RR': '\\mathbb{R}'}

    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeTemml, {macros})
          .use(rehypeStringify)
          .process('<span class="math-inline">\\RR</span>')
      ),
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeStringify)
          .process(temml.renderToString('\\RR', {macros}))
      )
    )
  })

  await t.test('should support `strict: false`', async function () {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeTemml, {errorColor: 'orange', strict: false})
          .use(rehypeStringify)
          .process('<span class="math-inline">ê&amp;</span>')
      ),
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeStringify)
          .process(
            '<span class="temml-error" style="color:orange" title="ParseError:  Expected \'EOF\', got \'&\' at position 2: ê&̲">ê&amp;</span>'
          )
      )
    )
  })

  await t.test('should support comments', async function () {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeTemml, {errorColor: 'orange', strict: false})
          .use(rehypeStringify)
          .process(
            '<div class="math-display">\\begin{split}\n  f(-2) &= \\sqrt{-2+4} \\\\\n  &= x % Test Comment\n\\end{split}</div>'
          )
      ),
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeStringify)
          .process(
            temml.renderToString(
              '\\begin{split}\n  f(-2) &= \\sqrt{-2+4} \\\\\n  &= x % Test Comment\n\\end{split}',
              {displayMode: true}
            )
          )
      )
    )
  })

  await t.test('should not crash on non-parse errors', async function () {
    assert.deepEqual(
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeTemml)
          .use(rehypeStringify)
          .process(
            '<span class="math-display">\\begin{split}\n\\end{{split}}\n</span>'
          )
      ),
      String(
        await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeStringify)
          .process(
            '<span class="temml-error" style="color:#cc0000" title="Error: Expected node of type textord, but got node of type ordgroup">\\begin{split}\n\\end{{split}}\n</span>'
          )
      )
    )
  })
})
