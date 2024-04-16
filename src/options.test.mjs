import { describe, test } from "node:test";
import { validateOptions } from "./options.mjs";
import assert from "node:assert";
import { OptionsSchema } from "./options.mjs";
import path from "path";

const { data: defaultOptions } = OptionsSchema.safeParse({});

describe("validateOptions", () => {
  const expectsZodError = async (options, errorCode) => {
    await assert.rejects(
      async () => validateOptions(options),
      (err) => {
        assert.strictEqual(err.name, "ZodError");
        assert.strictEqual(err.issues[0].code, errorCode);
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
    test("should default collectionPathMode to subdirectory", () => {
      expectsValidOption({}, "collectionPathMode", "subdirectory");
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

    test("should error when collectionPathMode is not a subdirectory or root", async () => {
      await expectsZodError({ collectionPathMode: "foobar" }, "invalid_union");
    });

    test("should fail when collectionPathMode is not a string", async () => {
      await expectsZodError({ collectionPathMode: {} }, "invalid_union");
    });
  });

  describe("trailingSlash", () => {
    test("should default trailingSlash to ignore", () => {
      expectsValidOption({}, "trailingSlash", "ignore");
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

    test("should error when trailingSlash is not a ignore, always or never", async () => {
      await expectsZodError({ trailingSlash: "foobar" }, "invalid_union");
    });

    test("should fail when trailingSlash is not a string", async () => {
      await expectsZodError({ trailingSlash: {} }, "invalid_union");
    });
  });

  describe("basePath", () => {
    test("should default baesPath to undefined", () => {
      expectsValidOption({}, "basePath", undefined);
    });

    test("should be basePath value specified when provided", () => {
      expectsValidOption({ basePath: "foobar" }, "basePath", "foobar");
    });

    test("should fail when baesPath not a string", async () => {
      await expectsZodError({ basePath: {} }, "invalid_type");
    });
  });

  describe("contentPath", () => {
    test("should default contentPath to src/content", () => {
      expectsValidOption({}, "contentPath", ["src", "content"].join(path.sep));
    });

    test("should be contentPath value specified when string", () => {
      expectsValidOption({ contentPath: "foobar" }, "contentPath", "foobar");
    });

    test("should fail when contentPath not a string", async () => {
      await expectsZodError({ contentPath: {} }, "invalid_type");
    });
  });
});
