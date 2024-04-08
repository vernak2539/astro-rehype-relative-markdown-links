type CollectionPathMode = 'subdirectory' | `root`

export interface Options {
  contentPath?: string; // where you store your content relative to the root directory
	/**
	 * @docs
	 * @name collectionPathMode
	 * @type {CollectionPathMode}
	 * @default `'subdirectory'`
	 * @description
	 *
	 * Where you store your collections:
	 *   - `'subdirectory'` - Subdirectories under `contentPath` (ex: "src/content/docs/index.md" where docs is the content collection subdirectory of the contentPath src/content)
	 *   - `'root'` - Directly inside `contentPath` (ex. src/content/index.md where src/content is the contentPath)
	 *
	 * Use the `root` configuration option when you are treating a single content collection as if it where located in the site root.  In most scenarios, you should set this
	 * value to `subdirectory` or not set this value and the default of `subdirectory` will be used.
	 *
	 * ```js
	 * {
	 *   // Example: Use `subdirectory` mode
	 *   collectionPathMode: `subdirectory`
	 * }
	 * ```
	 */
  collectionPathMode?: CollectionPathMode;
  basePath?: string; // https://docs.astro.build/en/reference/configuration-reference/#base
}
