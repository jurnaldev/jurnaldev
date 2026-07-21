# Journal Paragraph Spacing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one line of visible separation between consecutive Markdown paragraphs on detail pages without changing the spacing of other content elements.

**Architecture:** Keep `ArticleBody` as the shared Markdown renderer. Give its rendered paragraphs a dedicated class and use one scoped adjacent-sibling CSS selector so spacing is added only between consecutive paragraphs.

**Tech Stack:** Next.js 16, React 19, TypeScript, ReactMarkdown, Vitest, React DOM server rendering, CSS

---

## Chunk 1: Regression and Fix

### Task 1: Lock down consecutive-paragraph spacing

**Files:**
- Create: `src/components/article/article-body.test.tsx`
- Modify: `src/components/article/article-body.tsx:126-140`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write the failing regression test**

Create a test that renders two paragraphs through the real async `ArticleBody` component and checks both paragraphs have the scoped class. Read `globals.css` and assert that the class uses an adjacent-sibling rule with `margin-top: 1rem`.

```tsx
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ArticleBody } from "./article-body"

describe("ArticleBody paragraph spacing", () => {
  it("adds one line of space only between consecutive paragraphs", async () => {
    const html = renderToStaticMarkup(
      await ArticleBody({ body: "First paragraph.\n\nSecond paragraph." }),
    )
    expect(html.match(/class="article-paragraph"/g)).toHaveLength(2)

    const cssPath = fileURLToPath(new URL("../../app/globals.css", import.meta.url))
    const css = readFileSync(cssPath, "utf8")
    expect(css).toMatch(
      /\.article-paragraph\s*\+\s*\.article-paragraph\s*\{[^}]*margin-top:\s*1rem/,
    )
  })
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `pnpm test -- src/components/article/article-body.test.tsx`

Expected: FAIL because the rendered paragraphs do not yet have `article-paragraph`, and the scoped CSS rule does not exist.

- [ ] **Step 3: Add the scoped paragraph class**

In the custom `p` renderer in `article-body.tsx`, add:

```tsx
className="article-paragraph"
```

Keep the existing inline typography and zero margin so spacing remains controlled by the relationship selector.

- [ ] **Step 4: Add the adjacent-paragraph rule**

Add to `globals.css` near the existing article layout styles:

```css
.article-paragraph + .article-paragraph {
  margin-top: 1rem !important;
}
```

The `!important` is required because the current React inline style sets `margin: 0`; the selector remains narrowly scoped to two adjacent rendered paragraphs.

- [ ] **Step 5: Run the focused test and verify it passes**

Run: `pnpm test -- src/components/article/article-body.test.tsx`

Expected: PASS.

- [ ] **Step 6: Run repository verification**

Run: `pnpm lint && pnpm typecheck && pnpm test`

Expected: all commands pass.

- [ ] **Step 7: Review the diff and commit**

Run: `git diff --check && git diff -- src/components/article/article-body.tsx src/components/article/article-body.test.tsx src/app/globals.css`

Expected: no whitespace errors; diff contains only the paragraph class, scoped rule, and regression test.

```bash
git add src/components/article/article-body.tsx src/components/article/article-body.test.tsx src/app/globals.css
git commit -m "fix: restore journal paragraph spacing"
```
