import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { rehype } from "rehype";
import { visit } from "unist-util-visit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import astroRehypeRelativeMarkdownLinks from "./index.mjs";

function testSetupRehype(options = {}) {
  return (tree, file) => {
    visit(tree, "element", (node) => {
      const fileInHistory = path.resolve(__dirname, __filename);

      if (!file.history.includes(fileInHistory)) {
        file.history.push(fileInHistory);
      }
    });
  };
}

test("astroRehypeRelativeMarkdownLinks", async (t) => {
  await t.test("should transform valid paths", async () => {
    const input = '<a href="./fixtures/test.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/test">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  await t.test("should transform index.md paths", async () => {
    const input = '<a href="./fixtures/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  await t.test(
    "should transform encoded paths with capital letters",
    async () => {
      const input = '<a href="./fixtures/test%20with%20SPACE.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/test-with-space">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );

  await t.test("should keep query and fragment", async () => {
    const input = '<a href="./fixtures/test.md?q=q#hash">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/test?q=q#hash">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  await t.test("should prefix base to output", async () => {
    const input = '<a href="./fixtures/test.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, {
        contentPath: "src",
        basePath: "/testBase",
      })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/testBase/fixtures/test">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  await t.test(
    "should not replace path if relative file does not exist",
    async () => {
      const input = '<a href="./fixtures/does-not-exist.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="./fixtures/does-not-exist.md">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );

  await t.test(
    "should transform paths with non alphanumeric characters",
    async () => {
      const input = '<a href="./fixtures/test%20(non-alpha).md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/test-non-alpha">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );

  await t.test(
    "should transform with correct path when destination has custom slug",
    async () => {
      const input = '<a href="./fixtures/test-custom-slug.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/test.custom.slug">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );
  
  await t.test(
    "should transform with correct path when destination in subpath has custom slug",
    async () => {
      const input = '<a href="./fixtures/dir-test-custom-slug/test-custom-slug-in-dot-dir.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/dir.test.custom.slug/test.custom.slug">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );   
});
