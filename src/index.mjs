import { visit } from "unist-util-visit";
import * as path from "path";
import { default as debugFn } from "debug";
import {
  replaceExt,
  isValidRelativeLink,
  splitPathFromQueryAndFragment,
  normaliseAstroOutputPath,
  isValidFile,
  generateSlug,
  resolveSlug,
  applyTrailingSlash,
  URL_PATH_SEPARATOR,
  FILE_PATH_SEPARATOR,
  shouldProcessFile,
  resolveCollectionBase,
  getMatter,
} from "./utils.mjs";
import { validateOptions, mergeCollectionOptions } from "./options.mjs";

// This package makes a lot of assumptions based on it being used with Astro

const debug = debugFn("astro-rehype-relative-markdown-links");

const PATH_SEGMENT_EMPTY = "";

/** @typedef {import('./options.d.ts').Options} Options */
/** @typedef {import('./options.d.ts').CollectionConfig} CollectionConfig */
/**
 * Rehype plugin for Astro to add support for transforming relative links in MD and MDX files into their final page paths.
 *
 * @type {import('unified').Plugin<[(Options | null | undefined)?], import('hast').Root>}
 * @see {@link Options}
 */
function astroRehypeRelativeMarkdownLinks(opts = {}) {
  const options = validateOptions(opts);

  return (tree, file) => {
    visit(tree, "element", (node) => {
      if (
        node.type !== "element" ||
        node.tagName !== "a" ||
        typeof node.properties.href !== "string" ||
        !node.properties.href
      ) {
        return;
      }

      const nodeHref = node.properties.href;
      const [urlPathPart, urlQueryStringAndFragmentPart] =
        splitPathFromQueryAndFragment(nodeHref);

      if (!isValidRelativeLink(urlPathPart)) {
        return;
      }

      const currentFile = file.history[0];
      const currentFileParsed = path.parse(currentFile);
      const currentFileDirectory = currentFileParsed.dir;

      const urlFilePath = path.resolve(currentFileDirectory, urlPathPart);
      if (!isValidFile(urlFilePath)) {
        return;
      }

      // read gray matter from href file
      const { slug: frontmatterSlug } = getMatter(urlFilePath);
      const contentDir = path.resolve(options.srcDir, "content");
      const trailingSlashMode = options.trailingSlash;

      /*
        By default, Astro assumes content collections are subdirectories of a content path which by default is src/content.
        It then treats all content in a content collection as relative to the collection itself, not the site.  For example,
        a page at /src/content/docs/foo/bar/my-page.md would have a slug of foo/bar/my-page rather than docs/foo/bar/my-page
        as foo/bar/my-page is the path relative to the content collection.  This allows Astro to map content collections to
        multiple page paths (e.g., /pages/blog/[...slug].astro) & /pages/[year]/[month]/[day]/[slug].astro) to enable reusing
        content collections.

        Given this, we need to extract the collection name and include it in the generated path.  Since we don't have internal
        info, we have to make an assumption that the site page path is mapped directly to a path that starts with the collection
        name followed by the slug of the content collection page.  We do this by following Astro's own assumptions on the directory
        structure of content collections - they are subdirectories of content path.

        We make an expection to the above approach when collectionPathMode is `root` and instead, treat the content collection
        as the site root so we do not include the content collection physical directory name in the transformed url.  For example,
        with a content collection page of of src/content/docs/page-1.md, if the collectionPathMode is `root`, the url would be
        `/page-1` whereas with collectionPathMode of `subdirectory`, it would be `/docs/page-1`.

        KNOWN LIMITATIONS/ISSUES
        - Astro allows pages within a content collection to be excluded (see https://docs.astro.build/en/guides/routing/#excluding-pages).
        We currently do not adhere to this logic (See https://docs.astro.build/en/guides/routing/#excluding-pages).
        - Astro allows mapping a content collection to multiple site paths (as mentioned above).  The current approach of this library
        assumes that page paths always align 1:1 to their corresponding content collection paths based on physical directory name.  For
        example, if you have a content collection at src/content/blogs but your site page path is at /pages/my-blog/[...slug].astro,
        the default functionality of this library will not work currently.  See https://github.com/vernak2539/astro-rehype-relative-markdown-links/issues/24.
      */

      // determine the path of the target file relative to the content path
      const relativeToContentPath = path.relative(contentDir, urlFilePath);
      // based on relative path to content dir, check if we should exclude the file
      if (!shouldProcessFile(relativeToContentPath)) {
        return;
      }

      // When collectionPathMode is:
      //   - `root`: We assume the content collection is located in the root of the site so there is no collection name in the page path,
      //             the collection path is equivalent to the site root path
      //   - `subdirectory` - Determine the collection name using Astros default assumption that content collections are subdirs of content path
      //                      when the collectionPathMode is `subdirectory` or
      const collectionName = path
        .dirname(relativeToContentPath)
        .split(FILE_PATH_SEPARATOR)[0];
      // flatten options merging any collection overrides
      const collectionOptions = mergeCollectionOptions(collectionName, options);
      // determine the path of the target file relative to the collection
      // since the slug for content collection pages is always relative to collection root
      const collectionDir = path.join(contentDir, collectionName);
      const relativeToCollectionPath = path.relative(
        collectionDir,
        urlFilePath,
      );
      // md/mdx extentions should not be in the final url
      const withoutFileExt = replaceExt(relativeToCollectionPath, "");
      // each path segment should be individulally sluggified
      const pathSegments = withoutFileExt.split(FILE_PATH_SEPARATOR);
      // Astro generates a slug for each page on the site as a fallback if the page does not have a custom slug
      const generatedSlug = generateSlug(pathSegments);
      // if we have a custom slug, use it, else use the default
      const resolvedSlug = resolveSlug(generatedSlug, frontmatterSlug);
      // determine the collection base based on specified options
      const resolvedCollectionBase = resolveCollectionBase(collectionOptions, {
        currentFile,
        collectionDir,
      });

      // content collection slugs are relative to content collection root (or site root if collectionPathMode is `root`)
      // so build url including the content collection name (if applicable) and the pages slug
      // NOTE - When there is a content collection name being applied, this only handles situations where the physical
      //        directory name of the content collection maps 1:1 to the site page path serviing the content collection
      //        page (see details above)
      const resolvedUrl = [resolvedCollectionBase, resolvedSlug].join(
        URL_PATH_SEPARATOR,
      );

      // slug of empty string ('') is a special case in Astro for root page (e.g., index.md) of a collection
      let webPathFinal = applyTrailingSlash(
        (frontmatterSlug === PATH_SEGMENT_EMPTY
          ? URL_PATH_SEPARATOR
          : frontmatterSlug) || urlPathPart,
        resolvedUrl,
        trailingSlashMode,
      );

      if (urlQueryStringAndFragmentPart) {
        webPathFinal += urlQueryStringAndFragmentPart;
      }

      webPathFinal = normaliseAstroOutputPath(webPathFinal, collectionOptions);

      // Debugging
      debug("--------------------------------------");
      debug("BasePath                             : %s", options.basePath);
      debug("SrcDir                               : %s", options.srcDir);
      debug("ContentDir                           : %s", contentDir);
      debug("CollectionDir                        : %s", collectionDir);
      debug("Collection Name from Disk            : %s", collectionName);
      debug(
        "Resolved Collection Name Option      : %s",
        collectionOptions.collectionName,
      );
      debug(
        "Resolved Collection Base Option      : %s",
        collectionOptions.collectionBase,
      );
      debug(
        "Resolved Collection Base             : %s",
        resolvedCollectionBase,
      );
      debug("TrailingSlashMode                    : %s", trailingSlashMode);
      debug("md/mdx AST Current File              : %s", currentFile);
      debug("md/mdx AST Current File Dir          : %s", currentFileDirectory);
      debug("md/mdx AST href full                 : %s", nodeHref);
      debug("md/mdx AST href path                 : %s", urlPathPart);
      debug(
        "md/mdx AST href qs and/or hash       : %s",
        urlQueryStringAndFragmentPart,
      );
      debug("URL file                             : %s", urlFilePath);
      debug("URL file relative to content path    : %s", relativeToContentPath);
      debug(
        "URL file relative to collection path : %s",
        relativeToCollectionPath,
      );
      debug("URL file custom slug                 : %s", frontmatterSlug);
      debug("URL file generated slug              : %s", generatedSlug);
      debug("URL file resolved slug               : %s", resolvedSlug);
      debug("Final URL                            : %s", webPathFinal);

      node.properties.href = webPathFinal;
    });
  };
}

export default astroRehypeRelativeMarkdownLinks;
