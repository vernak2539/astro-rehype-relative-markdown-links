import path from "path";
import { statSync } from "fs";
import { slug as githubSlug } from "github-slugger";
import { z } from "zod";
import { asError } from "catch-unknown";

const validMarkdownExtensions = [".md", ".mdx"];
const isWindows =
  typeof process !== "undefined" && process.platform === "win32";
const windowsSlashRE = /\\/g;

/** @type {import('./utils.d.ts').Slash} */
function slash(npath, sep) {
  return npath.replace(windowsSlashRE, sep);
}

/** @type {import('./utils.d.ts').NormalizePath} */
function normalizePath(npath) {
  return path.posix.normalize(isWindows ? slash(npath, path.posix.sep) : npath);
}

/** @type {string} */
export const FILE_PATH_SEPARATOR = path.sep;

/** @type {string} */
export const URL_PATH_SEPARATOR = "/";

/** @type {import('./utils.d.ts').ReplaceExtFn} */
export const replaceExt = (npath, ext) => {
  if (typeof npath !== "string" || npath.length === 0) {
    return npath;
  }

  return npath.replace(new RegExp(path.extname(npath) + "$"), ext);
};

/** @type {import('./utils.d.ts').IsValidRelativeLinkFn} */
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

/** @type {import('./utils.d.ts').IsValidFile} */
export const isValidFile = (path) => {
  if (!path) {
    return false;
  }

  try {
    return statSync(path).isFile();
  } catch (err) {
    const error = asError(err);
    if ("code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
};

/** @type {import('./utils.d.ts').SplitPathFromQueryAndFragmentFn} */
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

/** @type {import('./utils.d.ts').NormaliseAstroOutputPath} */
export const normaliseAstroOutputPath = (initialPath, collectionOptions) => {
  const buildPath = () => {
    if (!collectionOptions.basePath) {
      return initialPath;
    }

    if (collectionOptions.basePath.startsWith(URL_PATH_SEPARATOR)) {
      return path.join(collectionOptions.basePath, initialPath);
    }

    return (
      URL_PATH_SEPARATOR + path.join(collectionOptions.basePath, initialPath)
    );
  };

  if (!initialPath) {
    return initialPath;
  }

  return normalizePath(buildPath());
};

/** @type {import('./utils.d.ts').GenerateSlug} */
export const generateSlug = (pathSegments) => {
  return pathSegments
    .map((segment) => githubSlug(segment))
    .join(URL_PATH_SEPARATOR)
    .replace(/\/index$/, "");
};

/** @type {import('./utils.d.ts').ResolveSlug} */
export const resolveSlug = (generatedSlug, frontmatterSlug) => {
  return z.string().default(generatedSlug).parse(frontmatterSlug);
};

/** @type {import('./utils.d.ts').ApplyTrailingSlash} */
export const applyTrailingSlash = (
  origUrl,
  resolvedUrl,
  trailingSlash = "ignore",
) => {
  const hasTrailingSlash = resolvedUrl.endsWith(URL_PATH_SEPARATOR);

  if (trailingSlash === "always") {
    return hasTrailingSlash ? resolvedUrl : resolvedUrl + URL_PATH_SEPARATOR;
  }

  if (trailingSlash === "never") {
    return hasTrailingSlash ? resolvedUrl.slice(0, -1) : resolvedUrl;
  }

  const hadTrailingSlash = origUrl.endsWith(URL_PATH_SEPARATOR);
  if (hadTrailingSlash && !hasTrailingSlash) {
    return resolvedUrl + URL_PATH_SEPARATOR;
  }

  if (!hadTrailingSlash && hasTrailingSlash) {
    return resolvedUrl.slice(0, -1);
  }

  return resolvedUrl;
};

/** @type {import('./utils.d.ts').ShouldProcessFile} */
export function shouldProcessFile(npath) {
  // Astro excludes files that include underscore in any segment of the path under contentDIr
  // see https://github.com/withastro/astro/blob/0fec72b35cccf80b66a85664877ca9dcc94114aa/packages/astro/src/content/utils.ts#L253
  return !npath.split(path.sep).some((p) => p && p.startsWith("_"));
}

/** @type {import('./utils.d.ts').ResolveCollectionBase} */
export function resolveCollectionBase(collectionOptions) {
  return collectionOptions.collectionBase === false
    ? ""
    : URL_PATH_SEPARATOR + collectionOptions.collectionName;
}
