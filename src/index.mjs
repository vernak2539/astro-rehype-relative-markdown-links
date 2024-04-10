import { visit } from "unist-util-visit";
import * as path from "path";
import * as fs from "fs";
import { default as matter } from "gray-matter";
import { default as debugFn } from "debug";
import {
  replaceExt,
  isValidRelativeLink,
  splitPathFromQueryAndFragment,
  normaliseAstroOutputPath,
  isValidFile,
  generateSlug,
  resolveSlug,
} from "./utils.mjs";

// This package makes a lot of assumptions based on it being used with Astro

const debug = debugFn("astro-rehype-relative-markdown-links");

// This is very specific to Astro
const defaultContentPath = ["src", "content"].join(path.sep);

/** @param {import('./index').Options} options */
function astroRehypeRelativeMarkdownLinks(options = {}) {
  return (tree, file) => {
    visit(tree, "element", (node) => {
      const nodeHref = node.properties.href;

      if (!nodeHref) {
        return;
      }

      const [url, queryStringAndFragment] =
        splitPathFromQueryAndFragment(nodeHref);

      if (!isValidRelativeLink(url)) {
        return;
      }

      const currentFile = file.history[0];
      const currentFileParsed = path.parse(currentFile);
      const currentFileName = `${currentFileParsed.name}${currentFileParsed.ext}`;
      const currentFileDirectory = currentFile.replace(currentFileName, "");

      const relativeFile = path.resolve(currentFileDirectory, url);
      const relativeFileExists = isValidFile(relativeFile);

      if (!relativeFileExists) {
        return;
      }

      // read gray matter from relative file
      const relativeFileContent = fs.readFileSync(relativeFile);
      const { data: frontmatter } = matter(relativeFileContent);
      const frontmatterSlug = frontmatter.slug;
      const contentDir = options.contentPath || defaultContentPath;

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

        KNOWN LIMITATIONS/ISSUES
        - Astro allows pages within a content collection to be excluded (see https://docs.astro.build/en/guides/routing/#excluding-pages).  
        We currently do not adhere to this logic (See https://docs.astro.build/en/guides/routing/#excluding-pages).
        - Astro allows mapping a content collection to multiple site paths (as mentioned above).  The current approach of this library
        assumes that page paths always align 1:1 to their corresponding content collection paths based on physical directory name.  For 
        example, if you have a content collection at src/content/blogs but your site page path is at /pages/my-blog/[...slug].astro,
        the default functionality of this library will not work currently.  See https://github.com/vernak2539/astro-rehype-relative-markdown-links/issues/24.
      */

      // determine the path of the target file relative to the content path
      const relativeToContentPath = path.relative(contentDir, relativeFile);
      // determine the collection name using Astros default assumption that content collections are subdirs of content path
      const collectionName = path.dirname(relativeToContentPath).split(path.posix.sep)[0];
      // determine the path of the target file relative to the collection
      // since the slug for content collection pages is always relative to collection root
      const relativeToCollectionPath = path.relative(collectionName, relativeToContentPath);
      // md/mdx extentions should not be in the final url
      const withoutFileExt = replaceExt(relativeToCollectionPath, "")
      // each path segment should be individulally sluggified
      const pathSegments = withoutFileExt.split(path.posix.sep);
      // Astro generates a slug for each page on the site as a fallback if the page does not have a custom slug
      const generatedSlug = generateSlug(pathSegments);
      // if we have a custom slug, use it, else use the default
      const resolvedSlug = resolveSlug(generatedSlug, frontmatterSlug);

      // content collection slugs are relative to content collection root
      // so build url including the content collection name and the pages slug
      // NOTE - This only handles situations where the name of the content collection is directly
      //        mapped to the site page serving the content collection page (see details above)
      let webPathFinal = path.posix.sep +
        [
          collectionName,
          resolvedSlug,
        ].join(path.posix.sep);

      if (queryStringAndFragment) {
        webPathFinal += queryStringAndFragment;
      }

      webPathFinal = normaliseAstroOutputPath(webPathFinal, options);

      // Debugging
      debug("--------------------------------");
      debug("md/mdx AST Current File         : %s", currentFile);
      debug("md/mdx AST Current File Dir     : %s", currentFileDirectory);
      debug("md/mdx AST href full            : %s", nodeHref);
      debug("md/mdx AST href path            : %s", url);
      debug("md/mdx AST href qs and/or hash  : %s", queryStringAndFragment);
      debug("File relative to current md/mdx : %s", relativeFile);
      debug("File relative custom slug       : %s", frontmatterSlug);
      debug("File relative generated slug    : %s", generatedSlug);
      debug("File relative resolved slug     : %s", resolvedSlug);
      debug("Final URL path                  : %s", webPathFinal);

      node.properties.href = webPathFinal;
    });
  };
}

export default astroRehypeRelativeMarkdownLinks;
