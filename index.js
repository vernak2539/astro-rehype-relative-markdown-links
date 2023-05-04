import { visit } from "unist-util-visit";
import * as path from "path";
import * as fs from "fs";

// This package makes a lot of assumptions based on it being used with Astro

function replaceExt(npath, ext) {
  if (typeof npath !== "string") {
    return npath;
  }

  if (npath.length === 0) {
    return npath;
  }

  var nFileName = path.basename(npath, path.extname(npath)) + ext;
  var nFilepath = path.join(path.dirname(npath), nFileName);

  // Because `path.join` removes the head './' from the given path.
  // This removal can cause a problem when passing the result to `require` or
  // `import`.
  if (startsWithSingleDot(npath)) {
    return "." + path.sep + nFilepath;
  }

  return nFilepath;
}

function startsWithSingleDot(fpath) {
  var first2chars = fpath.slice(0, 2);
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

// This is very specific to Astro
const contentPath = "src/content";

function rehypeAstroRelativeMarkdownLinks(options = {}) {
  return (tree, file) => {
    visit(tree, "element", (node) => {
      const url = node.properties.href;

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

      // TODO: this needs to be the relative file testing to see if it has a slug
      // const customSlug = file.data.astro.frontmatter.slug;
      //
      // if (customSlug) {
      //     webPathFinal = webPathFinal.split(path.sep).pop();
      //     webPathFinal = [webPathFinal, customSlug].join(
      //         path.sep
      //     );
      // }

      const webPath = relativeFile.split(contentPath)[1];
      const webPathFinal = replaceExt(webPath, "");

      // Debugging
      // console.log("markdown path: ", url);
      // console.log("current file: ", currentFile);
      // console.log("current file dir: ", currentFileDirectory);
      // console.log("relative file: ", relativeFile);
      // console.log("relative file exists: ", relativeFileExists);
      // console.log("new path: ", webPathFinal);

      node.properties.href = webPathFinal;
    });
  };
}

export default rehypeAstroRelativeMarkdownLinks;
