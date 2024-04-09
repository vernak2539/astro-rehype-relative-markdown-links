import { test, describe } from "node:test";
import assert from "node:assert";

import {
  isValidRelativeLink,
  normaliseAstroOutputPath,
  replaceExt,
  splitPathFromQueryAndFragment,
  generateSlug,
  resolveSlug,
  applyTrailingSlash,
  isValidFile,
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
    assert.throws(() => resolveSlug("foo/bar", null ));
  });

  test("throws exception when frontmatter is number", () => {
    assert.throws(() => resolveSlug("foo/bar", 5 ));
  });  
});

describe("normaliseAstroOutputPath", () => {
  describe("prefix base to path", () => {
    test("base with no slashes", () => {
      const actual = normaliseAstroOutputPath("/foo-testing-test", {
        basePath: "base",
      });

      assert.equal(actual, "/base/foo-testing-test");
    });

    test("base with slash at start", () => {
      const actual = normaliseAstroOutputPath("/foo-testing-test", {
        basePath: "/base",
      });

      assert.equal(actual, "/base/foo-testing-test");
    });

    test("base with slash at end", () => {
      const actual = normaliseAstroOutputPath("/foo-testing-test", {
        basePath: "base/",
      });

      assert.equal(actual, "/base/foo-testing-test");
    });

    test("base with slash at start and end", () => {
      const actual = normaliseAstroOutputPath("/foo-testing-test", {
        basePath: "/base/",
      });

      assert.equal(actual, "/base/foo-testing-test");
    });
  });
});

describe("applyTrailingSlash", () => {
  describe("always", () => {
    test("original does not contain resolved does not contain", () => {
      const actual = applyTrailingSlash('./foo.md', '/foo', 'always')

      assert.equal(actual, "/foo/");
    });

    test("original contains resolved contains", () => {
      const actual = applyTrailingSlash('./foo.md/', '/foo/', 'always')

      assert.equal(actual, "/foo/");
    });

    test("original contains resolved does not contain", () => {
      const actual = applyTrailingSlash('./foo.md/', '/foo', 'always')

      assert.equal(actual, "/foo/");
    });

    test("original does not contain resolved does contain", () => {
      const actual = applyTrailingSlash('./foo.md', '/foo/', 'always')

      assert.equal(actual, "/foo/");
    });
  });
  
  describe("never", () => {
    test("original does not contain resolved does not contain", () => {
      const actual = applyTrailingSlash('./foo.md', '/foo', 'never')

      assert.equal(actual, "/foo");
    });

    test("original contains resolved contains", () => {
      const actual = applyTrailingSlash('./foo.md/', '/foo/', 'never')

      assert.equal(actual, "/foo");
    });

    test("original contains resolved does not contain", () => {
      const actual = applyTrailingSlash('./foo.md/', '/foo', 'never')

      assert.equal(actual, "/foo");
    });

    test("original does not contain resolved does contain", () => {
      const actual = applyTrailingSlash('./foo.md', '/foo/', 'never')

      assert.equal(actual, "/foo");
    });
  });  

  describe("ignore", () => {
    test("original does not contain resolved does not contain", () => {
      const actual = applyTrailingSlash('./foo.md', '/foo', 'ignore')

      assert.equal(actual, "/foo");
    });

    test("original contains resolved contains", () => {
      const actual = applyTrailingSlash('./foo.md/', '/foo/', 'ignore')

      assert.equal(actual, "/foo/");
    });

    test("original contains resolved does not contain", () => {
      const actual = applyTrailingSlash('./foo.md/', '/foo', 'ignore')

      assert.equal(actual, "/foo/");
    });

    test("original does not contain resolved does contain", () => {
      const actual = applyTrailingSlash('./foo.md', '/foo/', 'ignore')

      assert.equal(actual, "/foo");
    });
  });
});

describe("isValidFile", () => {
  test("return true if relative path to .md file exists", () => {
    const actual = isValidFile("./src/fixtures/test.md");

    assert.equal(actual, true);
  });

  test("return true if relative path to .mdx file that exists", () => {
    const actual = isValidFile("./src/fixtures/test.mdx");

    assert.equal(actual, true);
  });

  test("return true if relative path to a file exists", () => {
    const actual = isValidFile("./src/fixtures/test.txt");

    assert.equal(actual, true);
  });  

  test("return false if relative path to .md file does not exist", () => {
    const actual = isValidFile("./src/fixtures/does-not-exist.md");

    assert.equal(actual, false);
  });  

  test("return false if relative path to .mdx file does not exist", () => {
    const actual = isValidFile("./src/fixtures/does-not-exist.mdx");

    assert.equal(actual, false);
  });  

  test("return false if relative path to a file does not exist", () => {
    const actual = isValidFile("./src/fixtures/does-not-exist.txt");

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
    const actual = isValidFile("./src/fixtures/dir-exists.md");

    assert.equal(actual, false);
  });

  test("return false if path is a directory ending in .md/ that exists", () => {
    const actual = isValidFile("./src/fixtures/dir-exists.md/");

    assert.equal(actual, false);
  }); 

  test("return false if path is a directory ending in .mdx that exists", () => {
    const actual = isValidFile("./src/fixtures/dir-exists.mdx");

    assert.equal(actual, false);
  });

  test("return false if path is a directory ending in .mdx/ that exists", () => {
    const actual = isValidFile("./src/fixtures/dir-exists.mdx/");

    assert.equal(actual, false);
  })  

  test("return false if path is a directory that exists", () => {
    const actual = isValidFile("./src/fixtures/dir-exists.txt");

    assert.equal(actual, false);
  });
});
