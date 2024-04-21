import { z } from "zod";

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
   * @name collectionPathMode
   * @default `subdirectory`
   * @description
   *
   * Set how the path to the referenced markdown file should be resolved:
   *   - `'subdirectory'` - Prefix the path with the name of the content collection (ex. `./guides/my-guide.md` referenced from `./resources/my-reference.md` in the content collection `docs` would resolve to the path `/docs/guides/my-guide`)
   *   - `'root'` - Resolve the path as the site root (ex. `./guides/my-guide.md` referenced from `./resources/my-reference.md` in the content collection `docs` would resolve to the path `/guides/my-guide`)
   *
   * Use the `subdirectory` configuration option when you are treating your content collection as if it were located in the site root (ex: `src/pages`). In most scenarios, you should set this value to `prefix` or not
   * set this value and the default of `prefix` will be used.
   * @example
   * ```js
   * {
   *   // Use 'root' mode
   *   collectionPathMode: 'root'
   * }
   * ```
   */
  collectionPathMode: z
    .union([z.literal("subdirectory"), z.literal("root")])
    .default("subdirectory"),
  /**
   * @name basePath
   * @reference https://docs.astro.build/en/reference/configuration-reference/#base
   * @description
   * The base path to deploy to. Astro will use this path as the root for your pages and assets both in development and in production build.
   *
   * In the example below, `astro dev` will start your server at `/docs`.
   *
   * ```js
   * {
   *   base: '/docs'
   * }
   * ```
   */
  basePath: z.string().optional(),
  /**
   * @name trailingSlash
   * @default `ignore`
   * @description
   *
   * Allows you to control the behavior for how trailing slashes should be handled on transformed urls:
   *   - `'always'` - Ensure urls always end with a trailing slash regardless of input
   *   - `'never'` - Ensure urls never end with a trailing slash regardless of input
   *   - `'ignore'` - Do not modify the url, trailing slash behavior will be determined by the file url itself or a custom slug if present.
   *
   * When set to `'ignore'` (the default), the following will occur:
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
   *   trailingSlash: `always`
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
