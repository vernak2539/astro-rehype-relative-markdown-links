# Support Astro v7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `peerDependencies.astro` in `package.json` to allow Astro 7.x (`>=2 <8`).

**Architecture:** Update the peer dependency version string in `package.json` and verify tests pass.

**Tech Stack:** Node.js, Yarn, TypeScript, npm package manifest.

## Global Constraints
- Peer dependency range for `astro` in `package.json` must be updated to `">=2 <8"`.

---

### Task 1: Update Astro peer dependency range

**Files:**
- Modify: `package.json:47-49`

- [ ] **Step 1: Update package.json peerDependencies**

Update `package.json`:
```json
  "peerDependencies": {
    "astro": ">=2 <8"
  },
```

- [ ] **Step 2: Run test suite**

Run: `yarn test`
Expected: PASS with 176 tests passing.

- [ ] **Step 3: Run type-check**

Run: `yarn type-check`
Expected: PASS without typescript errors.

- [ ] **Step 4: Commit change**

```bash
git add package.json
git commit -m "feat: support Astro v7 in peerDependencies"
```
