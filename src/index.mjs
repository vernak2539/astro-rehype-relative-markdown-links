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
  generateSlug,
  resolveSlug,
  applyTrailingSlash,
  isValidFile
} from "./utils.mjs";

// This package makes a lot of assumptions based on it being used with Astro

const debug = debugFn("astro-rehype-relative-markdown-links");

// This is very specific to Astro
const defaultContentPath = ["src", "content"].join(path.sep);

/** @type {import("./index").TrailingSlash} */
const defaultTrailingSlash = 'ignore';

/** @type {import("./index").CollectionPathMode} */
const defaultCollectionPathMode = 'subdirectory';

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
      const collectionPathMode = options.collectionPathMode || defaultCollectionPathMode;
      const relativeToContentPath = path.relative(contentDir, relativeFile);
      const collectionName = collectionPathMode === 'root' ? "" : path.dirname(relativeToContentPath).split(path.posix.sep)[0];
      const relativeToCollectionPath = path.relative(collectionName, relativeToContentPath);
      const withoutFileExt = replaceExt(relativeToCollectionPath, "")
      const pathSegments = withoutFileExt.split(path.posix.sep);
      const generatedSlug = generateSlug(pathSegments);
      const resolvedSlug = resolveSlug(generatedSlug, frontmatterSlug);
      const trailingSlashMode = options.trailingSlash || defaultTrailingSlash;

      const resolvedUrl =
        [
          !collectionName ? '' : (path.posix.sep + collectionName),
          resolvedSlug,
        ].join(path.posix.sep);
      
      // slug of empty string ('') is a special case in Astro for root page (e.g., index.md) of a collection
      let webPathFinal = applyTrailingSlash((frontmatterSlug === '' ? '/' : frontmatterSlug) || url, resolvedUrl, trailingSlashMode);

      if (queryStringAndFragment) {
        webPathFinal += queryStringAndFragment;
      }

      webPathFinal = normaliseAstroOutputPath(webPathFinal, options);

      // Debugging
      debug("--------------------------------");
      debug("ContentDir                         : %s", contentDir);
      debug("TrailingSlashMode                  : %s", trailingSlashMode);
      debug("CollectionPathMode                 : %s", collectionPathMode);
      debug("md/mdx AST Current File            : %s", currentFile);
      debug("md/mdx AST Current File Dir        : %s", currentFileDirectory);
      debug("md/mdx AST href full               : %s", nodeHref);
      debug("md/mdx AST href path               : %s", url);
      debug("md/mdx AST href qs and/or hash     : %s", queryStringAndFragment);
      debug("File relative to current md/mdx    : %s", relativeFile);
      debug("File relative to content path      : %s", relativeToContentPath);
      debug("Collection Name                    : %s", collectionName);
      debug("File relative to collection path   : %s", relativeToCollectionPath);
      debug("File relative custom slug          : %s", frontmatterSlug);
      debug("File relative generated slug       : %s", generatedSlug);
      debug("File relative resolved slug        : %s", resolvedSlug);
      debug("Final URL path                     : %s", webPathFinal);

      node.properties.href = webPathFinal;
    });
  };
}

export default astroRehypeRelativeMarkdownLinks;
