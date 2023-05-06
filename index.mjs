import { visit } from "unist-util-visit";
import * as path from "path";
import * as fs from "fs";
import { default as matter } from "gray-matter";
import { default as debugFn } from "debug";

// This package makes a lot of assumptions based on it being used with Astro

const debug = debugFn("astro-rehype-relative-markdown-links");

function replaceExt(npath, ext) {
  if (typeof npath !== "string") {
    return npath;
  }

  if (npath.length === 0) {
    return npath;
  }

  const nFileName = path.basename(npath, path.extname(npath)) + ext;
  const nFilepath = path.join(path.dirname(npath), nFileName);

  // Because `path.join` removes the head './' from the given path.
  // This removal can cause a problem when passing the result to `require` or
  // `import`.
  if (startsWithSingleDot(npath)) {
    return "." + path.sep + nFilepath;
  }

  return nFilepath;
}

function startsWithSingleDot(fpath) {
  const first2chars = fpath.slice(0, 2);
  return first2chars === "." + path.sep || first2chars === "./";
}

function isValidRelativeLink(link) {
  const validExtensions = [".md", ".mdx"];

  return (
    link &&
    validExtensions.includes(path.extname(link)) &&
    !path.isAbsolute(link)
  );
}

function getPathWithoutQueryOrHash(url) {
  const indexQuery = url.indexOf("?");
  const indexHash = url.indexOf("#");

  if (indexQuery === -1 && indexHash === -1) {
    return [url, null];
  }

  let firstCharacterIndex;

  if (indexQuery !== -1 && indexHash === -1) {
    firstCharacterIndex = indexQuery;
  } else if (indexQuery === -1 && indexHash !== -1) {
    firstCharacterIndex = indexHash;
  } else {
    firstCharacterIndex = indexQuery < indexHash ? indexQuery : indexHash;
  }

  const splitUrl = url.substring(0, firstCharacterIndex);
  const splitQueryStringAndHash = url.substring(firstCharacterIndex);

  return [splitUrl, splitQueryStringAndHash];
}

// This is very specific to Astro
const contentPath = ["src", "content"].join(path.sep);

function rehypeAstroRelativeMarkdownLinks(options = {}) {
  return (tree, file) => {
    visit(tree, "element", (node) => {
      const nodeHref = node.properties.href;

      if (!nodeHref) {
        return;
      }

      const [url, queryStringAndHash] = getPathWithoutQueryOrHash(nodeHref);

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

      // TODO: Test for windows paths

      // read gray matter from relative file
      const relativeFileContent = fs.readFileSync(relativeFile);
      const { data: frontmatter } = matter(relativeFileContent);
      const relativeFileCustomSlug = frontmatter.slug;
      const relativeFileHasCustomSlug = Boolean(relativeFileCustomSlug);

      let webPathFinal;
      const webPath = relativeFile.split(contentPath)[1];

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

      webPathFinal = webPathFinal.split(path.sep).join(path.posix.sep);

      if (queryStringAndHash) {
        webPathFinal += queryStringAndHash;
      }

      // Debugging
      debug("--------------------------------");
      debug("md/mdx AST Current File        : %s", currentFile);
      debug("md/mdx AST Current File Dir    : %s", currentFileDirectory);
      debug("md/mdx AST href full           : %s", nodeHref);
      debug("md/mdx AST href path           : %s", url);
      debug("md/mdx AST href qs and/or hash : %s", queryStringAndHash);
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
