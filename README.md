# rehype-astro-relative-markdown-links

This is a [rehype](https://github.com/rehypejs/rehype) plugin built for [Astro](https://astro.build/) that aims to
transform relative links in MD and MDX files into their final output paths.

🚨 This is experimental and build **exclusively** for Astro. Happy to take contributions!

For example, if you have a markdown files at `src/content/blog/post.md` with the content of:

```markdown
[relative link](./other-markdown.md)
```

The resulting HTML should be:

```html
<a href="/blog/other-markdown">relative link</a>
```

🚨 **Note**: This doesn't work with files that have custom slugs (again, contributions are welcome!)

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
