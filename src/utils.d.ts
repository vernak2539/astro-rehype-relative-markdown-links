export type SplitPathFromQueryAndFragmentFn = (
  path: string,
) => [string, string | null];
export type ReplaceExtFn = (path: string, ext: string) => string;
export type IsCurrentDirectoryFn = (path: string) => boolean;
export type IsValidRelativeLinkFn = (link: string) => boolean;
export type GenerateSlug = (pathSegments: string[]) => string;
export type ResolveSlug = (generatedSlug: string, frontmatterSlug?: unknown) => string;
