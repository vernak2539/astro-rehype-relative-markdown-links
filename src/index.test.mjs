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

describe("astroRehypeRelativeMarkdownLinks", () => {
  test("should transform file paths that exist", async () => {
    const input = '<a href="./fixtures/test.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/test">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform and contain index for root collection index.md file paths that exist", async () => {
    const input = '<a href="./fixtures/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/index">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform root collection index.md paths with empty string custom slug", async () => {
    const input = '<a href="./fixtures/dir-test-custom-slug/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/dir-test-custom-slug/">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform root collection index.md paths with non-empty string custom slug", async () => {
    const input =
      '<a href="./fixtures/dir-test-custom-slug-2/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/dir-test-custom-slug-2/myindex">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform non-root collection index.md paths", async () => {
    const input = '<a href="./fixtures/dir-test/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/dir-test">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform encoded file paths that exist with capital letters", async () => {
    const input = '<a href="./fixtures/test%20with%20SPACE.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/test-with-space">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should keep query and fragment for file paths that exist", async () => {
    const input = '<a href="./fixtures/test.md?q=q#hash">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/test?q=q#hash">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not replace path if relative file does not exist", async () => {
    const input = '<a href="./fixtures/does-not-exist.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/does-not-exist.md">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform file paths that exist with non alphanumeric characters", async () => {
    const input = '<a href="./fixtures/test%20(non-alpha).md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/test-non-alpha">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform with correct path when destination has custom slug", async () => {
    const input = '<a href="./fixtures/test-custom-slug.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/test.custom.slug-custom">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform with correct path when destination has custom slug with file extension", async () => {
    const input = '<a href="./fixtures/test-custom-slug-ext.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/test.custom.slug.md">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should transform with correct path when destination in subpath has custom slug", async () => {
    const input =
      '<a href="./fixtures/dir-test-custom-slug.md/test-custom-slug-in-dot-dir.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/dir-test-custom-slug.md/test.custom.slug.in.dot.dir">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not transform content collection path segment", async () => {
    const input =
      '<a href="./fixtures/dir-test-with-extension.md/test-1.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src/fixtures" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/dir-test-with-extension.md/test-1">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not transform index.md file paths if file does not exist", async () => {
    const input = '<a href="./fixtures/does-not-exist/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/does-not-exist/index.md">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not replace path if .md directory exists", async () => {
    const input = '<a href="./fixtures/dir-exists.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/dir-exists.md">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not replace path if .mdx directory exists", async () => {
    const input = '<a href="./fixtures/dir-exists.mdx">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/dir-exists.mdx">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not replace path if .md directory does not exist", async () => {
    const input = '<a href="./fixtures/dir-does-not-exist.md/">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/dir-does-not-exist.md/">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not replace path if .mdx directory does not exist", async () => {
    const input = '<a href="./fixtures/dir-does-not-exist.mdx/">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/dir-does-not-exist.mdx/">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  test("should not transform non-anchor elements", async () => {
    const input = '<div href="./fixtures/test.md">foo</div>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><div href="./fixtures/test.md">foo</div></body></html>';

    assert.equal(actual, expected);
  });

  describe("absolute paths", () => {
    test("should not replace absolute path if file exists", async () => {
      const absolutePath = path.resolve("./fixtures/test.md");
      const input = `<a href="${absolutePath}">foo</a>`;
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected = `<html><head></head><body><a href="${absolutePath}">foo</a></body></html>`;

      assert.equal(actual, expected);
    });

    test("should not replace absolute path if file does not exist", async () => {
      const absolutePath = `${path.dirname(path.resolve("./fixtures/test.md"))}/does-not-exist.md`;
      const input = `<a href="${absolutePath}">foo</a>`;
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
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
      const input = '<a href="./fixtures/test.md">foo</a>';
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
      await runValidationTest(context, { contentPath: "src" }));
  });

  describe("config option - basePath", () => {
    test("should prefix base to output on file paths that exist", async () => {
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
  });

  describe("config option - collectionPathMode:root", () => {
    test("should transform and contain index for root index.md when content path same as collection path", async () => {
      const input = '<a href="./fixtures/index.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          contentPath: "src/fixtures",
          collectionPathMode: "root",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/index">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should transform root index.md with empty string custom slug when content path same as collection path", async () => {
      const input =
        '<a href="./fixtures/dir-test-custom-slug/index.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          contentPath: "src/fixtures/dir-test-custom-slug",
          collectionPathMode: "root",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should transform root path when content path same as collection path", async () => {
      const input = '<a href="./fixtures/test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          contentPath: "src/fixtures",
          collectionPathMode: "root",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/test">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should transform root path custom slug when content path same as collection path", async () => {
      const input = '<a href="./fixtures/test-custom-slug.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          contentPath: "src/fixtures",
          collectionPathMode: "root",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/test.custom.slug-custom">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should transform subdir index.md when content path same as collection path", async () => {
      const input = '<a href="./fixtures/dir-test/index.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          contentPath: "src/fixtures",
          collectionPathMode: "root",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/dir-test">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should transform subdir path when content path same as collection path", async () => {
      const input = '<a href="./fixtures/dir-test/dir-test-child.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          contentPath: "src/fixtures",
          collectionPathMode: "root",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/dir-test/dir-test-child">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should transform subdir path custom slug when content path same as collection path", async () => {
      const input =
        '<a href="./fixtures/dir-test-custom-slug.md/test-custom-slug-in-dot-dir.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          contentPath: "src/fixtures",
          collectionPathMode: "root",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/dir-test-custom-slug.md/test.custom.slug.in.dot.dir">foo</a></body></html>';

      assert.equal(actual, expected);
    });
  });

  describe("config option - trailingSlash", () => {
    test("should contain trailing slash when option not specified and file contains", async () => {
      const input = '<a href="./fixtures/test.md/">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/test/">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should not contain trailing slash when option not specified and file does not contain", async () => {
      const input = '<a href="./fixtures/test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/test">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should contain trailing slash when option not specified and file does not contain and custom slug contains", async () => {
      const input =
        '<a href="./fixtures/dir-test-custom-slug/with-trailing-slash.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/dir-test-custom-slug/slug-with-trailing-slash/">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should not contain trailing slash when option not specified and file contains and custom slug does not contain", async () => {
      const input =
        '<a href="./fixtures/dir-test-custom-slug/without-trailing-slash.md/">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/dir-test-custom-slug/slug-without-trailing-slash">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should not contain trailing slash when option not specified and file contains and custom slug contains", async () => {
      const input =
        '<a href="./fixtures/dir-test-custom-slug/with-trailing-slash.md/">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/dir-test-custom-slug/slug-with-trailing-slash/">foo</a></body></html>';

      assert.equal(actual, expected);
    });
  });

  describe("excluded files", () => {
    test("should not transform markdown file that exists that begins with underscore", async () => {
      const input = '<a href="./fixtures/_test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="./fixtures/_test.md">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should not transform markdown file that exists with underscore in a directory path segment", async () => {
      const input =
        '<a href="./fixtures/_dir-test/content-dir/collection-dir-1/test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="./fixtures/_dir-test/content-dir/collection-dir-1/test.md">foo</a></body></html>';

      assert.equal(actual, expected);
    });

    test("should transform markdown file that exists with underscore in a directory path above the content dir but not below it", async () => {
      const input =
        '<a href="./fixtures/_dir-test/content-dir/collection-dir-1/test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          contentPath: "src/fixtures/_dir-test/content-dir",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/collection-dir-1/test">foo</a></body></html>';

      assert.equal(actual, expected);
    });
  });
});
