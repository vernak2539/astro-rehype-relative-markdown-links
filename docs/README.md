astro-rehype-relative-markdown-links

# astro-rehype-relative-markdown-links

## Table of contents

### Interfaces

- [CollectionConfig](interfaces/CollectionConfig.md)
- [Options](interfaces/Options.md)

### Functions

- [default](README.md#default)

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

[src/index.mjs:35](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/index.mjs#L35)
