[astro-rehype-relative-markdown-links](../README.md) / CollectionConfig

# Interface: CollectionConfig

## Hierarchy

- `input`\<`CollectionConfigSchemaType`\>

  ↳ **`CollectionConfig`**

## Table of contents

### Properties

- [base](CollectionConfig.md#base)
- [name](CollectionConfig.md#name)

## Properties

### base

• `Optional` **base**: ``false`` \| ``"name"`` \| ``"collectionRelative"``

**`Name`**

base

**`Description`**

Override the top-level [collectionBase](Options.md#collectionbase) option for this collection.

#### Inherited from

z.input.base

#### Defined in

[src/options.mjs:16](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L16)

___

### name

• `Optional` **name**: `string`

**`Name`**

name

**`Description`**

Override the name of the collection from disk.

Use this option when your collection page path does not correspond to the name of the collection on disk (ex. `src/content/docs/reference.md` resolves to a page path of /my-docs/reference).

When not specified, the name of the collection from disk will be used where applicable.

#### Inherited from

z.input.name

#### Defined in

[src/options.mjs:27](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L27)
