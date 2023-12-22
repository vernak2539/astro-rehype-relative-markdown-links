import { visit } from "unist-util-visit";
import * as path from "path";
import * as fs from "fs";
import { default as matter } from "gray-matter";
import { default as debugFn } from "debug";
import { replaceExt, isValidRelativeLink, splitPathFromQueryAndFragment } from "./utils.mjs";

// This package makes a lot of assumptions based on it being used with Astro

const debug = debugFn("astro-rehype-relative-markdown-links");

// This is very specific to Astro
const defaultContentPath = ["src", "content"].join(path.sep);

function rehypeAstroRelativeMarkdownLinks(options = {}) {
  return (tree, file) => {
    visit(tree, "element", (node) => {
      const nodeHref = node.properties.href;

      if (!nodeHref) {
        return;
      }

      const [url, queryStringAndFragment] = splitPathFromQueryAndFragment(nodeHref);

      if (!isValidRelativeLink(url)) {
        return;
      }

      const currentFile = file.history[0];
      const currentFileParsed = path.parse(currentFile);
      const currentFileName = `${currentFileParsed.name}${currentFileParsed.ext}`;
      const currentFileDirectory = currentFile.replace(currentFileName, "");
      const relativeFile = path.resolve(currentFileDirectory, url);
      const relativeFileExists = fs.existsSync(relativeFile);

      if (!relativeFileExists) {
        return;
      }

      // read gray matter from relative file
      const relativeFileContent = fs.readFileSync(relativeFile);
      const { data: frontmatter } = matter(relativeFileContent);
      const relativeFileCustomSlug = frontmatter.slug;
      const relativeFileHasCustomSlug = Boolean(relativeFileCustomSlug);

      let webPathFinal;
      const webPath = relativeFile.split(options.contentPath || defaultContentPath)[1];

      if (relativeFileHasCustomSlug) {
        webPathFinal =
          path.posix.sep +
          [
            webPath.split(path.sep)[1], // this should be the content collection
            relativeFileCustomSlug,
          ].join(path.posix.sep);
      } else {
        webPathFinal = replaceExt(webPath, "");
      }

      webPathFinal = webPathFinal.split(path.sep)

      // Remove index from the end of the path to satsify instances where we'll be generating
      // index.html files for directories'
      if (webPathFinal[webPathFinal.length - 1] === "index") {
        webPathFinal.pop()
      }

      webPathFinal = webPathFinal.join(path.posix.sep);

      if (queryStringAndFragment) {
        webPathFinal += queryStringAndFragment;
      }

      // Debugging
      debug("--------------------------------");
      debug("md/mdx AST Current File        : %s", currentFile);
      debug("md/mdx AST Current File Dir    : %s", currentFileDirectory);
      debug("md/mdx AST href full           : %s", nodeHref);
      debug("md/mdx AST href path           : %s", url);
      debug("md/mdx AST href qs and/or hash : %s", queryStringAndFragment);
      debug("File relative to current md/mdx: %s", relativeFile);
      debug("File relative has custom slug  : %s", relativeFileHasCustomSlug);
      if (relativeFileHasCustomSlug) {
        debug("File relative custom slug      : %s", relativeFileCustomSlug);
      }
      debug("Final URL path                 : %s", webPathFinal);

      node.properties.href = webPathFinal;
    });
  };
}

export default rehypeAstroRelativeMarkdownLinks;
