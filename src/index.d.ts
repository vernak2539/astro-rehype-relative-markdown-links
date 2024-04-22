import type { Plugin } from "unified";
import type { Root } from "hast";
import type { Options, CollectionConfig } from "./options.d.ts";

export { Options, CollectionConfig };

/**
 * Rehype plugin for Astro to add support for transforming relative links in MD and MDX files into their final page paths.
 *
 * @see {@link Options}
 */
declare const astroRehypeRelativeMarkdownLinks: Plugin<
  [(Options | null | undefined)?],
  Root
>;
export default astroRehypeRelativeMarkdownLinks;
