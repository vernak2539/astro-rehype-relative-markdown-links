import type { EffectiveOptions } from "./options.d.ts";

export type SplitPathFromQueryAndFragmentFn = (
  path: string,
) => [string, string | null];
export type ReplaceExtFn = (path: string, ext: string) => string;
export type IsValidRelativeLinkFn = (link: string) => boolean;
export type IsValidFile = (path: string) => boolean;
export type GenerateSlug = (pathSegments: string[]) => string;
export type ResolveSlug = (
  generatedSlug: string,
  frontmatterSlug?: unknown,
) => string;
export type ApplyTrailingSlash = (
  originalUrl: string,
  resolvedUrl: string,
  trailingSlash: EffectiveOptions["trailingSlash"],
) => string;
export type NormaliseAstroOutputPath = (
  initialPath: string,
  options: EffectiveOptions,
) => string;
export type Slash = (path: string, sep: string) => string;
export type NormalizePath = (path: string) => string;
export type ShouldProcessFile = (path: string) => boolean;
export type ResolveCollectionBase = (
  collectionName: string,
  options: EffectiveOptions,
) => string;
export type MatterData = { slug?: string };
export type GetMatter = (path: string) => MatterData;
