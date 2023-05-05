# rehype-astro-relative-markdown-links

This is a [rehype](https://github.com/rehypejs/rehype) plugin built for [Astro](https://astro.build/) that aims to
transform relative links in MD and MDX files into their final output paths.

🚨 This is experimental and build **exclusively** for Astro. Happy to take contributions! See [Todos](#todos) for things
I have yet to do.

For example, if you have a markdown files at `src/content/blog/post.md` with the content of:

```markdown
[relative link](./other-markdown.md)
```

The resulting HTML should be:

```html
<a href="/blog/other-markdown">relative link</a>
```

It supports links with Query Strings and Hashes (e.g. `[relative link](./other-markdown.md?query=test#hash)`).

## Installation

**Yarn**

```bash
yarn add rehype-astro-relative-markdown-links
```

**PNPM**

```bash
pnpm add rehype-astro-relative-markdown-links
```

**NPM**

```bash
npm install rehype-astro-relative-markdown-links
```

## Usage

`astro.config.mjs`

```js
import rehypeAstroRelativeMarkdownLinks from "rehype-astro-relative-markdown-links";

// ...everything else

export default defineConfig({
  // ...everything else
  markdown: {
    rehypePlugins: [rehypeAstroRelativeMarkdownLinks],
  },
});
```

### Debugging

Using Yarn in example (sorry).

```bash
DEBUG=rehype-astro-relative-markdown-links yarn build

# or

DEBUG=rehype-astro-relative-markdown-links yarn dev
```

## Notes

- I'm currently using this in [my blog](https://github.com/vernak2539/words-byvernacchia). Use it as an example if it's easier!

## Todos

- [x] (via [#1](https://github.com/vernak2539/rehype-astro-relative-markdown-links/pulls)) Implement usage with [Astro's custom slug](https://docs.astro.build/en/guides/content-collections/#defining-custom-slugs)
