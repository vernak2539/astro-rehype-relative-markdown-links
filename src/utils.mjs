import path from "path";
import { statSync } from "fs";
import { slug as githubSlug } from "github-slugger";
import { z } from 'zod';

const pathSeparator = path.sep;
const validMarkdownExtensions = [".md", ".mdx"];

/** @type {import('./utils').IsCurrentDirectoryFn} */
function isCurrentDirectory(fpath) {
  const first2chars = fpath.slice(0, 2);
  return first2chars === "." + pathSeparator || first2chars === "./";
}

/** @type {import('./utils').ReplaceExtFn} */
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
    return `.${pathSeparator}${nFilepath}`;
  }

  return nFilepath;
};

/** @type {import('./utils').IsValidRelativeLinkFn} */
export const isValidRelativeLink = (link) => {
  if (!link) {
    return false;
  }

  if (!validMarkdownExtensions.includes(path.extname(link))) {
    return false;
  }

  if (path.isAbsolute(link)) {
    return false;
  }

  return true;
};

/** @type {import('./utils').IsValidFile} */
export const isValidFile = (path) => {
  if (!path) {
    return false;
  }

  try {
    return statSync(path).isFile();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
};

/** @type {import('./utils').SplitPathFromQueryAndFragmentFn} */
export const splitPathFromQueryAndFragment = (url) => {
  const indexQuery = url.indexOf("?");
  const indexHash = url.indexOf("#");

  if (indexQuery === -1 && indexHash === -1) {
    return [decodeURI(url), null];
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

  return [decodeURI(splitUrl), splitQueryStringAndHash];
};

/**
 * @param {string} initialPath
 * @param {import('./index').Options} options
 */
export const normaliseAstroOutputPath = (initialPath, options = {}) => {
  if (!initialPath || typeof initialPath !== "string") {
    return;
  }

  if (!options.basePath) {
    return initialPath;
  }

  if (options.basePath.startsWith("/")) {
    return path.join(options.basePath, initialPath);
  }

  return "/" + path.join(options.basePath, initialPath);
};

/** @type {import('./utils').GenerateSlug} */
export const generateSlug = (pathSegments) => {
  return pathSegments
    .map((segment) => githubSlug(segment))
    .join("/")
    .replace(/\/index$/, '');
}

/** @type {import('./utils').ResolveSlug} */
export const resolveSlug = (generatedSlug, frontmatterSlug) => {
  return z.string().default(generatedSlug).parse(frontmatterSlug);
}