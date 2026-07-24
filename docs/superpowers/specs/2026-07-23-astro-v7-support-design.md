# Astro v7 Support Design Specification

**Issue:** https://github.com/vernak2539/astro-rehype-relative-markdown-links/issues/84

## Overview
Update the `peerDependencies` range for `astro` in `package.json` to support Astro 7.x.

## Design Changes
In `package.json`:
- Change `"astro": ">=2 <7"` to `"astro": ">=2 <8"`.

## Verification & Impact
- Non-breaking update to peer dependency metadata.
- All existing unit tests and type checks pass.
