[astro-rehype-relative-markdown-links](../README.md) / Options

# Interface: Options

## Table of contents

### Properties

- [basePath](Options.md#basepath)
- [collectionPathMode](Options.md#collectionpathmode)
- [contentPath](Options.md#contentpath)

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

[index.d.ts:50](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/6ae08fe7d7b04742435480815eb89b7e1ddde36e/src/index.d.ts#L50)

___

### collectionPathMode

• `Optional` **collectionPathMode**: [`CollectionPathMode`](../README.md#collectionpathmode)

**`Name`**

collectionPathMode

**`Default`**

`'subdirectory'`

**`Description`**

Where you store your collections:
  - `'subdirectory'` - Subdirectories under `contentPath` (ex: `src/content/docs/index.md` where `docs` is the content collection subdirectory of the contentPath `src/content`)
  - `'root'` - Directly inside `contentPath` (ex: `src/content/docs/index.md` where `src/content/docs` is the `contentPath`)

Use the `root` configuration option when you are explicitly setting the [contentPath](Options.md#contentpath) property to something other than `src/content` and you want the directory you specify
for [contentPath](Options.md#contentpath) to be treated a single content collection as if it where located in the site root.  In most scenarios, you should set this value to `subdirectory` or not
set this value and the default of `subdirectory` will be used.

**`Example`**

```js
{
  // Use `subdirectory` mode
  collectionPathMode: `subdirectory`
}
```

#### Defined in

[index.d.ts:34](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/6ae08fe7d7b04742435480815eb89b7e1ddde36e/src/index.d.ts#L34)

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

[index.d.ts:12](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/6ae08fe7d7b04742435480815eb89b7e1ddde36e/src/index.d.ts#L12)
