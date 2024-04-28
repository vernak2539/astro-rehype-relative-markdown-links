import { describe, test } from "node:test";
import { mergeCollectionOptions, validateOptions } from "./options.mjs";
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

    test("should error when collectionBase is a string containing an invalid value", () => {
      expectsZodError({ collectionBase: "foobar" }, "invalid_union");
    });

    test("should error when collectionBase is a number", () => {
      expectsZodError({ collectionBase: 5 }, "invalid_union");
    });

    test("should error when collectionBase is an object", () => {
      expectsZodError({ collectionBase: {} }, "invalid_union");
    });

    test("should error when collectionBase is null", () => {
      expectsZodError({ collectionBase: null }, "invalid_union");
    });
  });

  describe("collections", () => {
    describe("collections:core", () => {
      test("should have expected collections default", () => {
        expectsValidOption({}, "collections", defaultOptions.collections);
      });

      test("should contain empty collection when empty collection specified", () => {
        const expected = { docs: {} };
        expectsValidOption({ collections: expected }, "collections", expected);
      });

      test("should contain collection defaults when collection contains invalid collection key", () => {
        expectsValidOption(
          { collections: { docs: { thisdoesnotexistonschema: "foo" } } },
          "collections",
          { docs: defaultCollectionConfig },
        );
      });

      test("should error when collections is not an object", () => {
        expectsZodError({ collections: false }, "invalid_type");
      });

      test("should error when collections contains numeric key", () => {
        expectsZodError({ collections: { 5: "name" } }, "invalid_type");
      });

      test("should error when collections is null", () => {
        expectsZodError({ collections: null }, "invalid_type");
      });
    });

    describe("collections:base", () => {
      test("should contain base name for collection when base name specified", () => {
        const expected = { docs: { base: "name" } };
        expectsValidOption({ collections: expected }, "collections", expected);
      });

      test("should contain base false for collection when base false specified", () => {
        const expected = { docs: { base: false } };
        expectsValidOption({ collections: expected }, "collections", expected);
      });

      test("should contain multiple collections when multiple collections specified", () => {
        const expected = {
          docs: { base: false },
          newsletter: { base: "name" },
        };
        expectsValidOption({ collections: expected }, "collections", expected);
      });

      test("should error when base is a string containing an invalid value", () => {
        expectsZodError(
          { collections: { docs: { base: "foobar" } } },
          "invalid_union",
        );
      });

      test("should error when base is a number", () => {
        expectsZodError(
          { collections: { docs: { base: 5 } } },
          "invalid_union",
        );
      });

      test("should error when base is an object", () => {
        expectsZodError(
          { collections: { docs: { base: {} } } },
          "invalid_union",
        );
      });

      test("should error when base is null", () => {
        expectsZodError(
          { collections: { docs: { base: null } } },
          "invalid_union",
        );
      });
    });

    describe("collections:name", () => {
      test("should contain name when name specified", () => {
        const expected = { docs: { name: "my-docs" } };
        expectsValidOption({ collections: expected }, "collections", expected);
      });

      test("should contain multiple collections when multiple collections specified", () => {
        const expected = {
          docs: { name: "my-docs" },
          newsletter: { name: "my-newsletter" },
        };
        expectsValidOption({ collections: expected }, "collections", expected);
      });

      test("should error when name is a number", () => {
        expectsZodError({ collections: { docs: { name: 5 } } }, "invalid_type");
      });

      test("should error when name is an object", () => {
        expectsZodError(
          { collections: { docs: { name: {} } } },
          "invalid_type",
        );
      });

      test("should error when name is null", () => {
        expectsZodError(
          { collections: { docs: { name: null } } },
          "invalid_type",
        );
      });
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

    test("should error when trailingSlash is a number", () => {
      expectsZodError({ trailingSlash: 5 }, "invalid_union");
    });

    test("should error when trailingSlash is a object", () => {
      expectsZodError({ trailingSlash: {} }, "invalid_union");
    });

    test("should error when trailingSlash is null", () => {
      expectsZodError({ trailingSlash: null }, "invalid_union");
    });
  });

  describe("basePath", () => {
    test("should have expected basePath default", () => {
      expectsValidOption({}, "basePath", defaultOptions.basePath);
    });

    test("should be basePath value specified when provided", () => {
      expectsValidOption({ basePath: "foobar" }, "basePath", "foobar");
    });

    test("should error when basePath is a number", () => {
      expectsZodError({ basePath: 5 }, "invalid_type");
    });

    test("should error when basePath is a object", () => {
      expectsZodError({ basePath: {} }, "invalid_type");
    });

    test("should error when basePath is null", () => {
      expectsZodError({ basePath: null }, "invalid_type");
    });
  });

  describe("srcDir", () => {
    test("should have expected srcDir default", () => {
      expectsValidOption({}, "srcDir", defaultOptions.srcDir);
    });

    test("should be srcDir value specified when string", () => {
      expectsValidOption({ srcDir: "foobar" }, "srcDir", "foobar");
    });

    test("should error when srcDir is a number", () => {
      expectsZodError({ srcDir: 5 }, "invalid_type");
    });

    test("should error when srcDir is a object", () => {
      expectsZodError({ srcDir: {} }, "invalid_type");
    });

    test("should error when srcDir is null", () => {
      expectsZodError({ srcDir: null }, "invalid_type");
    });
  });
});

describe("mergeCollectionOptions", () => {
  describe("collectionBase", () => {
    test("collectionBase should be name when top-level name and no collection override", () => {
      const actual = mergeCollectionOptions("docs", {
        collectionBase: "name",
        collections: {},
      });
      assert.equal(actual.collectionBase, "name");
    });

    test("collectionBase should name when top-level false and collection override name", () => {
      const actual = mergeCollectionOptions("docs", {
        collectionBase: false,
        collections: { docs: { base: "name" } },
      });
      assert.equal(actual.collectionBase, "name");
    });

    test("collectionBase should be name when top-level name and collection override name", () => {
      const actual = mergeCollectionOptions("docs", {
        collectionBase: "name",
        collections: { docs: { base: "name" } },
      });
      assert.equal(actual.collectionBase, "name");
    });

    test("collectionBase should be name when top-level name and no collection override matches collection name", () => {
      const actual = mergeCollectionOptions("docs", {
        collectionBase: "name",
        collections: { fake: { base: false } },
      });
      assert.equal(actual.collectionBase, "name");
    });

    test("collectionBase should be false when top-level false and no collection override", () => {
      const actual = mergeCollectionOptions("docs", {
        collectionBase: false,
        collections: {},
      });
      assert.equal(actual.collectionBase, false);
    });

    test("collectionBase should be false top-level name and collection override false", () => {
      const actual = mergeCollectionOptions("docs", {
        collectionBase: "name",
        collections: { docs: { base: false } },
      });
      assert.equal(actual.collectionBase, false);
    });

    test("collectionBase should be false when top-level false and collection override false", () => {
      const actual = mergeCollectionOptions("docs", {
        collectionBase: false,
        collections: { docs: { base: false } },
      });
      assert.equal(actual.collectionBase, false);
    });

    test("collectionBase should be false when top-level false and no collection override matches collection name", () => {
      const actual = mergeCollectionOptions("docs", {
        collectionBase: false,
        collections: { fake: { base: "name" } },
      });
      assert.equal(actual.collectionBase, false);
    });
  });

  describe("collectionName", () => {
    test("collectionName should contain name from parameter when no collection override", () => {
      const actual = mergeCollectionOptions("docs", {
        collections: {},
      });
      assert.equal(actual.collectionName, "docs");
    });

    test("collectionName should contain name from collection override", () => {
      const actual = mergeCollectionOptions("docs", {
        collectionBase: "name",
        collections: { docs: { name: "my-docs" } },
      });
      assert.equal(actual.collectionName, "my-docs");
    });

    test("collectionName should contain name from parameter when no collection overrides matches collection name", () => {
      const actual = mergeCollectionOptions("docs", {
        collectionBase: "name",
        collections: { fake: { name: "my-docs" } },
      });
      assert.equal(actual.collectionName, "docs");
    });
  });
});
