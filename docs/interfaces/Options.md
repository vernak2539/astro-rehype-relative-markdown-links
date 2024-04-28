[astro-rehype-relative-markdown-links](../README.md) / Options

# Interface: Options

## Hierarchy

- `input`\<`OptionsSchemaType`\>

  ↳ **`Options`**

## Table of contents

### Properties

- [basePath](Options.md#basepath)
- [collectionBase](Options.md#collectionbase)
- [collections](Options.md#collections)
- [srcDir](Options.md#srcdir)
- [trailingSlash](Options.md#trailingslash)

## Properties

### basePath

• `Optional` **basePath**: `string`

**`Name`**

basePath

**`Reference`**

https://docs.astro.build/en/reference/configuration-reference/#base

**`Description`**

The base path to deploy to. Astro will use this path as the root for your pages and assets both in development and in production build.

In the example below, `astro dev` will start your server at `/my-site`.

```js
{
  base: '/my-site'
}
```

#### Inherited from

z.input.basePath

#### Defined in

[src/options.mjs:131](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L131)

___

### collectionBase

• `Optional` **collectionBase**: ``false`` \| ``"name"`` \| ``"collectionRelative"`` \| ``"pathRelative"``

**`Name`**

collectionBase

**`Default`**

`"name"`

**`Description`**

Set how the URL path to the referenced markdown file should be derived:
  - `"name"` - An absolute path prefixed with the optional [basePath](Options.md#basepath) followed by the collection name
  - `false` - An absolute path prefixed with the optional [basePath](Options.md#basepath)
  - `"collectionRelative"` - A relative path from the collection directory
  - `"pathRelative"` - A relative path from the current page path

For example, given a file `./guides/section/my-guide.md` referenced from `./guides/section/my-other-guide.md` with
the link `[My Guide](./my-guide.md)` in the content collection `docs`, the transformed url would be:
  - `"name"`: `[/basePath]/docs/guides/section/my-guide`
  - `false`: `[/basePath]/guides/section/my-guide`
  - `"collectionRelative"`: `../../guides/section/my-guide`
  - `"pathRelative"`: `my-guide`

Use `false`, `"collectionRelative"`, or `"pathRelative"` when you are treating your content collection as if it were located in the site
root (ex: `src/content/docs/test.md` resolves to the page path `/test` instead of the typical `/docs/test`).

Use `"collectionRelative"` or `"pathRelative"` when you are serving your content collection pages from multiple page path roots that use a
common content collection (ex: `/my-blog/test` and `/your-blog/test` both point to the file `./src/content/posts/test.md`
in the content collection `posts`).

Important Notes:
- This is a top-level option and will apply to all content collections.  If you have multiple content collections
and want the behavior to be different on a per content collection basis, add the collection(s) to the [collections](Options.md#collections)
option and provide a value for collection specific [base](CollectionConfig.md) option.
- When using either `"collectionRelative"` or `"pathRelative"`, due to the nature of relative links, you MUST ensure
that any directory paths in your site (e.g., urls to `index` pages), contain a trailing slash.  For example, given
`./src/content/docs/index.md`, the url should be `/docs/` and not `/docs` as any link generated on that page by the plugin
for a page inside of `./src/content/docs` directory will not navigate correctly since, in relative terms, `/docs` is
different than `/docs/`. Along this line, it is highly encouraged to apply `trailingSlash="always"` to your Astro site and
this plugin to help avoid relative pathing issues.

**`Example`**

```js
{
  // Do not apply a collection name segment to the generated absolute URL path
  collectionBase: false
}
```

**`See`**

[collections](Options.md#collections)

#### Inherited from

z.input.collectionBase

#### Defined in

[src/options.mjs:94](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L94)

___

### collections

• `Optional` **collections**: `Record`\<`string`, \{ `base?`: ``false`` \| ``"name"`` \| ``"collectionRelative"`` \| ``"pathRelative"`` ; `name?`: `string`  }\>

**`Name`**

collections

**`Default`**

`{}`

**`Description`**

Specify a mapping of collections where the `key` is the name of a collection on disk and the value is a [CollectionConfig](CollectionConfig.md)
which will override any top-level configuration where applicable.

**`Example`**

```js
{
  // Do not apply a collection name segment to the generated absolute URL path for the collection `docs`
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

[src/options.mjs:116](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L116)

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

[src/options.mjs:49](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L49)

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

[src/options.mjs:158](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L158)
