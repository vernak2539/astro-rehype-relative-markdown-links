import { describe, test } from "node:test";
import { validateOptions } from "./options.mjs";
import assert from "node:assert";

/** @type {import('./options.d.ts').CollectionConfig} */
const defaultCollectionConfig = {};

/** @type {import('./options.d.ts').Options} */
const defaultOptions = {
  srcDir: "./src",
  trailingSlash: "ignore",
  collectionBase: "name",
  collections: {},
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
    assert.deepStrictEqual(actual[option], expected);
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
      const options = { srcDir: "foo/bar" };
      expectsValidOptions(options, {
        ...defaultOptions,
        ...options,
      });
    });
  });

  describe("collectionBase", () => {
    test("should have expected collectionBase default", () => {
      expectsValidOption({}, "collectionBase", defaultOptions.collectionBase);
    });

    test("should be collectionBase name when name specified", () => {
      expectsValidOption({ collectionBase: "name" }, "collectionBase", "name");
    });

    test("should be collectionBase false when false specified", () => {
      expectsValidOption({ collectionBase: false }, "collectionBase", false);
    });

    test("should error when collectionBase is a string", () => {
      expectsZodError({ collectionBase: "foobar" }, "invalid_union");
    });

    test("should fail when collectionBase is an object", () => {
      expectsZodError({ collectionBase: {} }, "invalid_union");
    });
  });

  describe("collections", () => {
    test("should have expected collections default", () => {
      expectsValidOption({}, "collections", defaultOptions.collections);
    });

    test("should contain empty collection when empty collection specified", () => {
      const expected = { docs: {} };
      expectsValidOption({ collections: expected }, "collections", expected);
    });

    test("should contain base false for collection when base false specified", () => {
      const expected = { docs: { base: false } };
      expectsValidOption({ collections: expected }, "collections", expected);
    });

    test("should contain collection defaults when collection contains invalid collection key", () => {
      expectsValidOption(
        { collections: { docs: { thisdoesnotexistonschema: "foo" } } },
        "collections",
        { docs: defaultCollectionConfig },
      );
    });

    test("should contain multiple collections when multiple collections specified", () => {
      const expected = { docs: { base: false }, newsletter: { base: "name" } };
      expectsValidOption({ collections: expected }, "collections", expected);
    });

    test("should error when collections is not an object", () => {
      expectsZodError({ collections: false }, "invalid_type");
    });

    test("should error when collections contains numeric key", () => {
      expectsZodError({ collections: { 5: "name" } }, "invalid_type");
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

  describe("basePath", () => {
    test("should have expected basePath default", () => {
      expectsValidOption({}, "basePath", defaultOptions.basePath);
    });

    test("should be basePath value specified when provided", () => {
      expectsValidOption({ basePath: "foobar" }, "basePath", "foobar");
    });

    test("should fail when baesPath not a string", () => {
      expectsZodError({ basePath: {} }, "invalid_type");
    });
  });

  describe("srcDir", () => {
    test("should have expected srcDir default", () => {
      expectsValidOption({}, "srcDir", defaultOptions.srcDir);
    });

    test("should be srcDir value specified when string", () => {
      expectsValidOption({ srcDir: "foobar" }, "srcDir", "foobar");
    });

    test("should fail when srcDir not a string", () => {
      expectsZodError({ srcDir: {} }, "invalid_type");
    });
  });
});
