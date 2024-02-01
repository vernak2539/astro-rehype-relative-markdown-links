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

To set custom options, pass an object to the plugin like below:

```js
const options = {
  contentPath: "", // where you store your content relative to the root directory. default: 'src/content'
};

export default defineConfig({
  // ...everything else
  markdown: {
    rehypePlugins: [[rehypeAstroRelativeMarkdownLinks, options]],
  },
});
```

### Debugging

Using Yarn in example (sorry).

```bash
DEBUG=astro-rehype-relative-markdown-links yarn build

# or

DEBUG=astro-rehype-relative-markdown-links yarn dev
```

## Notes

- I'm currently using this in [my blog](https://github.com/vernak2539/words-byvernacchia). Use it as an example if it's easier!
- This rehype plugin was called `rehype-astro-relative-markdown-links` in the past. I've changed this due to rehype's naming guidelines.
