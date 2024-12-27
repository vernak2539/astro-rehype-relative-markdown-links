import { z } from "zod";

const CollectionBase = z.union([z.literal("name"), z.literal(false)]);

export const CollectionConfigSchema = z.object({
  /**
   * Override the top-level {@link Options#collectionBase collectionBase} option for this collection.
   */
  base: CollectionBase.optional(),
  /**
   * Override the name of the collection from disk.
   *
   * Use this option when your collection page path does not correspond to the name of the collection on disk (ex. `src/content/docs/reference.md` resolves to a page path of `/my-docs/reference`).
   *
   * When not specified, the name of the collection from disk will be used where applicable.
   */
  name: z.string().optional(),
});

export const OptionsSchema = z.object({
  /**
   * Set the directory that Astro will read your site from.
   *
   * The value can be either an absolute file system path or a path relative to the project root.
   * @default `./src`
   * @see {@link https://docs.astro.build/en/reference/configuration-reference/#srcdir}
   * @example
   * ```js
   * {
   *   srcDir: './www'
   * }
   * ```
   */
  srcDir: z.string().default("./src"),
  /**
   * Set how the base segment of the URL path to the referenced markdown file should be derived:
   *   - `"name"` - Apply the name on disk of the content collection (ex. `./guides/my-guide.md` referenced from `./resources/my-reference.md` in the content collection `docs` would resolve to the path `/docs/guides/my-guide`)
   *   - `false` - Do not apply a base (ex. `./guides/my-guide.md` referenced from `./resources/my-reference.md` in the content collection `docs` would resolve to the path `/guides/my-guide`)
   *
   * Use `false` when you are treating your content collection as if it were located in the site root (ex: `src/pages`). In most scenarios, you should set this value to `"name"` or not
   * set this value and the default of `"name"` will be used.
   *
   * Note that this is a top-level option and will apply to all content collections.  If you have multiple content collections and want the behavior to be different on a per content collection basis, add the collection(s) to
   * the {@link Options#collections collections} option and provide a value for the {@link CollectionConfig#base base} property.
   * @default `"name"`
   * @see {@link Options#collections collections}
   * @example
   * ```js
   * {
   *   // Do not apply a base segment to the transformed URL path
   *   collectionBase: false
   * }
   * ```
   */
  collectionBase: CollectionBase.default("name"),
  /**
   * Specify a mapping of collections where the key is the name of a collection on disk and the value is an object of collection specific configuration which will override any top-level
   * configuration where applicable.
   * @default `{}`
   * @see {@link CollectionConfig}
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
   */
  collections: z.record(CollectionConfigSchema).default({}),
  /**
   * The base path to deploy to. Astro will use this path as the root for your pages and assets both in development and in production build.
   * @see {@link https://docs.astro.build/en/reference/configuration-reference/#base}
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
   * @default `"ignore"`
   * @see {@link https://docs.astro.build/en/reference/configuration-reference/#trailingslash}
   * @example
   * ```js
   * {
   *   // Use `always` mode
   *   trailingSlash: "always"
   * }
   * ```
   */
  trailingSlash: z
    .union([z.literal("ignore"), z.literal("always"), z.literal("never")])
    .default("ignore"),
});

/** Collection specific options */
export type CollectionConfig = z.input<CollectionConfigSchemaType>;
type CollectionConfigSchemaType = typeof CollectionConfigSchema;

/** General options */
export type Options = z.input<OptionsSchemaType>;
type OptionsSchemaType = typeof OptionsSchema;

interface EffectiveOptions extends z.infer<OptionsSchemaType> {}
export interface EffectiveCollectionOptions
  extends Omit<EffectiveOptions, "collections"> {
  collectionName: string;
}

export const validateOptions = (
  options: Options | null | undefined
): EffectiveOptions => {
  const result = OptionsSchema.safeParse(options || {});
  if (!result.success) {
    throw result.error;
  }

  return result.data;
};

export const mergeCollectionOptions = (
  collectionName: string,
  options: EffectiveOptions
): EffectiveCollectionOptions => {
  const config = options.collections[collectionName] || {};
  const { base = options.collectionBase, name = collectionName } = config;
  return {
    ...options,
    collectionBase: base,
    collectionName: name,
  };
};
