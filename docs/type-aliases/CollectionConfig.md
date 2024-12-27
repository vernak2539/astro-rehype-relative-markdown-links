[astro-rehype-relative-markdown-links](../README.md) / CollectionConfig

# Type Alias: CollectionConfig

> **CollectionConfig**: `object`

Collection specific options

## Type declaration

### base?

> `optional` **base**: `false` | `"name"`

Override the top-level [collectionBase](Options.md#collectionbase) option for this collection.

### name?

> `optional` **name**: `string`

Override the name of the collection from disk.

Use this option when your collection page path does not correspond to the name of the collection on disk (ex. `src/content/docs/reference.md` resolves to a page path of `/my-docs/reference`).

When not specified, the name of the collection from disk will be used where applicable.

## Defined in

[src/options.ts:116](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.ts#L116)
