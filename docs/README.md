astro-rehype-relative-markdown-links

# astro-rehype-relative-markdown-links

## Table of contents

### Interfaces

- [Options](interfaces/Options.md)

### Type Aliases

- [CollectionPathMode](README.md#collectionpathmode)
- [TrailingSlash](README.md#trailingslash)

### Functions

- [default](README.md#default)

## Type Aliases

### CollectionPathMode

Ƭ **CollectionPathMode**: ``"subdirectory"`` \| ``"root"``

#### Defined in

[src/index.d.ts:4](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/index.d.ts#L4)

___

### TrailingSlash

Ƭ **TrailingSlash**: ``"always"`` \| ``"never"`` \| ``"ignore"``

#### Defined in

[src/index.d.ts:6](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/index.d.ts#L6)

## Functions

### default

▸ **default**(`this`, `...parameters`): `undefined` \| `void` \| `Transformer`\<`Root`, `Root`\>

Rehype plugin for Astro to add support for transforming relative links in MD and MDX files into their final page paths.

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `Processor`\<`undefined`, `undefined`, `undefined`, `undefined`, `undefined`\> |
| `...parameters` | [(null \| Options)?] |

#### Returns

`undefined` \| `void` \| `Transformer`\<`Root`, `Root`\>

**`See`**

[Options](interfaces/Options.md)

#### Defined in

[src/index.mjs:55](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/index.mjs#L55)
