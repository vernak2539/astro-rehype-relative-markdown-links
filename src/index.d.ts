export type CollectionPathMode = "subdirectory" | "root";

export interface Options {
  /**
   * @name contentPath
   * @type {string}
   * @default `src/content`
   * @description
   *
   * This defines where the content (i.e. md, mdx, etc. files) is stored. This should be a path relative to the root directory
   */
  contentPath?: string;
  /**
   * @name collectionPathMode
   * @type {CollectionPathMode}
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
  collectionPathMode?: CollectionPathMode;
  /**
   * @name basePath
   * @type {string}
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
  basePath?: string;
}
