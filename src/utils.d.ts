export type SplitPathFromQueryAndFragmentFn = (
  path: string,
) => [string, string | null];
export type ReplaceExtFn = (path: string, ext: string) => string;
export type IsCurrentDirectoryFn = (path: string) => boolean;
export type IsValidRelativeLinkFn = (link: string) => boolean;
export type IsValidFile = (path: string) => boolean;
