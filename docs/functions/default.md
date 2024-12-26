[astro-rehype-relative-markdown-links](../README.md) / default

# Function: default()

> **default**(`this`, ...`parameters`): `undefined` | `void` | `Transformer`\<`Root`, `Root`>

Rehype plugin for Astro to add support for transforming relative links in MD and MDX files into their final page paths.

## Parameters

| Parameter       | Type                                                                                                                                                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `this`          | `Processor`\<`undefined`, `undefined`, `undefined`, `undefined`, `undefined`>                                                                                                                                                                      |
| ...`parameters` | \[(`null` \| \{ `base`: `string`; `collectionBase`: `false` \| `"name"`; `collections`: `Record`\<`string`, \{ `base`: `false` \| `"name"`; `name`: `string`; }>; `srcDir`: `string`; `trailingSlash`: `"never"` \| `"ignore"` \| `"always"`; })?] |

## Returns

`undefined` | `void` | `Transformer`\<`Root`, `Root`>

## See

[Options](../type-aliases/Options.md)

## Defined in

[src/plugin.ts:36](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/plugin.ts#L36)
