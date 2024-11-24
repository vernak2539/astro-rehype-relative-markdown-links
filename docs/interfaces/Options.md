[astro-rehype-relative-markdown-links](../README.md) / Options

# Interface: Options

## Hierarchy

- `input`\<`OptionsSchemaType`\>

  ↳ **`Options`**

## Table of contents

### Properties

- [base](Options.md#base)
- [collectionBase](Options.md#collectionbase)
- [collections](Options.md#collections)
- [srcDir](Options.md#srcdir)
- [trailingSlash](Options.md#trailingslash)

## Properties

### base

• `Optional` **base**: `string`

**`Name`**

base

**`Reference`**

https://docs.astro.build/en/reference/configuration-reference/#base

**`Description`**

The base path to deploy to. Astro will use this path as the root for your pages and assets both in development and in production build.

**`Example`**

In the example below, `astro dev` will start your server at `/docs`.

```js
{
  base: '/docs'
}
```

#### Inherited from

z.input.base

#### Defined in

[src/options.mjs:105](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L105)

___

### collectionBase

• `Optional` **collectionBase**: ``false`` \| ``"name"``

**`Name`**

collectionBase

**`Default`**

`"name"`

**`Description`**

Set how the base segment of the URL path to the referenced markdown file should be derived:
  - `"name"` - Apply the name on disk of the content collection (ex. `./guides/my-guide.md` referenced from `./resources/my-reference.md` in the content collection `docs` would resolve to the path `/docs/guides/my-guide`)
  - `false` - Do not apply a base (ex. `./guides/my-guide.md` referenced from `./resources/my-reference.md` in the content collection `docs` would resolve to the path `/guides/my-guide`)

Use `false` when you are treating your content collection as if it were located in the site root (ex: `src/pages`). In most scenarios, you should set this value to `"name"` or not
set this value and the default of `"name"` will be used.

Note that this is a top-level option and will apply to all content collections.  If you have multiple collections and only want one of them to be treated as the site root, you should set this value to `"name"` (or leave the default)
and use the [collections](Options.md#collections) option to control the behavior for the specific content collection.

**`Example`**

```js
{
  // Do not apply a base segment to the transformed URL path
  collectionBase: false
}
```

**`See`**

[collections](Options.md#collections)

#### Inherited from

z.input.collectionBase

#### Defined in

[src/options.mjs:68](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L68)

___

### collections

• `Optional` **collections**: `Record`\<`string`, \{ `base?`: ``false`` \| ``"name"`` ; `name?`: `string`  }\>

**`Name`**

collections

**`Default`**

`{}`

**`Description`**

Specify a mapping of collections where the key is the name of a collection on disk and the value is an object of collection specific configuration which will override any top-level
configuration where applicable.

**`Example`**

```js
{
  // Do not apply a base segment to the transformed URL for the collection `docs`
  collections: {
    docs: {
      base: false
    }
  }
}
```

**`See`**

[CollectionConfig](CollectionConfig.md)

#### Inherited from

z.input.collections

#### Defined in

[src/options.mjs:90](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L90)

___

### srcDir

• `Optional` **srcDir**: `string`

**`Name`**

srcDir

**`Reference`**

https://docs.astro.build/en/reference/configuration-reference/#srcdir

**`Default`**

`./src`

**`Description`**

Set the directory that Astro will read your site from.

The value can be either an absolute file system path or a path relative to the project root.

**`Example`**

```js
{
  srcDir: './www'
}
```

#### Inherited from

z.input.srcDir

#### Defined in

[src/options.mjs:44](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L44)

___

### trailingSlash

• `Optional` **trailingSlash**: ``"always"`` \| ``"never"`` \| ``"ignore"``

**`Name`**

trailingSlash

**`Default`**

`"ignore"`

**`Description`**

Allows you to control the behavior for how trailing slashes should be handled on transformed urls:
  - `"always"` - Ensure urls always end with a trailing slash regardless of input
  - `"never"` - Ensure urls never end with a trailing slash regardless of input
  - `"ignore"` - Do not modify the url, trailing slash behavior will be determined by the file url itself or a custom slug if present.

When set to `"ignore"` (the default), the following will occur:
  - If there is not a custom slug on the target file, the markdown link itself will determine if there is a trailing slash.
      - `[Example](./my-doc.md/)` will result in a trailing slash
      - `[Example](./my-doc.md)` will not result in a trailing slash
  - If there is a custom slug on the target file, the custom slug determines if there is a trailing slash.
      - `slug: my-doc/` will result in a trailing slash
      - `slug: my-doc` will not result in a trailing slash

**`Example`**

```js
{
  // Use `always` mode
  trailingSlash: "always"
}
```

**`See`**

[https://docs.astro.build/en/reference/configuration-reference/#trailingslash|Astro](https://docs.astro.build/en/reference/configuration-reference/#trailingslash|Astro)

#### Inherited from

z.input.trailingSlash

#### Defined in

[src/options.mjs:132](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L132)
