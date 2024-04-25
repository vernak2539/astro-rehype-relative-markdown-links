import path from "path";
import { readFileSync, statSync } from "fs";
import { slug as githubSlug } from "github-slugger";
import { z } from "zod";
import { asError } from "catch-unknown";
import matter from "gray-matter";

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

/** @type {import('./utils.d.ts').GetCurrentFileSlugDirPath} */
function getCurrentFileSlugDirPath(processingDetails) {
  /*
    To determine "where we are", we use the slug from the current file (if there is one) or we use the physical path on disk of 
    the current file. Note that if Astro's getStaticPaths is manipulating the slug in a way that is not consistent with the slug 
    in the file or the structure on disk, relative path resolution may be incorrect.  This is no different than any other part 
    of this plugin since we assume across the board that the page paths are either the path from the slug or the path of the 
    physical file ondisk, either relative to the collection directory itself.  
  */
  const { currentFile, collectionDir } = processingDetails;
  const { slug: frontmatterSlug } = getMatter(currentFile);
  const relativeToCollectionPath = path.relative(collectionDir, currentFile);

  /*
    resolveSlug will ensure that any custom slug present is valid or return the file path if no custom slug is present. We don't 
    generate an actual slug for the file path on disk for a few reasons:
    1. It could modify the number of path segments (e.g., strip periods from relative ('.', '..') segments, etc.) which would cause 
        relative path resolution to be incorrect
    2. Don't need the actual slug because we're not building a webpath from it, we only need the correct number of path segments so
        we can build the proper relative path to the collection directory from where we are
    3. The number of segments in the generated slug and the actual file path would be the same regardless
  */
  const resolvedSlug = resolveSlug(relativeToCollectionPath, frontmatterSlug);

  // append the resolved slug to the collecton directory to create a fully qualified path
  const resolvedSlugPath = path.join(collectionDir, resolvedSlug);

  // get the directory containing the page - note that the page itself could be a directory in the URL world but in the file
  // world its a file and we need to determine how many directories to travel to get to the collection directory
  return path.dirname(resolvedSlugPath);
}

/**
 * Build a relative path that takes us from "where we are" to the "collection directory".
 *
 * For example, if we are in `/src/content/docs/foo/bar/test.md`, "we are at" `/docs/foo/bar/test`
 * and the "collection directory" would be `../..`.  Similarly, if "we are at" `/docs/foo/test.md`,
 * the "collection directory" would be `.`.
 *
 * @type {import('./utils.d.ts').getRelativePathFromCurrentFileToCollection}
 */
function getRelativePathFromCurrentFileToCollection(processingDetails) {
  // "where we are"
  const resolvedSlugDirPath = getCurrentFileSlugDirPath(processingDetails);
  // determine relative path from current file "directory" to the collection directory
  // resolving to current directory ('.') if the page is in the root of the collection directory
  return (
    path.relative(resolvedSlugDirPath, processingDetails.collectionDir) || "."
  );
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
    if (
      !collectionOptions.basePath ||
      collectionOptions.collectionBase === "collectionRelative"
    ) {
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
export function resolveCollectionBase(collectionOptions, processingDetails) {
  return collectionOptions.collectionBase === false
    ? ""
    : collectionOptions.collectionBase === "collectionRelative"
      ? getRelativePathFromCurrentFileToCollection(processingDetails)
      : URL_PATH_SEPARATOR + collectionOptions.collectionName;
}

/** @type {Record<string, import('./utils.d.ts').MatterData>} */
const matterCache = {};
const matterCacheEnabled = process.env.MATTER_CACHE_DISABLE !== "true";
/** @type {import('./utils.d.ts').GetMatter} */
export function getMatter(npath) {
  const readMatter = () => {
    const content = readFileSync(npath);
    const { data: frontmatter } = matter(content);
    if (matterCacheEnabled) {
      matterCache[npath] = frontmatter;
    }
    return frontmatter;
  };

  return matterCache[npath] || readMatter();
}
