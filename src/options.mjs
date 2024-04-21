import { z } from "zod";
import path from "path";

export const OptionsSchema = z.object({
  /**
   * @name contentPath
   * @default `src/content`
   * @description
   *
   * This defines where the content (i.e. md, mdx, etc. files) is stored. This should be a path relative to the root directory
   */
  contentPath: z.string().default(["src", "content"].join(path.sep)),
  /**
   * @name collectionPathMode
   * @default `subdirectory`
   * @description
   *
   * Where you store your collections:
   *   - `subdirectory` - Subdirectories under `contentPath` (ex: `src/content/docs/index.md` where `docs` is the content collection subdirectory of the contentPath `src/content`)
   *   - `root` - Directly inside `contentPath` (ex: `src/content/docs/index.md` where `src/content/docs` is the `contentPath`)
   *
   * Use the `root` configuration option when you are explicitly setting the {@link contentPath} property to something other than `src/content` and you want the directory you specify
   * for {@link contentPath} to be treated a single content collection as if it where located in the site root.  In most scenarios, you should set this value to `subdirectory` or not
   * set this value and the default of `subdirectory` will be used.
   * @example
   * ```js
   * {
   *   // Use 'subdirectory' mode
   *   collectionPathMode: 'subdirectory'
   * }
   * ```
   */
  collectionPathMode: z
    .union([z.literal("subdirectory"), z.literal("root")])
    .default("subdirectory"),
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
