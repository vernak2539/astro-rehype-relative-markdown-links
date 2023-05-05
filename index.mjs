import { visit } from "unist-util-visit";
import * as path from "path";
import * as fs from "fs";
import { default as matter } from "gray-matter";

// This package makes a lot of assumptions based on it being used with Astro

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

      let webPathFinal;
      const webPath = relativeFile.split(contentPath)[1];

      if (relativeFileCustomSlug) {
        webPathFinal =
          "/" +
          [
            webPath.split(path.sep)[1], // this should be the content collection
            relativeFileCustomSlug,
          ].join("/");
      } else {
        webPathFinal = replaceExt(webPath, "");
      }

      webPathFinal = webPathFinal.split(path.sep).join(path.posix.sep);

      if (queryStringAndHash) {
        webPathFinal += queryStringAndHash;
      }

      // Debugging
      console.log("markdown path: ", url);
      console.log("current file: ", currentFile);
      console.log("current file dir: ", currentFileDirectory);
      console.log("relative file: ", relativeFile);
      console.log(
        "relative file has custom slug: ",
        Boolean(relativeFileCustomSlug)
      );
      console.log("relative file custom slug: ", relativeFileCustomSlug);
      console.log("FINAL PATH: ", webPathFinal);
      console.log("-----------------");
      console.log("");

      node.properties.href = webPathFinal;
    });
  };
}

export default rehypeAstroRelativeMarkdownLinks;
