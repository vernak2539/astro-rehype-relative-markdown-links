import { describe, test } from "node:test";
import { validateOptions } from "./options.mjs";
import assert from "node:assert";
import path from "path";

/** @type {import('./options.d.ts').Options} */
const defaultOptions = {
  contentPath: ["src", "content"].join(path.sep),
  trailingSlash: "ignore",
  collectionPathMode: "subdirectory",
};

describe("validateOptions", () => {
  const expectsZodError = (options, errorCode) => {
    assert.throws(
      () => validateOptions(options),
      (err) => {
        assert.strictEqual(err.name, "ZodError");
        assert.strictEqual(
          err.issues.some((i) => i.code === errorCode),
          true,
        );
        return true;
      },
    );
  };

  const expectsValidOptions = (options, expected) => {
    const actual = validateOptions(options);
    assert.deepStrictEqual(actual, expected);
  };

  const expectsValidOption = (options, option, expected) => {
    const actual = validateOptions(options);
    assert.equal(actual[option], expected);
  };

  describe("defaults", () => {
    test("should return defaults when no options specified", async () => {
      const actual = validateOptions();
      assert.deepStrictEqual(actual, defaultOptions);
    });

    test("should return defaults when provided with null", async () => {
      expectsValidOptions(null, defaultOptions);
    });

    test("should return defaults when provided with undefined", async () => {
      expectsValidOptions(undefined, defaultOptions);
    });

    test("should return defaults when provided with empty object", async () => {
      expectsValidOptions({}, defaultOptions);
    });

    test("should return specified property value with remaining defaults", async () => {
      const options = { contentPath: "foo/bar" };
      expectsValidOptions(options, {
        ...defaultOptions,
        ...options,
      });
    });
  });

  describe("collectionPathMode", () => {
    test("should have expected collectionPathMode default", () => {
      expectsValidOption(
        {},
        "collectionPathMode",
        defaultOptions.collectionPathMode,
      );
    });

    test("should be collectionPathMode subdirectory when subdirectory specified", () => {
      expectsValidOption(
        { collectionPathMode: "subdirectory" },
        "collectionPathMode",
        "subdirectory",
      );
    });

    test("should be collectionPathMode root when root specified", () => {
      expectsValidOption(
        { collectionPathMode: "root" },
        "collectionPathMode",
        "root",
      );
    });

    test("should error when collectionPathMode is not a subdirectory or root", () => {
      expectsZodError({ collectionPathMode: "foobar" }, "invalid_union");
    });

    test("should fail when collectionPathMode is not a string", () => {
      expectsZodError({ collectionPathMode: {} }, "invalid_union");
    });
  });

  describe("trailingSlash", () => {
    test("should have expected trailingSlash default", () => {
      expectsValidOption({}, "trailingSlash", defaultOptions.trailingSlash);
    });

    test("should be trailingSlash always when always specified", () => {
      expectsValidOption(
        { trailingSlash: "always" },
        "trailingSlash",
        "always",
      );
    });

    test("should be trailingSlash never when never specified", () => {
      expectsValidOption({ trailingSlash: "never" }, "trailingSlash", "never");
    });

    test("should be trailingSlash ignore when ignore specified", () => {
      expectsValidOption(
        { trailingSlash: "ignore" },
        "trailingSlash",
        "ignore",
      );
    });

    test("should error when trailingSlash is not a ignore, always or never", () => {
      expectsZodError({ trailingSlash: "foobar" }, "invalid_union");
    });

    test("should fail when trailingSlash is not a string", () => {
      expectsZodError({ trailingSlash: {} }, "invalid_union");
    });
  });

  describe("base", () => {
    test("should have expected base default", () => {
      expectsValidOption({}, "base", defaultOptions.base);
    });

    test("should be base value specified when provided", () => {
      expectsValidOption({ base: "foobar" }, "base", "foobar");
    });

    test("should fail when base not a string", () => {
      expectsZodError({ base: {} }, "invalid_type");
    });
  });

  describe("contentPath", () => {
    test("should have expected contentPath default", () => {
      expectsValidOption({}, "contentPath", defaultOptions.contentPath);
    });

    test("should be contentPath value specified when string", () => {
      expectsValidOption({ contentPath: "foobar" }, "contentPath", "foobar");
    });

    test("should fail when contentPath not a string", () => {
      expectsZodError({ contentPath: {} }, "invalid_type");
    });
  });
});
