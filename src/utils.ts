import path from "path";
import { readFileSync, statSync } from "fs";
import { slug as githubSlug } from "github-slugger";
import { z } from "zod";
import { asError } from "catch-unknown";
import isAbsoluteUrl from "is-absolute-url";
import matter from "gray-matter";
import type { EffectiveCollectionOptions } from "./options";

type MatterData = { slug?: string };

const validMarkdownExtensions = [".md", ".mdx"];
const isWindows =
  typeof process !== "undefined" && process.platform === "win32";
const windowsSlashRE = /\\/g;

function slash(npath: string, sep: string): string {
  return npath.replace(windowsSlashRE, sep);
}

function normalizePath(npath: string): string {
  return path.posix.normalize(isWindows ? slash(npath, path.posix.sep) : npath);
}

export const FILE_PATH_SEPARATOR = path.sep;
export const URL_PATH_SEPARATOR = "/";
export const PATH_SEGMENT_EMPTY = "";

export const replaceExt = (npath: string, ext: string): string => {
  if (typeof npath !== "string" || npath.length === 0) {
    return npath;
  }

  return npath.replace(new RegExp(path.extname(npath) + "$"), ext);
};

export const isValidRelativeLink = (link: string): boolean => {
  if (!link) {
    return false;
  }

  if (isAbsoluteUrl(link)) {
    return false;
  }

  if (path.isAbsolute(link)) {
    return false;
  }

  if (!validMarkdownExtensions.includes(path.extname(link))) {
    return false;
  }

  return true;
};

export const isValidFile = (path: string): boolean => {
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

export const splitPathFromQueryAndFragment = (
  url: string,
): [string, string | null] => {
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

export const normaliseAstroOutputPath = (
  initialPath: string,
  collectionOptions: EffectiveCollectionOptions,
): string => {
  const buildPath = () => {
    if (!collectionOptions.base) {
      return initialPath;
    }

    if (collectionOptions.base.startsWith(URL_PATH_SEPARATOR)) {
      return path.join(collectionOptions.base, initialPath);
    }

    return URL_PATH_SEPARATOR + path.join(collectionOptions.base, initialPath);
  };

  if (!initialPath) {
    return initialPath;
  }

  return normalizePath(buildPath());
};

export const generateSlug = (pathSegments: string[]): string => {
  return pathSegments
    .map((segment) => githubSlug(segment))
    .join(URL_PATH_SEPARATOR)
    .replace(/\/index$/, "");
};

export const resolveSlug = (
  generatedSlug: string,
  frontmatterSlug: unknown,
) => {
  return z.string().default(generatedSlug).parse(frontmatterSlug);
};

export const applyTrailingSlash = (
  origUrl: string,
  resolvedUrl: string,
  trailingSlash: EffectiveCollectionOptions["trailingSlash"] = "ignore",
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

export function shouldProcessFile(npath: string): boolean {
  // Astro excludes files that include underscore in any segment of the path under contentDIr
  // see https://github.com/withastro/astro/blob/0fec72b35cccf80b66a85664877ca9dcc94114aa/packages/astro/src/content/utils.ts#L253
  return !npath.split(path.sep).some((p) => p && p.startsWith("_"));
}

const matterCache: Record<string, MatterData> = {};
const matterCacheEnabled = process.env.ARRML_MATTER_CACHE_DISABLE !== "true";
export function getMatter(npath: string): MatterData {
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

export function resolveCollectionBase(
  collectionOptions: EffectiveCollectionOptions,
): string {
  return collectionOptions.collectionBase === false
    ? PATH_SEGMENT_EMPTY
    : URL_PATH_SEPARATOR + collectionOptions.collectionName;
}
