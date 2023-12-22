import path from "path"

const pathSeparator = path.sep;
const validMarkdownExtensions = [".md", ".mdx"];

function isCurrentDirectory(fpath) {
  const first2chars = fpath.slice(0, 2);
  return first2chars === "." + pathSeparator || first2chars === "./";
}

export const replaceExt = (npath, ext) => {
  if (typeof npath !== "string") {
    return npath;
  }

  if (npath.length === 0) {
    return npath;
  }

  const nFileName = path.basename(npath, path.extname(npath)) + ext;
  const nFilepath = path.join(path.dirname(npath), nFileName);

  // Because `path.join` removes the head './' from the given path.
  if (isCurrentDirectory(npath)) {
    return `.${pathSeparator}${nFilepath}`
  }


  return nFilepath;
}

export const isValidRelativeLink = (link) => {
  if (!link) {
    return false
  }

  if (!validMarkdownExtensions.includes(path.extname(link))) {
    return false
  }

  if (path.isAbsolute(link)) {
    return false
  }

  return true
}
