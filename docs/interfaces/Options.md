[astro-rehype-relative-markdown-links](../README.md) / Options

# Interface: Options

## Table of contents

### Properties

- [basePath](Options.md#basepath)
- [collectionPathMode](Options.md#collectionpathmode)
- [contentPath](Options.md#contentpath)
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

In the example below, `astro dev` will start your server at `/docs`.

```js
{
  base: '/docs'
}
```

#### Defined in

[src/index.d.ts:55](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/index.d.ts#L55)

___

### collectionPathMode

• `Optional` **collectionPathMode**: [`CollectionPathMode`](../README.md#collectionpathmode)

**`Name`**

collectionPathMode

**`Default`**

`subdirectory`

**`Description`**

Where you store your collections:
  - `subdirectory` - Subdirectories under `contentPath` (ex: `src/content/docs/index.md` where `docs` is the content collection subdirectory of the contentPath `src/content`)
  - `root` - Directly inside `contentPath` (ex: `src/content/docs/index.md` where `src/content/docs` is the `contentPath`)

Use the `root` configuration option when you are explicitly setting the [contentPath](Options.md#contentpath) property to something other than `src/content` and you want the directory you specify
for [contentPath](Options.md#contentpath) to be treated a single content collection as if it where located in the site root.  In most scenarios, you should set this value to `subdirectory` or not
set this value and the default of `subdirectory` will be used.

**`Example`**

```js
{
  // Use 'subdirectory' mode
  collectionPathMode: 'subdirectory'
}
```

#### Defined in

[src/index.d.ts:39](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/index.d.ts#L39)

___

### contentPath

• `Optional` **contentPath**: `string`

**`Name`**

contentPath

**`Default`**

`src/content`

**`Description`**

This defines where the content (i.e. md, mdx, etc. files) is stored. This should be a path relative to the root directory

#### Defined in

[src/index.d.ts:17](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/index.d.ts#L17)

___

### trailingSlash

• `Optional` **trailingSlash**: [`TrailingSlash`](../README.md#trailingslash)

**`Name`**

trailingSlash

**`Default`**

`ignore`

**`Description`**

Allows you to control the behavior for how trailing slashes should be handled on transformed urls:
  - `'always'` - Ensure urls always end with a trailing slash regardless of input
  - `'never'` - Ensure urls never end with a trailing slash regardless of input
  - `'ignore'` - Do not modify the url, trailing slash behavior will be determined by the file url itself or a custom slug if present.

When set to `'ignore'` (the default), the following will occur:
  - If there is not a custom slug on the target file, the markdown link itself will determine if there is a trailing slash.
      - `[Example](./my-doc.md/))` will result in a trailing slash
      - `[Example](./my-doc.md))` will not result in a trailing slash
  - If there is a custom slug on the target file, the custom slug determines if there is a trailing slash.
      - `slug: my-doc/` will result in a trailing slash
      - `slug: my-doc` will not result in a trailing slash

**`Example`**

```js
{
  // Use `always` mode
  trailingSlash: `always`
}
```

**`See`**

[https://docs.astro.build/en/reference/configuration-reference/#trailingslash|Astro](https://docs.astro.build/en/reference/configuration-reference/#trailingslash|Astro)

#### Defined in

[src/index.d.ts:83](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/index.d.ts#L83)
