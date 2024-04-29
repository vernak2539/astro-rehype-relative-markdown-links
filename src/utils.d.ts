import type { EffectiveCollectionOptions } from "./options.d.ts";

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
  trailingSlash: EffectiveCollectionOptions["trailingSlash"],
) => string;
export type NormaliseAstroOutputPath = (
  initialPath: string,
  collectionOptions: EffectiveCollectionOptions,
) => string;
export type Slash = (path: string, sep: string) => string;
export type NormalizePath = (path: string) => string;
export type ShouldProcessFile = (path: string) => boolean;
export type ProcessingDetails = {
  currentFile: string;
  collectionDir: string;
  destinationSlug: string;
};
export type GetCurrentFileSlugDirPath = (
  processingDetails: ProcessingDetails,
) => string;
export type getRelativePathFromCurrentFileToCollection = (
  processingDetails: ProcessingDetails,
) => string;
export type GetRelativePathFromCurrentFileToDestination = (
  processingDetails: ProcessingDetails,
) => string;
export type ResolveCollectionBase = (
  collectionOptions: EffectiveCollectionOptions,
  processingDetails: ProcessingDetails,
) => string;
export type MatterData = { slug?: string };
export type GetMatter = (path: string) => MatterData;
