import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { rehype } from "rehype";
import { visit } from "unist-util-visit";
import esmock from "esmock";
import { validateOptions as validateOptionsOriginal } from "./options.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import astroRehypeRelativeMarkdownLinks from "./index.mjs";

/*
  NOTE ON ESMOCK USAGE

  node:test does not provide a stock way of mocking sub-modules.  There is work being done on this (see
  links below) but for now some type of module loader is required.  Esmock (https://github.com/iambumblehead/esmock) 
  seems to address what is needed for our use cases for now although there doesn't seem to be a simple way for a simple spy
  as you need to swap in the original manually.  If/When node:test supports this natively, esmock can be removed.

  ** IMPORTANT ** According to esmock wiki, when using esmock < Node 20.6.0, the `--loader` command line
  argument is needed when running tests.  In my tests while adding esmock, I was successfully able to run
  tests on Node 18.19.1 & 20.11.1 without this flag but I did add it to package.json 'test' script given
  the esmock documentation (see note under install command at https://github.com/iambumblehead/esmock/wiki#install).

  For tracking stock functionality of module mocking with node:test, see:
  - https://github.com/nodejs/help/issues/4298
  - https://github.com/nodejs/node/issues/51164
  - https://github.com/nodejs/node/issues/51164#issuecomment-2034518078
*/

/** @param {Record<string, { currentFilePath?: string }} options */
function testSetupRehype(options = {}) {
  return (tree, file) => {
    visit(tree, "element", () => {
      const fileInHistory = options.currentFilePath
        ? path.resolve(options.currentFilePath)
        : path.resolve(__dirname, __filename);

      if (!file.history.includes(fileInHistory)) {
        file.history.push(fileInHistory);
      }
    });
  };
}

describe("astroRehypeRelativeMarkdownLinks", () => {
  test("should transform file paths that exist", async () => {
    const input = '<a href="./fixtures/content/docs/test.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/docs/test">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform and contain index for root collection index.md file paths that exist", async () => {
    const input = '<a href="./fixtures/content/docs/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/docs/index">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform root collection index.md paths with empty string custom slug", async () => {
    const input =
      '<a href="./fixtures/content/dir-test-custom-slug/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/dir-test-custom-slug/">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform root collection index.md paths with non-empty string custom slug", async () => {
    const input =
      '<a href="./fixtures/content/dir-test-custom-slug-2/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/dir-test-custom-slug-2/myindex">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform non-root collection index.md paths", async () => {
    const input = '<a href="./fixtures/content/docs/dir-test/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/docs/dir-test">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform encoded file paths that exist with capital letters", async () => {
    const input =
      '<a href="./fixtures/content/docs/test%20with%20SPACE.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/docs/test-with-space">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should keep query and fragment for file paths that exist", async () => {
    const input = '<a href="./fixtures/content/docs/test.md?q=q#hash">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/docs/test?q=q#hash">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not replace path if relative file does not exist", async () => {
    const input = '<a href="./fixtures/content/docs/does-not-exist.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/content/docs/does-not-exist.md">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform file paths that exist with non alphanumeric characters", async () => {
    const input =
      '<a href="./fixtures/content/docs/test%20(non-alpha).md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/docs/test-non-alpha">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform with correct path when destination has custom slug", async () => {
    const input =
      '<a href="./fixtures/content/docs/test-custom-slug.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/docs/test.custom.slug-custom">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform with correct path when destination has custom slug with file extension", async () => {
    const input =
      '<a href="./fixtures/content/docs/test-custom-slug-ext.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/docs/test.custom.slug.md">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform with correct path when destination in subpath has custom slug", async () => {
    const input =
      '<a href="./fixtures/content/docs/dir-test-custom-slug.md/test-custom-slug-in-dot-dir.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/docs/dir-test-custom-slug.md/test.custom.slug.in.dot.dir">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not transform content collection path segment", async () => {
    const input =
      '<a href="./fixtures/content/dir-test-with-extension.md/test-1.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/dir-test-with-extension.md/test-1">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not transform index.md file paths if file does not exist", async () => {
    const input =
      '<a href="./fixtures/content/docs/does-not-exist/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/content/docs/does-not-exist/index.md">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not replace path if .md directory exists", async () => {
    const input = '<a href="./fixtures/content/docs/dir-exists.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/content/docs/dir-exists.md">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not replace path if .mdx directory exists", async () => {
    const input = '<a href="./fixtures/content/docs/dir-exists.mdx">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/content/docs/dir-exists.mdx">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not replace path if .md directory does not exist", async () => {
    const input =
      '<a href="./fixtures/content/docs/dir-does-not-exist.md/">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/content/docs/dir-does-not-exist.md/">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not replace path if .mdx directory does not exist", async () => {
    const input =
      '<a href="./fixtures/content/docs/dir-does-not-exist.mdx/">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/content/docs/dir-does-not-exist.mdx/">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not transform non-anchor elements", async () => {
    const input = '<div href="./fixtures/content/docs/test.md">foo</div>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><div href="./fixtures/content/docs/test.md">foo</div></body></html>';

    assert.equal(actual, expected);
  });

  describe("absolute paths", () => {
    test("should not replace absolute path if file exists", async () => {
      const absolutePath = path.resolve("./fixtures/content/docs/test.md");
      const input = `<a href="${absolutePath}">foo</a>`;
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
        .process(input);

      const expected = `<html><head></head><body><a href="${absolutePath}">foo</a></body></html>`;

      assert.equal(actual, expected);
    });

    test("should not replace absolute path if file does not exist", async () => {
      const absolutePath = `${path.dirname(path.resolve("./fixtures/content/docs/test.md"))}/does-not-exist.md`;
      const input = `<a href="${absolutePath}">foo</a>`;
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
        .process(input);

      const expected = `<html><head></head><body><a href="${absolutePath}">foo</a></body></html>`;

      assert.equal(actual, expected);
    });
  });

  describe("config option validation", () => {
    const runValidationTest = async (context, options) => {
      const validateOptionsMock = context.mock.fn(validateOptionsOriginal);
      const astroRehypeRelativeMarkdownLinksMock = await esmock("./index.mjs", {
        "./options.mjs": {
          validateOptions: validateOptionsMock,
        },
      });
      const input = '<a href="./fixtures/content/docs/test.md">foo</a>';
      await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinksMock, options)
        .process(input);

      assert.equal(validateOptionsMock.mock.calls.length, 1);
    };
    test("should validate options when options not provided", async (context) =>
      await runValidationTest(context));
    test("should validate options when options is null", async (context) =>
      await runValidationTest(context, null));
    test("should validate options when options is undefined", async (context) =>
      await runValidationTest(context, undefined));
    test("should validate options when options is empty object", async (context) =>
      await runValidationTest(context, {}));
    test("should validate options when options contains properties", async (context) =>
      await runValidationTest(context, { srcDir: "src/fixtures" }));
  });

  describe("config option - basePath", () => {
    test("should prefix base to output on file paths that exist", async () => {
      const input = '<a href="./fixtures/content/docs/test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          srcDir: "src/fixtures",
          basePath: "/testBase",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/testBase/docs/test">foo</a></body></html>';

      assert.equal(actual, expected);
    });
  });

  describe("config option - collectionBase", () => {
    describe("collectionBase:false", () => {
      test("should transform and contain index for root index.md", async () => {
        const input = '<a href="./fixtures/content/docs/index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: false,
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/index">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should transform root index.md with empty string custom slug", async () => {
        const input =
          '<a href="./fixtures/content/dir-test-custom-slug/index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: false,
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should transform root path", async () => {
        const input = '<a href="./fixtures/content/docs/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: false,
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should transform root path custom slug", async () => {
        const input =
          '<a href="./fixtures/content/docs/test-custom-slug.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: false,
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/test.custom.slug-custom">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should transform subdir index.md", async () => {
        const input =
          '<a href="./fixtures/content/docs/dir-test/index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: false,
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/dir-test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should transform subdir path", async () => {
        const input =
          '<a href="./fixtures/content/docs/dir-test/dir-test-child.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: false,
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/dir-test/dir-test-child">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should transform subdir path custom slug", async () => {
        const input =
          '<a href="./fixtures/content/docs/dir-test-custom-slug.md/test-custom-slug-in-dot-dir.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: false,
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/dir-test-custom-slug.md/test.custom.slug.in.dot.dir">foo</a></body></html>';

        assert.equal(actual, expected);
      });
    });
  });

  describe("config option - collections", async () => {
    describe("collections:base:name", () => {
      test("should apply base when top-level collectionBase is false and collection level is 'name'", async () => {
        const input = '<a href="./fixtures/content/docs/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: false,
            collections: {
              docs: { base: "name" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/docs/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });
    });

    describe("collections:base:false", () => {
      test("should not apply base when top-level collectionBase is name and collection level is false", async () => {
        const input = '<a href="./fixtures/content/docs/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              docs: { base: false },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should not apply base when top-level collectionBase is not specified and collection level is false", async () => {
        const input = '<a href="./fixtures/content/docs/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collections: {
              docs: { base: false },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });
    });

    describe("collections:base:collectionRelative", () => {
      test("should contain relative path in same directory as cwd when top-level collectionBase is name and collection level is collectionRelative", async () => {
        const input =
          '<a href="./fixtures/content/relative-tests/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="fixtures/content/relative-tests/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path in same directory when top-level collectionBase is name and collection level is collectionRelative", async () => {
        const input = '<a href="test2.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/relative-tests/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="test2">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path in same directory when top-level collectionBase is collectionRelative and no collection level override", async () => {
        const input = '<a href="test2.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/relative-tests/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "collectionRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="test2">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path down when top-level collectionBase is name and collection level is collectionRelative", async () => {
        const input = '<a href="./dir-child-3.md/test-me-out.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/relative-tests/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="dir-child-3md/test-me-out">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up and over when top-level collectionBase is name and collection level is collectionRelative", async () => {
        const input = '<a href="../test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/test-me-out.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up, over and down when top-level collectionBase is name and collection level is collectionRelative", async () => {
        const input = '<a href="../dir-child-3.md/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/test-me-out.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../dir-child-3md/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up and back down when link is sibling and top-level collectionBase is name and collection level is collectionRelative", async () => {
        const input = '<a href="./test2.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/dir-grandchild-1/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../../dir-child-1/dir-grandchild-1/test2">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up, down and over when link is first cousin and top-level collectionBase is name and collection level is collectionRelative", async () => {
        const input = '<a href="../dir-grandchild-2/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/dir-grandchild-1/test2.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../../dir-child-1/dir-grandchild-2/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up, over and down based when current has custom slug matching physical collection directory structure and top-level collectionBase is name and collection level is collectionRelative", async () => {
        const input = '<a href="../../dir-child-2/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/dir-grandchild-1/test-custom-slug.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../../dir-child-2/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path down based when current has custom slug pointing to collection root and top-level collectionBase is name and collection level is collectionRelative", async () => {
        const input = '<a href="../../dir-child-2/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/dir-grandchild-1/test-custom-slug-is-collection-root.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="dir-child-2/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up, over and down when custom slug ends with forward slash and collectionBase at collection level is collectionRelative", async () => {
        const input = '<a href="../dir-child-2/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/test-custom-slug-with-forward-slash.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../dir-child-2/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up, over and down without base path when base path specified and top-level collectionBase is name and collection level is collectionRelative", async () => {
        const input = '<a href="../dir-child-3.md/test-me-out.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-2/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            basePath: "/testBase",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "collectionRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../dir-child-3md/test-me-out">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path and index for root collection index.md when collectionBase is collectionRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/docs/index.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "collectionRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="index">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for root collection index.md with empty string custom slug when linked from self and collectionBase is collectionRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/dir-test-custom-slug/index.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "collectionRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="./">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for root collection index.md with empty string custom slug when linked from different page in collection root when collectionBase is collectionRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/dir-test-custom-slug/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "collectionRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="./">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for root collection index.md with empty string custom slug when linked from collection child directory and collectionBase is collectionRelative", async () => {
        const input = '<a href="../index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/dir-test-custom-slug/subdir/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "collectionRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path for root collection index.md paths with non-empty string custom slug when collectionBase is collectionRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/dir-test-custom-slug-2/index.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "collectionRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="myindex">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for collection child directory index.md paths when linked from same directory and collectionBase is collectionRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/docs/dir-test/index.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "collectionRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../dir-test/">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for collection child directory index.md when linked from parent directory and collectionBase is collectionRelative", async () => {
        const input = '<a href="./dir-test/index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/docs/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "collectionRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="dir-test/">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for collection grandchild directory index.md paths when linked from same directory and collectionBase is collectionRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/docs/dir-test/dir-test-child/index.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "collectionRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../../dir-test/dir-test-child/">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for collection grandchild directory index.md when linked from parent directory and collectionBase is collectionRelative", async () => {
        const input = '<a href="./dir-test/dir-test-child/index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/docs/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "collectionRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="dir-test/dir-test-child/">foo</a></body></html>';

        assert.equal(actual, expected);
      });
    });

    describe("collections:base:pathRelative", () => {
      test("should contain relative path in same directory as cwd when top-level collectionBase is name and collection level is pathRelative", async () => {
        const input =
          '<a href="./fixtures/content/relative-tests/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="fixtures/content/relative-tests/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path in same directory when top-level collectionBase is name and collection level is pathRelative", async () => {
        const input = '<a href="test2.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/relative-tests/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="test2">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path in same directory when top-level collectionBase is pathRelative and no collection level override", async () => {
        const input = '<a href="test2.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/relative-tests/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "pathRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="test2">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path down when top-level collectionBase is name and collection level is pathRelative", async () => {
        const input = '<a href="./dir-child-3.md/test-me-out.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/relative-tests/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="dir-child-3md/test-me-out">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up and over when top-level collectionBase is name and collection level is pathRelative", async () => {
        const input = '<a href="../test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/test-me-out.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up, over and down when top-level collectionBase is name and collection level is pathRelative", async () => {
        const input = '<a href="../dir-child-3.md/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/test-me-out.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../dir-child-3md/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path in same directory when link is sibling and top-level collectionBase is name and collection level is pathRelative", async () => {
        const input = '<a href="./test2.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/dir-grandchild-1/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="test2">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up and over when link is first cousin and top-level collectionBase is name and collection level is pathRelative", async () => {
        const input = '<a href="../dir-grandchild-2/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/dir-grandchild-1/test2.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../dir-grandchild-2/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up, over and down based when current has custom slug matching physical collection directory structure and top-level collectionBase is name and collection level is pathRelative", async () => {
        const input = '<a href="../../dir-child-2/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/dir-grandchild-1/test-custom-slug.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../../dir-child-2/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path down based when current has custom slug pointing to collection root and top-level collectionBase is name and collection level is pathRelative", async () => {
        const input = '<a href="../../dir-child-2/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/dir-grandchild-1/test-custom-slug-is-collection-root.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="dir-child-2/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up, over and down when custom slug ends with forward slash and collectionBase at collection level is pathRelative", async () => {
        const input = '<a href="../dir-child-2/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-1/test-custom-slug-with-forward-slash.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../dir-child-2/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path up, over and down without base path when base path specified and top-level collectionBase is name and collection level is pathRelative", async () => {
        const input = '<a href="../dir-child-3.md/test-me-out.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/relative-tests/dir-child-2/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            basePath: "/testBase",
            collectionBase: "name",
            collections: {
              "relative-tests": { base: "pathRelative" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../dir-child-3md/test-me-out">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path and index for root collection index.md when collectionBase is pathRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/docs/index.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "pathRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="index">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for root collection index.md with empty string custom slug when linked from self and collectionBase is pathRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/dir-test-custom-slug/index.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "pathRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="./">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for root collection index.md with empty string custom slug when linked from different page in collection root when collectionBase is pathRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/dir-test-custom-slug/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "pathRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="./">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for root collection index.md with empty string custom slug when linked from collection child directory and collectionBase is pathRelative", async () => {
        const input = '<a href="../index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/dir-test-custom-slug/subdir/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "pathRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="../">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path for root collection index.md paths with non-empty string custom slug when collectionBase is pathRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/dir-test-custom-slug-2/index.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "pathRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="myindex">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for collection child directory index.md paths when linked from same directory and collectionBase is pathRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/docs/dir-test/index.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "pathRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="./">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for collection child directory index.md when linked from parent directory and collectionBase is pathRelative", async () => {
        const input = '<a href="./dir-test/index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/docs/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "pathRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="dir-test/">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for collection grandchild directory index.md paths when linked from same directory and collectionBase is pathRelative", async () => {
        const input = '<a href="./index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath:
              "./src/fixtures/content/docs/dir-test/dir-test-child/index.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "pathRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="./">foo</a></body></html>';

        assert.equal(actual, expected);
      });

      test("should contain relative path ending with forward slash for collection grandchild directory index.md when linked from parent directory and collectionBase is pathRelative", async () => {
        const input = '<a href="./dir-test/dir-test-child/index.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype, {
            currentFilePath: "./src/fixtures/content/docs/test.md",
          })
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collectionBase: "pathRelative",
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="dir-test/dir-test-child/">foo</a></body></html>';

        assert.equal(actual, expected);
      });
    });

    describe("collections:name", async () => {
      test("should contain name from override when name override specified", async () => {
        const input = '<a href="./fixtures/content/docs/test.md">foo</a>';
        const { value: actual } = await rehype()
          .use(testSetupRehype)
          .use(astroRehypeRelativeMarkdownLinks, {
            srcDir: "src/fixtures",
            collections: {
              docs: { name: "my-docs" },
            },
          })
          .process(input);

        const expected =
          '<html><head></head><body><a href="/my-docs/test">foo</a></body></html>';

        assert.equal(actual, expected);
      });
    });
  });

  describe("config option - trailingSlash", () => {
    test("should contain trailing slash when option not specified and file contains", async () => {
      const input = '<a href="./fixtures/content/docs/test.md/">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/docs/test/">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should not contain trailing slash when option not specified and file does not contain", async () => {
      const input = '<a href="./fixtures/content/docs/test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/docs/test">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should contain trailing slash when option not specified and file does not contain and custom slug contains", async () => {
      const input =
        '<a href="./fixtures/content/dir-test-custom-slug/with-trailing-slash.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/dir-test-custom-slug/slug-with-trailing-slash/">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should not contain trailing slash when option not specified and file contains and custom slug does not contain", async () => {
      const input =
        '<a href="./fixtures/content/dir-test-custom-slug/without-trailing-slash.md/">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/dir-test-custom-slug/slug-without-trailing-slash">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should contain trailing slash when option not specified and file contains and custom slug contains", async () => {
      const input =
        '<a href="./fixtures/content/dir-test-custom-slug/with-trailing-slash.md/">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/dir-test-custom-slug/slug-with-trailing-slash/">foo</a></body></html>';

      assert.equal(actual, expected);
    });
  });

  describe("excluded files", () => {
    test("should not transform markdown file that exists that begins with underscore", async () => {
      const input = '<a href="./fixtures/content/docs/_test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="./fixtures/content/docs/_test.md">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should not transform markdown file that exists with underscore in a directory path segment", async () => {
      const input =
        '<a href="./fixtures/content/_dir-test/content/collection-dir-1/test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { srcDir: "src/fixtures" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="./fixtures/content/_dir-test/content/collection-dir-1/test.md">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should transform markdown file that exists with underscore in a directory path above the content dir but not below it", async () => {
      const input =
        '<a href="./fixtures/content/_dir-test/content/collection-dir-1/test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          srcDir: "src/fixtures/content/_dir-test",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/collection-dir-1/test">foo</a></body></html>';

      assert.equal(actual, expected);
    });
  });
});
