[astro-rehype-relative-markdown-links](../README.md) / CollectionConfig

# Interface: CollectionConfig

Collection specific options

## Contents

* [Extends](#extends)
* [Properties](#properties)
  * [base?](#base)
  * [name?](#name)

## Extends

* `input`\<`CollectionConfigSchemaType`>

## Properties

### base?

> `optional` **base**: `false` | `"name"`

Override the top-level [collectionBase](Options.md#collectionbase) option for this collection.

#### Inherited from

`z.input.base`

#### Defined in

[src/options.mjs:9](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L9)

***

### name?

> `optional` **name**: `string`

Override the name of the collection from disk.

Use this option when your collection page path does not correspond to the name of the collection on disk (ex. `src/content/docs/reference.md` resolves to a page path of `/my-docs/reference`).

When not specified, the name of the collection from disk will be used where applicable.

#### Inherited from

`z.input.name`

#### Defined in

[src/options.mjs:17](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L17)
