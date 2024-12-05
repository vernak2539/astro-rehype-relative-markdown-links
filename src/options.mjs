import { z } from "zod";

const CollectionBase = z.union([z.literal("name"), z.literal(false)]);

export const CollectionConfigSchema = z.object({
  /**
   * @name base
   * @description
   *
   * Override the top-level {@link Options#collectionBase collectionBase} option for this collection.
   */
  base: CollectionBase.optional(),
  /**
   * @name name
   * @description
   *
   * Override the name of the collection from disk.
   *
   * Use this option when your collection page path does not correspond to the name of the collection on disk (ex. `src/content/docs/reference.md` resolves to a page path of /my-docs/reference).
   *
   * When not specified, the name of the collection from disk will be used where applicable.
   */
  name: z.string().optional(),
});

/** @typedef {import('./options.d.ts').CollectionConfig} CollectionConfig */
export const OptionsSchema = z.object({
  /**
   * @name srcDir
   * @reference https://docs.astro.build/en/reference/configuration-reference/#srcdir
   * @default `./src`
   * @description
   *
   * Set the directory that Astro will read your site from.
   *
   * The value can be either an absolute file system path or a path relative to the project root.
   * @example
   * ```js
   * {
   *   srcDir: './www'
   * }
   * ```
   */
  srcDir: z.string().default("./src"),
  /**
   * @name collectionBase
   * @default `"name"`
   * @description
   *
   * Set how the base segment of the URL path to the referenced markdown file should be derived:
   *   - `"name"` - Apply the name on disk of the content collection (ex. `./guides/my-guide.md` referenced from `./resources/my-reference.md` in the content collection `docs` would resolve to the path `/docs/guides/my-guide`)
   *   - `false` - Do not apply a base (ex. `./guides/my-guide.md` referenced from `./resources/my-reference.md` in the content collection `docs` would resolve to the path `/guides/my-guide`)
   *
   * Use `false` when you are treating your content collection as if it were located in the site root (ex: `src/pages`). In most scenarios, you should set this value to `"name"` or not
   * set this value and the default of `"name"` will be used.
   *
   * Note that this is a top-level option and will apply to all content collections.  If you have multiple collections and only want one of them to be treated as the site root, you should set this value to `"name"` (or leave the default)
   * and use the {@link collections} option to control the behavior for the specific content collection.
   * @example
   * ```js
   * {
   *   // Do not apply a base segment to the transformed URL path
   *   collectionBase: false
   * }
   * ```
   * @see {@link collections}
   */
  collectionBase: CollectionBase.default("name"),
  /**
   * @name collections
   * @default `{}`
   * @description
   *
   * Specify a mapping of collections where the key is the name of a collection on disk and the value is an object of collection specific configuration which will override any top-level
   * configuration where applicable.
   *
   * @example
   * ```js
   * {
   *   // Do not apply a base segment to the transformed URL for the collection `docs`
   *   collections: {
   *     docs: {
   *       base: false
   *     }
   *   }
   * }
   * ```
   * @see {@link CollectionConfig}
   */
  collections: z.record(CollectionConfigSchema).default({}),
  /**
   * @name base
   * @reference https://docs.astro.build/en/reference/configuration-reference/#base
   * @description
   * The base path to deploy to. Astro will use this path as the root for your pages and assets both in development and in production build.
   * @example
   * In the example below, `astro dev` will start your server at `/docs`.
   * 
   * ```js
   * {
   *   base: '/docs'
   * }
   * ```
   */
  base: z.string().optional(),
  /**
   * @name trailingSlash
   * @default `"ignore"`
   * @description
   *
   * Allows you to control the behavior for how trailing slashes should be handled on transformed urls:
   *   - `"always"` - Ensure urls always end with a trailing slash regardless of input
   *   - `"never"` - Ensure urls never end with a trailing slash regardless of input
   *   - `"ignore"` - Do not modify the url, trailing slash behavior will be determined by the file url itself or a custom slug if present.
   *
   * When set to `"ignore"` (the default), the following will occur:
   *   - If there is not a custom slug on the target file, the markdown link itself will determine if there is a trailing slash.
   *       - `[Example](./my-doc.md/)` will result in a trailing slash
   *       - `[Example](./my-doc.md)` will not result in a trailing slash
   *   - If there is a custom slug on the target file, the custom slug determines if there is a trailing slash.
   *       - `slug: my-doc/` will result in a trailing slash
   *       - `slug: my-doc` will not result in a trailing slash
   * @example
   * ```js
   * {
   *   // Use `always` mode
   *   trailingSlash: "always"
   * }
   * ```
   * @see {@link https://docs.astro.build/en/reference/configuration-reference/#trailingslash|Astro}
   */
  trailingSlash: z
    .union([z.literal("ignore"), z.literal("always"), z.literal("never")])
    .default("ignore"),
});

/** @type {import('./options.d.ts').ValidateOptions} */
export const validateOptions = (options) => {
  const result = OptionsSchema.safeParse(options || {});
  if (!result.success) {
    throw result.error;
  }

  return result.data;
};

/** @type {import('./options.d.ts').MergeCollectionOptions} */
export const mergeCollectionOptions = (collectionName, options) => {
  const config = options.collections[collectionName] || {};
  const { base = options.collectionBase, name = collectionName } = config;
  return {
    ...options,
    collectionBase: base,
    collectionName: name,
  };
};
