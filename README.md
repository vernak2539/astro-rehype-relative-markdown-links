# astro-rehype-relative-markdown-links

This is a [rehype](https://github.com/rehypejs/rehype) plugin built for [Astro](https://astro.build/) that aims to
transform relative links in MD and MDX files into their final output paths.

🚨 This is experimental and build **exclusively** for Astro. I have made a couple assumptions. They are:

1. You are rendering a static site (i.e. not using SSR)
2. You have a content collection residing at `src/content/<content_collection>`
3. You have a page that renders the above content collection at `src/pages/<content_collection>/[...slug].astro`

## Example Functionality

If you have a markdown files at `src/content/blog/post.md` with the content of:

```markdown
[relative link](./other-markdown.md)
```

The resulting HTML should be:

```html
<a href="/blog/other-markdown">relative link</a>
```

It supports links with Query Strings and Hashes (e.g. `[relative link](./other-markdown.md?query=test#hash)`).

## OS Support

Tested with Node.js v18 and v20 and Astro 2.x+.

- [x] MacOS (Ventura)
- [x] Windows (Windows 11)
- [x] Linux (Debian 11)

## Installation

**Yarn**

```bash
yarn add astro-rehype-relative-markdown-links
```

**PNPM**

```bash
pnpm add astro-rehype-relative-markdown-links
```

**NPM**

```bash
npm install astro-rehype-relative-markdown-links
```

## Usage

`astro.config.mjs`

```js
import rehypeAstroRelativeMarkdownLinks from "astro-rehype-relative-markdown-links";

// ...everything else

export default defineConfig({
  // ...everything else
  markdown: {
    rehypePlugins: [rehypeAstroRelativeMarkdownLinks],
  },
});
```

## Configuration Options

See [documentation](https://github.com/vernak2539/astro-rehype-relative-markdown-links/tree/main/docs) for more
information on the available configuration options.

To set custom options, pass an object to the plugin like below:

```js
const options = {
  // ...
};

export default defineConfig({
  // ...everything else
  markdown: {
    rehypePlugins: [[rehypeAstroRelativeMarkdownLinks, options]],
  },
});
```

## Debugging

Using Yarn in example (sorry).

```bash
DEBUG=astro-rehype-relative-markdown-links yarn build

# or

DEBUG=astro-rehype-relative-markdown-links yarn dev
```

## Notes

- I'm currently using this in [my blog](https://github.com/vernak2539/words-byvernacchia). Use it as an example if it's easier!
- This rehype plugin was called `rehype-astro-relative-markdown-links` in the past. I've changed this due to rehype's naming guidelines.

### Versions including and after `v0.9.0`

In [PR #3](https://github.com/vernak2539/astro-rehype-relative-markdown-links/pull/3) (based on [issue #2](https://github.com/vernak2539/astro-rehype-relative-markdown-links/issues/2)), special case handling of index files was
added where the `index` would be stripped from the URL. For example, `src/content/collection/dir/index.md` would be
transformed into `/collection/dir`. This functionality was applied to `index.md` files both at the content collection
root and content collection subdirectories.

In [PR #17](https://github.com/vernak2539/astro-rehype-relative-markdown-links/pull/17), applying this functionality to
`index.md` at the collection root was removed based on the way Astro handles content at site/collection root vs. subdirectories
(see [this issue](https://github.com/withastro/astro/issues/7038)).

If you want to have your collection root `index.md` be transformed without the `index` slug, utilitize
the [slug frontmatter option](https://docs.astro.build/en/guides/content-collections/#defining-custom-slugs) provided by
Astro setting your slug to empty string (`''`) and ensure your `getStaticPaths()` returns `undefined` for the slug of
the content collection root `index.md`.
