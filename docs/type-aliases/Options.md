[astro-rehype-relative-markdown-links](../README.md) / Options

# Type Alias: Options

> **Options**: `object`

General options

## Type declaration

### base?

> `optional` **base**: `string`

The base path to deploy to. Astro will use this path as the root for your pages and assets both in development and in production build.

#### See

[https://docs.astro.build/en/reference/configuration-reference/#base](https://docs.astro.build/en/reference/configuration-reference/#base)

#### Example

In the example below, `astro dev` will start your server at `/docs`.

```js
{
  base: '/docs'
}
```

### collectionBase?

> `optional` **collectionBase**: `false` | `"name"`

Set how the base segment of the URL path to the referenced markdown file should be derived:

* `"name"` - Apply the name on disk of the content collection (ex. `./guides/my-guide.md` referenced from `./resources/my-reference.md` in the content collection `docs` would resolve to the path `/docs/guides/my-guide`)
* `false` - Do not apply a base (ex. `./guides/my-guide.md` referenced from `./resources/my-reference.md` in the content collection `docs` would resolve to the path `/guides/my-guide`)

Use `false` when you are treating your content collection as if it were located in the site root (ex: `src/pages`). In most scenarios, you should set this value to `"name"` or not
set this value and the default of `"name"` will be used.

Note that this is a top-level option and will apply to all content collections.  If you have multiple content collections and want the behavior to be different on a per content collection basis, add the collection(s) to
the [collections](Options.md#collections) option and provide a value for the [base](CollectionConfig.md#base) property.

#### Default

`"name"`

#### See

[collections](Options.md#collections)

#### Example

```js
{
  // Do not apply a base segment to the transformed URL path
  collectionBase: false
}
```

### collections?

> `optional` **collections**: `Record`\<`string`, \{ `base`: `false` | `"name"`; `name`: `string`; }>

Specify a mapping of collections where the key is the name of a collection on disk and the value is an object of collection specific configuration which will override any top-level
configuration where applicable.

#### Default

`{}`

#### See

[CollectionConfig](CollectionConfig.md)

#### Example

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

### srcDir?

> `optional` **srcDir**: `string`

Set the directory that Astro will read your site from.

The value can be either an absolute file system path or a path relative to the project root.

#### Default

`./src`

#### See

[https://docs.astro.build/en/reference/configuration-reference/#srcdir](https://docs.astro.build/en/reference/configuration-reference/#srcdir)

#### Example

```js
{
  srcDir: './www'
}
```

### trailingSlash?

> `optional` **trailingSlash**: `"never"` | `"ignore"` | `"always"`

Allows you to control the behavior for how trailing slashes should be handled on transformed urls:

* `"always"` - Ensure urls always end with a trailing slash regardless of input
* `"never"` - Ensure urls never end with a trailing slash regardless of input
* `"ignore"` - Do not modify the url, trailing slash behavior will be determined by the file url itself or a custom slug if present.

When set to `"ignore"` (the default), the following will occur:

* If there is not a custom slug on the target file, the markdown link itself will determine if there is a trailing slash.
  * `[Example](./my-doc.md/)` will result in a trailing slash
  * `[Example](./my-doc.md)` will not result in a trailing slash
* If there is a custom slug on the target file, the custom slug determines if there is a trailing slash.
  * `slug: my-doc/` will result in a trailing slash
  * `slug: my-doc` will not result in a trailing slash

#### Default

`"ignore"`

#### See

[https://docs.astro.build/en/reference/configuration-reference/#trailingslash](https://docs.astro.build/en/reference/configuration-reference/#trailingslash)

#### Example

```js
{
  // Use `always` mode
  trailingSlash: "always"
}
```

## Defined in

[src/options.ts:120](https://github.com/vernak2539/astro-rehype-relative-markdown-links/blob/main/src/options.ts#L120)
