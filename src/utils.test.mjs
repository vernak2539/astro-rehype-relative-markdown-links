import { test, describe } from "node:test";
import assert from "node:assert";

import {
  isValidRelativeLink,
  normaliseAstroOutputPath,
  replaceExt,
  splitPathFromQueryAndFragment,
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

describe("normaliseAstroOutputPath", () => {
  test("removes uppercase characters", () => {
    const actual = normaliseAstroOutputPath("/Foo-TESTING-test");

    assert.equal(actual, "/foo-testing-test");
  });

  test("replaces spaces with dashes", () => {
    const actual = normaliseAstroOutputPath("/foo testing test");

    assert.equal(actual, "/foo-testing-test");
  });
});
