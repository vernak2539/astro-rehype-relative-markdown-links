import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path'
import { rehype } from 'rehype'
import { visit } from 'unist-util-visit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import rehypeAstroRelativeMarkdownLinks from './index.mjs'

function testSetupRehype(options = {}) {
  return (tree, file) => {
    visit(tree, "element", (node) => {
      const fileInHistory = path.resolve(__dirname, __filename)

      if (!file.history.includes(fileInHistory)) {
        file.history.push(fileInHistory)

      }
    })
  }
}

test('rehypeAstroRelativeMarkdownLinks', async (t) => {
  await t.test('should transform valid paths', async () => {
    const input = '<a href="./fixtures/test.md">foo</a>'
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(rehypeAstroRelativeMarkdownLinks, { contentPath: 'src' })
      .process(input)

    const expected = '<html><head></head><body><a href="/fixtures/test">foo</a></body></html>'

    assert.equal(actual, expected)
  })

  await t.test('should transform index.md paths', async () => {
    const input = '<a href="./fixtures/index.md">foo</a>'
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(rehypeAstroRelativeMarkdownLinks, { contentPath: 'src' })
      .process(input)

    const expected = '<html><head></head><body><a href="/fixtures">foo</a></body></html>'

    assert.equal(actual, expected)
  })

  await t.test('should keep query and fragment', async () => {
    const input = '<a href="./fixtures/test.md?q=q#hash">foo</a>'
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(rehypeAstroRelativeMarkdownLinks, { contentPath: 'src' })
      .process(input)

    const expected = '<html><head></head><body><a href="/fixtures/test?q=q#hash">foo</a></body></html>'

    assert.equal(actual, expected)
  })

  await t.test('should not replace path if relative file does not exist', async () => {
    const input = '<a href="./fixtures/does-not-exist.md">foo</a>'
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(rehypeAstroRelativeMarkdownLinks, { contentPath: 'src' })
      .process(input)

    const expected = '<html><head></head><body><a href="./fixtures/does-not-exist.md">foo</a></body></html>'

    assert.equal(actual, expected)
  })
})
