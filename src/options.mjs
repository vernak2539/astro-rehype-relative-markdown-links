import { z } from "zod";

const CollectionBase = z.union([
  z.literal("name"),
  z.literal("collectionRelative"),
  z.literal("pathRelative"),
  z.literal(false),
]);

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
   * Set how the URL path to the referenced markdown file should be derived:
   *   - `"name"` - An absolute path prefixed with the optional {@link basePath} followed by the collection name
   *   - `false` - An absolute path prefixed with the optional {@link basePath}
   *   - `"collectionRelative"` - A relative path from the collection directory
   *   - `"pathRelative"` - A relative path from the current page path
   *
   * For example, given a file `./guides/section/my-guide.md` referenced from `./guides/section/my-other-guide.md` with
   * the link `[My Guide](./my-guide.md)` in the content collection `docs`, the transformed url would be:
   *   - `"name"`: `[/basePath]/docs/guides/section/my-guide`
   *   - `false`: `[/basePath]/guides/section/my-guide`
   *   - `"collectionRelative"`: `../../guides/section/my-guide`
   *   - `"pathRelative"`: `my-guide`
   *
   * Use `false`, `"collectionRelative"`, or `"pathRelative"` when you are treating your content collection as if it were located in the site
   * root (ex: `src/content/docs/test.md` resolves to the page path `/test` instead of the typical `/docs/test`).
   *
   * Use `"collectionRelative"` or `"pathRelative"` when you are serving your content collection pages from multiple page path roots that use a
   * common content collection (ex: `/my-blog/test` and `/your-blog/test` both point to the file `./src/content/posts/test.md`
   * in the content collection `posts`).
   *
   * Important Notes:
   * - This is a top-level option and will apply to all content collections.  If you have multiple content collections
   * and want the behavior to be different on a per content collection basis, add the collection(s) to the {@link collections}
   * option and provide a value for collection specific {@link CollectionConfig base} option.
   * - When using either `"collectionRelative"` or `"pathRelative"`, due to the nature of relative links, you MUST ensure
   * that any directory paths in your site (e.g., urls to `index` pages), contain a trailing slash.  For example, given
   * `./src/content/docs/index.md`, the url should be `/docs/` and not `/docs` as any link generated on that page by the plugin
   * for a page inside of `./src/content/docs` directory will not navigate correctly since, in relative terms, `/docs` is
   * different than `/docs/`. Along this line, it is highly encouraged to apply `trailingSlash="always"` to your Astro site and
   * this plugin to help avoid relative pathing issues.
   * @example
   * ```js
   * {
   *   // Do not apply a collection name segment to the generated absolute URL path
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
   * Specify a mapping of collections where the `key` is the name of a collection on disk and the value is a {@link CollectionConfig}
   * which will override any top-level configuration where applicable.
   *
   * @example
   * ```js
   * {
   *   // Do not apply a collection name segment to the generated absolute URL path for the collection `docs`
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
   * @name basePath
   * @reference https://docs.astro.build/en/reference/configuration-reference/#base
   * @description
   * The base path to deploy to. Astro will use this path as the root for your pages and assets both in development and in production build.
   *
   * In the example below, `astro dev` will start your server at `/my-site`.
   *
   * ```js
   * {
   *   base: '/my-site'
   * }
   * ```
   */
  basePath: z.string().optional(),
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
