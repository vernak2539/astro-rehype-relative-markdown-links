[astro-rehype-relative-markdown-links](../README.md) / Options

# Interface: Options

## Hierarchy

- `input`\<`OptionsSchemaType`\>

  ↳ **`Options`**

## Table of contents

### Properties

- [base](Options.md#base)
- [collectionPathMode](Options.md#collectionpathmode)
- [contentPath](Options.md#contentpath)
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

[src/options.mjs:50](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L50)

___

### collectionPathMode

• `Optional` **collectionPathMode**: ``"root"`` \| ``"subdirectory"``

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

#### Inherited from

z.input.collectionPathMode

#### Defined in

[src/options.mjs:33](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L33)

___

### contentPath

• `Optional` **contentPath**: `string`

**`Name`**

contentPath

**`Default`**

`src/content`

**`Description`**

This defines where the content (i.e. md, mdx, etc. files) is stored. This should be a path relative to the root directory

#### Inherited from

z.input.contentPath

#### Defined in

[src/options.mjs:12](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L12)

___

### trailingSlash

• `Optional` **trailingSlash**: ``"always"`` \| ``"never"`` \| ``"ignore"``

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
      - `[Example](./my-doc.md/)` will result in a trailing slash
      - `[Example](./my-doc.md)` will not result in a trailing slash
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

#### Inherited from

z.input.trailingSlash

#### Defined in

[src/options.mjs:77](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.mjs#L77)
