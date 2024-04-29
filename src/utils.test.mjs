import { test, describe } from "node:test";
import assert from "node:assert";
import esmock from "esmock";

/*
  NOTE ON ESMOCK USAGE - See details in index.test.mjs
*/

import {
  isValidRelativeLink,
  normaliseAstroOutputPath,
  replaceExt,
  splitPathFromQueryAndFragment,
  isValidFile,
  generateSlug,
  resolveSlug,
  applyTrailingSlash,
  resolveCollectionBase,
  FILE_PATH_SEPARATOR,
} from "./utils.mjs";

describe("replaceExt", () => {
  test("replaces extension with another extension", () => {
    const actual = replaceExt("foo.js", ".md");

    assert.equal(actual, "foo.md");
  });

  test("removes extension", () => {
    const actual = replaceExt("foo.js", "");

    assert.equal(actual, "foo");
  });

  test("handles relative paths with single dot", () => {
    const actual = replaceExt("./foo.js", ".md");

    assert.equal(actual, "./foo.md");
  });

  test("handles relative paths with two dots", () => {
    const actual = replaceExt("../foo.js", ".md");

    assert.equal(actual, "../foo.md");
  });

  test("returns arg if not string", () => {
    const actual = replaceExt(["foo.js"], ".md");

    assert.deepStrictEqual(actual, ["foo.js"]);
  });

  test("returns path if length is zero", () => {
    const actual = replaceExt("", ".md");

    assert.equal(actual, "");
  });
});

describe("isValidRelativeLink", () => {
  test("return true if relative path to .md file", () => {
    const actual = isValidRelativeLink("./foo.md");

    assert.equal(actual, true);
  });

  test("return true if relative path to .mdx file", () => {
    const actual = isValidRelativeLink("./foo.mdx");

    assert.equal(actual, true);
  });

  test("return false if link empty string", () => {
    const actual = isValidRelativeLink("");

    assert.equal(actual, false);
  });

  test("return false if link does not exist", () => {
    const actual = isValidRelativeLink(null);

    assert.equal(actual, false);
  });

  test("return false if not .md or .mdx file", () => {
    const actual = isValidRelativeLink("./foo.js");

    assert.equal(actual, false);
  });

  test("return false if an aboslute path", () => {
    const actual = isValidRelativeLink("/foo.js");

    assert.equal(actual, false);
  });
});

describe("splitPathFromQueryAndFragment", () => {
  test("separates path with query string and hash", () => {
    const actual = splitPathFromQueryAndFragment("./test.md?q=q#hash");

    assert.deepStrictEqual(actual, ["./test.md", "?q=q#hash"]);
  });

  test("separates path with query string only", () => {
    const actual = splitPathFromQueryAndFragment("./test.md?q=q");

    assert.deepStrictEqual(actual, ["./test.md", "?q=q"]);
  });

  test("separates path with hash only", () => {
    const actual = splitPathFromQueryAndFragment("./test.md#hash");

    assert.deepStrictEqual(actual, ["./test.md", "#hash"]);
  });
});

describe("generateSlug", () => {
  test("removes uppercase characters", () => {
    const actual = generateSlug(["/Foo-TESTING-test"]);

    assert.equal(actual, "foo-testing-test");
  });

  test("replaces spaces with dashes", () => {
    const actual = generateSlug(["/foo testing test"]);

    assert.equal(actual, "foo-testing-test");
  });

  test("removes periods", () => {
    const actual = generateSlug(["/foo.testing.test"]);

    assert.equal(actual, "footestingtest");
  });

  test("removes uppercase across multiple segments", () => {
    const actual = generateSlug(["/FOO", "/foo-TESTING-test"]);

    assert.equal(actual, "foo/foo-testing-test");
  });

  test("removes spaces across multiple segments with no leading slashes", () => {
    const actual = generateSlug(["FOO", "foo TESTING test"]);

    assert.equal(actual, "foo/foo-testing-test");
  });

  test("should strip index when subdirectory", () => {
    const actual = generateSlug(["foo", "index"]);

    assert.equal(actual, "foo");
  });

  test("should strip mixed-case index when subdirectory", () => {
    const actual = generateSlug(["foo", "iNdEX"]);

    assert.equal(actual, "foo");
  });

  test("should not strip index root", () => {
    const actual = generateSlug(["index"]);

    assert.equal(actual, "index");
  });

  test("should not strip mixed case index root", () => {
    const actual = generateSlug(["iNdEX"]);

    assert.equal(actual, "index");
  });
});

describe("resolveSlug", () => {
  test("uses generated slug when frontmatter undefined", () => {
    const actual = resolveSlug("foo/bar");

    assert.equal(actual, "foo/bar");
  });

  test("uses frontmatter when frontmatter empty string", () => {
    const actual = resolveSlug("foo/bar", "");

    assert.equal(actual, "");
  });

  test("uses frontmatter when frontmatter is index", () => {
    const actual = resolveSlug("foo/bar", "index");

    assert.equal(actual, "index");
  });

  test("uses frontmatter when frontmatter has extension", () => {
    const actual = resolveSlug("foo/bar", "foo.md");

    assert.equal(actual, "foo.md");
  });

  test("throws exception when no valid slug", () => {
    assert.throws(() => resolveSlug());
  });

  test("throws exception when frontmatter is null", () => {
    assert.throws(() => resolveSlug("foo/bar", null));
  });

  test("throws exception when frontmatter is number", () => {
    assert.throws(() => resolveSlug("foo/bar", 5));
  });
});

describe("normaliseAstroOutputPath", () => {
  describe("prefix base to path", () => {
    test("should prefix base with no slashes", () => {
      const actual = normaliseAstroOutputPath("/foo-testing-test", {
        basePath: "base",
      });

      assert.equal(actual, "/base/foo-testing-test");
    });

    test("should prefix base with slash at start", () => {
      const actual = normaliseAstroOutputPath("/foo-testing-test", {
        basePath: "/base",
      });

      assert.equal(actual, "/base/foo-testing-test");
    });

    test("should prefix base with slash at end", () => {
      const actual = normaliseAstroOutputPath("/foo-testing-test", {
        basePath: "base/",
      });

      assert.equal(actual, "/base/foo-testing-test");
    });

    test("should prefix base with slash at start and end", () => {
      const actual = normaliseAstroOutputPath("/foo-testing-test", {
        basePath: "/base/",
      });

      assert.equal(actual, "/base/foo-testing-test");
    });

    test("should not prefix base when collectionBase is collectionRelative", () => {
      const actual = normaliseAstroOutputPath("/foo-testing-test", {
        basePath: "/base",
        collectionBase: "collectionRelative",
      });

      assert.equal(actual, "/foo-testing-test");
    });
  });
});

describe("isValidFile", () => {
  test("return true if relative path to .md file exists", () => {
    const actual = isValidFile("./src/fixtures/content/docs/test.md");

    assert.equal(actual, true);
  });

  test("return true if relative path to .mdx file that exists", () => {
    const actual = isValidFile("./src/fixtures/content/docs/test.mdx");

    assert.equal(actual, true);
  });

  test("return true if relative path to a file exists", () => {
    const actual = isValidFile("./src/fixtures/content/docs/test.txt");

    assert.equal(actual, true);
  });

  test("return false if relative path to .md file does not exist", () => {
    const actual = isValidFile("./src/fixtures/content/docs/does-not-exist.md");

    assert.equal(actual, false);
  });

  test("return false if relative path to .mdx file does not exist", () => {
    const actual = isValidFile(
      "./src/fixtures/content/docs/does-not-exist.mdx",
    );

    assert.equal(actual, false);
  });

  test("return false if relative path to a file does not exist", () => {
    const actual = isValidFile(
      "./src/fixtures/content/docs/does-not-exist.txt",
    );

    assert.equal(actual, false);
  });

  test("return false if link empty string", () => {
    const actual = isValidFile("");

    assert.equal(actual, false);
  });

  test("return false if link is null", () => {
    const actual = isValidFile(null);

    assert.equal(actual, false);
  });

  test("return false if link is undefined", () => {
    const actual = isValidFile();

    assert.equal(actual, false);
  });

  test("return false if path is a directory ending in .md that exists", () => {
    const actual = isValidFile("./src/fixtures/content/docs/dir-exists.md");

    assert.equal(actual, false);
  });

  test("return false if path is a directory ending in .md/ that exists", () => {
    const actual = isValidFile("./src/fixtures/content/docs/dir-exists.md/");

    assert.equal(actual, false);
  });

  test("return false if path is a directory ending in .mdx that exists", () => {
    const actual = isValidFile("./src/fixtures/content/docs/dir-exists.mdx");

    assert.equal(actual, false);
  });

  test("return false if path is a directory ending in .mdx/ that exists", () => {
    const actual = isValidFile("./src/fixtures/content/docs/dir-exists.mdx/");

    assert.equal(actual, false);
  });

  test("return false if path is a directory that exists", () => {
    const actual = isValidFile("./src/fixtures/content/docs/dir-exists.txt");

    assert.equal(actual, false);
  });
});

describe("applyTrailingSlash", () => {
  describe("always", () => {
    test("original does not contain resolved does not contain", () => {
      const actual = applyTrailingSlash("./foo.md", "/foo", "always");

      assert.equal(actual, "/foo/");
    });

    test("original contains resolved contains", () => {
      const actual = applyTrailingSlash("./foo.md/", "/foo/", "always");

      assert.equal(actual, "/foo/");
    });

    test("original contains resolved does not contain", () => {
      const actual = applyTrailingSlash("./foo.md/", "/foo", "always");

      assert.equal(actual, "/foo/");
    });

    test("original does not contain resolved does contain", () => {
      const actual = applyTrailingSlash("./foo.md", "/foo/", "always");

      assert.equal(actual, "/foo/");
    });
  });

  describe("never", () => {
    test("original does not contain resolved does not contain", () => {
      const actual = applyTrailingSlash("./foo.md", "/foo", "never");

      assert.equal(actual, "/foo");
    });

    test("original contains resolved contains", () => {
      const actual = applyTrailingSlash("./foo.md/", "/foo/", "never");

      assert.equal(actual, "/foo");
    });

    test("original contains resolved does not contain", () => {
      const actual = applyTrailingSlash("./foo.md/", "/foo", "never");

      assert.equal(actual, "/foo");
    });

    test("original does not contain resolved does contain", () => {
      const actual = applyTrailingSlash("./foo.md", "/foo/", "never");

      assert.equal(actual, "/foo");
    });
  });

  describe("ignore", () => {
    test("original does not contain resolved does not contain", () => {
      const actual = applyTrailingSlash("./foo.md", "/foo", "ignore");

      assert.equal(actual, "/foo");
    });

    test("original contains resolved contains", () => {
      const actual = applyTrailingSlash("./foo.md/", "/foo/", "ignore");

      assert.equal(actual, "/foo/");
    });

    test("original contains resolved does not contain", () => {
      const actual = applyTrailingSlash("./foo.md/", "/foo", "ignore");

      assert.equal(actual, "/foo/");
    });

    test("original does not contain resolved does contain", () => {
      const actual = applyTrailingSlash("./foo.md", "/foo/", "ignore");

      assert.equal(actual, "/foo");
    });
  });
});

describe("resolveCollectionBase", () => {
  describe("collectionBase:name", () => {
    test("should return absolute collection name path when collectionBase is name", () => {
      const actual = resolveCollectionBase({
        collectionBase: "name",
        collectionName: "docs",
      });
      assert.equal(actual, "/docs");
    });
  });

  describe("collectionBase:false", () => {
    test("should return empty string when collectionBase is false", () => {
      const actual = resolveCollectionBase({
        collectionBase: false,
        collectionName: undefined,
      });
      assert.equal(actual, "");
    });
  });

  describe("collectionBase:collectionRelative", () => {
    const runRelativeTest = async (
      fileContent,
      collectionName,
      currentFile,
      collectionDir,
      expected,
    ) => {
      const { resolveCollectionBase: resolveCollectionBaseMock } = await esmock(
        "./utils.mjs",
        {
          fs: { readFileSync: () => fileContent },
        },
      );

      const actual = resolveCollectionBaseMock(
        {
          collectionBase: "collectionRelative",
          collectionName: collectionName,
        },
        { currentFile, collectionDir },
      );
      assert.equal(actual, expected);
    };

    test("should return relative path in current dir based on file path when collectionBase is collectionRelative", async (t) => {
      await runRelativeTest(
        "",
        "docs",
        "/content/docs/test.md",
        "/content/docs",
        ".",
      );
    });

    test("should return relative path up two dirs based on file path when collectionBase is collectionRelative", async (t) => {
      await runRelativeTest(
        "",
        "docs",
        "/content/docs/foo/bar/test.md",
        "/content/docs",
        ["..", ".."].join(FILE_PATH_SEPARATOR),
      );
    });

    test("should return relative path in current dir based on custom slug when collectionBase is collectionRelative", async (t) => {
      await runRelativeTest(
        "---\nslug: hello\n---",
        "docs",
        "/content/docs/foo/bar/test.md",
        "/content/docs",
        ".",
      );
    });

    test("should return relative path up one dir based on custom slug when collectionBase is collectionRelative", async (t) => {
      await runRelativeTest(
        "---\nslug: foo/hello\n---",
        "docs",
        "/content/docs/test.md",
        "/content/docs",
        "..",
      );
    });

    test("should return relative path in current dir based on empty custom slug when collectionBase is collectionRelative", async (t) => {
      await runRelativeTest(
        "---\nslug: ''\n---",
        "docs",
        "/content/docs/index.md",
        "/content/docs",
        ".",
      );
    });
  });
});

describe("getRelativePathFromCurrentFileToDestination", () => {
  const runRelativeTest = async (
    fileContent,
    currentFile,
    collectionDir,
    destinationSlug,
    expected,
  ) => {
    const {
      getRelativePathFromCurrentFileToDestination:
        getRelativePathFromCurrentFileToDestinationMock,
    } = await esmock("./utils.mjs", {
      fs: { readFileSync: () => fileContent },
    });

    const actual = getRelativePathFromCurrentFileToDestinationMock({
      currentFile,
      collectionDir,
      destinationSlug,
    });
    assert.equal(actual, expected);
  };

  test("should return relative path in current dir based on file path when collectionBase is pathRelative", async (t) => {
    await runRelativeTest(
      "",
      "/content/docs/foo/bar/bang/test.md",
      "/content/docs",
      "foo/bar/bang/test2",
      "test2",
    );
  });

  test("should return relative path up two dirs based on file path when collectionBase is pathRelative", async (t) => {
    await runRelativeTest(
      "",
      "/content/docs/foo/bar/bang/test.md",
      "/content/docs",
      "foo/test2",
      ["..", "..", "test2"].join(FILE_PATH_SEPARATOR),
    );
  });

  test("should return relative path down one dir based on file path when collectionBase is pathRelative", async (t) => {
    await runRelativeTest(
      "",
      "/content/docs/foo/bar/test.md",
      "/content/docs",
      "foo/bar/bang/my-page",
      ["bang", "my-page"].join(FILE_PATH_SEPARATOR),
    );
  });

  test("should return relative path up one, over and down one based on file path when collectionBase is pathRelative", async (t) => {
    await runRelativeTest(
      "",
      "/content/docs/foo/bar/bang/test.md",
      "/content/docs",
      "foo/bar/fiddle/my-page",
      ["..", "fiddle", "my-page"].join(FILE_PATH_SEPARATOR),
    );
  });

  test("should return relative path in current dir based on custom current file slug when collectionBase is pathRelative", async (t) => {
    await runRelativeTest(
      "---\nslug: iamroot\n---",
      "/content/docs/foo/bar/bang/test.md",
      "/content/docs",
      "test2",
      "test2",
    );
  });

  test("should return relative path up one dir based on custom current file slug when collectionBase is pathRelative", async (t) => {
    await runRelativeTest(
      "---\nslug: iamroot/iampage\n---",
      "/content/docs/test.md",
      "/content/docs",
      "test2",
      ["..", "test2"].join(FILE_PATH_SEPARATOR),
    );
  });

  test("should return relative path in current dir based on empty current file slug when collectionBase is pathRelative", async (t) => {
    await runRelativeTest(
      "---\nslug: ''\n---",
      "/content/docs/index.md",
      "/content/docs",
      "test2",
      "test2",
    );
  });

  test("should return relative path down one dir based on empty current file slug when collectionBase is pathRelative", async (t) => {
    await runRelativeTest(
      "---\nslug: ''\n---",
      "/content/docs/index.md",
      "/content/docs",
      "foo/test2",
      ["foo", "test2"].join(FILE_PATH_SEPARATOR)
    );
  });

  test("should return relative path in current dir based on empty destination slug when collectionBase is pathRelative", async (t) => {
    await runRelativeTest(
      "---\nslug: test\n---",
      "/content/docs/test.md",
      "/content/docs",
      "",
      ".",
    );
  });

  test("should return relative path in parent dir based on empty destination slug when collectionBase is pathRelative", async (t) => {
    await runRelativeTest(
      "---\nslug: foo/test\n---",
      "/content/docs/foo/test.md",
      "/content/docs",
      "",
      "..",
    );
  });
});
