# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update jurnaldev homepage to Direction B (Linear Editorial) — ruled section labels, surface-card MetaItems, journal row list, simplified EmptyState, h1 weight bump.

**Architecture:** 4 targeted file edits. No new files. CSS variables in globals.css drive theme-aware shadows so components stay pure inline-style with no JS theme detection. Journal rows replace the ArticleCard grid on the homepage only — ArticleCard stays untouched for the /jurnal listing page.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS v4, Geist fonts, CSS custom properties for theming.

---

## File Map

| File | What changes |
|------|-------------|
| `src/app/globals.css` | Add `--shadow-card` + `--shadow-badge` CSS vars to `:root` and `.dark` |
| `src/components/primitives.tsx` | SectionLabel → ruled layout; MetaItem → surface card with shadow |
| `src/app/page.tsx` | Hero h1 `fontWeight` 500→600; remove `borderTop` + `paddingTop` from meta grid wrapper |
| `src/components/journal-section.tsx` | Replace ArticleCard grid with row list; update loading skeleton; simplify EmptyState |

---

## Task 1: Add shadow CSS variables

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add vars to `:root`**

In `globals.css`, inside the existing `:root {}` block (after `--code-border`), add:

```css
--shadow-card: 0 0 0 1px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
--shadow-badge: 0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
```

- [ ] **Step 2: Add vars to `.dark`**

In `globals.css`, inside the existing `.dark {}` block (after `--code-border`), add:

```css
--shadow-card: 0 0 0 1px rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.25);
--shadow-badge: 0 0 0 1px rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.3);
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add --shadow-card and --shadow-badge CSS variables"
```

---

## Task 2: Update SectionLabel and MetaItem

**Files:**
- Modify: `src/components/primitives.tsx`

- [ ] **Step 1: Replace SectionLabel**

Replace the entire `SectionLabel` function with:

```tsx
export function SectionLabel({
  number,
  label,
  icon: Icon,
}: {
  number: string
  label: string
  icon?: LucideIcon
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-geist-mono), monospace",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "1.5rem",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--text-subtle)",
          letterSpacing: "0.3px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {number}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--text-subtle)",
          letterSpacing: "0.3px",
          textTransform: "uppercase",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {label}
        {Icon && <Icon size={11} strokeWidth={2} />}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Replace MetaItem**

Replace the entire `MetaItem` function with:

```tsx
export function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        borderRadius: "8px",
        padding: "10px 12px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "10px",
          color: "var(--text-subtle)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{ fontSize: "14px", color: "var(--text)", lineHeight: "1.5" }}
      >
        {value}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify dev server**

```bash
pnpm dev
```

Open http://localhost:3000. Check:
- Section labels show `01 ─────── ABOUT` ruled layout in both light and dark
- MetaItem cards have rounded corners with subtle shadow
- No TypeScript errors in terminal

- [ ] **Step 4: Commit**

```bash
git add src/components/primitives.tsx
git commit -m "style: update SectionLabel to ruled layout and MetaItem to surface card"
```

---

## Task 3: Update Hero h1 and About meta grid

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Bump h1 fontWeight**

In `src/app/page.tsx`, in the `Hero` function, find the `<h1>` element. Change `fontWeight: 500` to `fontWeight: 600`:

```tsx
<h1
  style={{
    fontSize: "clamp(2.75rem, 7vw, 4.5rem)",
    fontWeight: 600,
    letterSpacing: "-0.04em",
    lineHeight: 1.0,
    margin: "0 0 1.5rem 0",
    color: "var(--text)",
  }}
>
```

- [ ] **Step 2: Remove borderTop from meta grid wrapper**

In the `About` function, find the grid wrapper `<div>` that contains the two `<MetaItem>` calls. Remove `borderTop` and `paddingTop` — the MetaItem cards carry their own visual separation now:

```tsx
<div
  style={{
    marginTop: "2rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  }}
>
  <MetaItem label={data.currentlyLabel} value={data.currentlyValue} />
  <MetaItem label={data.stackLabel} value={data.stackValue} />
</div>
```

- [ ] **Step 3: Verify dev server**

Open http://localhost:3000. Check:
- Hero name renders heavier (weight 600)
- About meta items sit directly below prose with no horizontal rule above them
- Cards have shadow depth, switch correctly between light and dark themes

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "style: bump hero h1 to weight 600, remove borderTop from meta grid"
```

---

## Task 4: Replace journal card grid with row list

**Files:**
- Modify: `src/components/journal-section.tsx`

- [ ] **Step 1: Update imports**

At the top of `src/components/journal-section.tsx`, replace:

```tsx
import { ArrowUpRight, ArrowRight } from "lucide-react"
import { useLang, type Lang } from "@/contexts/lang-context"
import { ArticleCard } from "@/components/article/article-card"
import type { StrapiArticle, StrapiEmptyState } from "@/lib/strapi/types"
```

with:

```tsx
import { ArrowUpRight, ArrowRight } from "lucide-react"
import { useLang, type Lang } from "@/contexts/lang-context"
import {
  formatDateShort,
  formatEntryNumber,
  calculateReadingTime,
} from "@/lib/article-utils"
import type { StrapiArticle, StrapiEmptyState } from "@/lib/strapi/types"
```

- [ ] **Step 2: Replace loading skeleton**

Find the `if (articles === null)` block (the loading state). Replace it entirely with:

```tsx
if (articles === null) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginBottom: "1.5rem" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: i < 2 ? "1px solid var(--border)" : "none",
            opacity: 0.4,
          }}
        >
          <div>
            <div
              style={{
                height: "10px",
                background: "var(--border)",
                borderRadius: "3px",
                marginBottom: "6px",
                width: "120px",
              }}
            />
            <div
              style={{
                height: "14px",
                background: "var(--border)",
                borderRadius: "3px",
                width: "220px",
              }}
            />
          </div>
          <div
            style={{
              height: "22px",
              background: "var(--border)",
              borderRadius: "5px",
              width: "44px",
            }}
          />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Replace article card grid with row list**

Find the `return (...)` at the bottom of `JournalSection` (the loaded state with the grid). Replace it entirely with:

```tsx
return (
  <>
    <div style={{ display: "flex", flexDirection: "column", marginBottom: "1.5rem" }}>
      {articles.map((article, i) => {
        const readingTime = calculateReadingTime(article.body)
        return (
          <Link
            key={article.id}
            href={`/jurnal/${article.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom:
                i < articles.length - 1 ? "1px solid var(--border)" : "none",
              textDecoration: "none",
              color: "inherit",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "10px",
                  color: "var(--text-subtle)",
                  letterSpacing: "0.04em",
                  marginBottom: "3px",
                }}
              >
                {formatEntryNumber(article.entryNumber)} ·{" "}
                {formatDateShort(article.publishedAt, article.locale)}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text)",
                  letterSpacing: "-0.01em",
                }}
              >
                {article.title}
              </div>
            </div>
            <div
              style={{
                background: "var(--bg-elevated)",
                borderRadius: "5px",
                padding: "2px 8px",
                boxShadow: "var(--shadow-badge)",
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "10px",
                color: "var(--text-subtle)",
                flexShrink: 0,
                marginLeft: "12px",
              }}
            >
              {readingTime.text}
            </div>
          </Link>
        )
      })}
    </div>

    <Link
      href="/jurnal"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "13px",
        color: "var(--text-muted)",
        textDecoration: "none",
        transition: "color 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
    >
      {viewAllLabel[lang]}
      <ArrowRight size={14} strokeWidth={2} />
    </Link>
  </>
)
```

- [ ] **Step 4: Simplify EmptyState — remove fake gradient card grid**

Find the `EmptyState` function. Replace it entirely with:

```tsx
function EmptyState({ empty }: { empty: StrapiEmptyState }) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ flex: 1, minWidth: "240px" }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 500,
            margin: "0 0 6px 0",
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          {empty.title}
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {empty.desc}
        </p>
      </div>
      {empty.cta && empty.ctaHref && (
        <a
          href={empty.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            background: "var(--text)",
            color: "var(--bg)",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            transition: "transform 0.15s ease",
          }}
        >
          {empty.cta}
          <ArrowUpRight size={14} strokeWidth={2} />
        </a>
      )}
    </div>
  )
}
```

Also remove the unused `gradients` array that was at the top of the old `EmptyState` — it's no longer needed.

- [ ] **Step 5: Verify dev server**

```bash
pnpm dev
```

Open http://localhost:3000. Check:
- Journal section shows rows with `#001 · JAN 2025` meta and title
- Reading time badge appears right-aligned with shadow
- Hover on rows fades opacity slightly
- Loading state shows skeleton rows (refresh while network throttled or check initial render)
- No TypeScript errors in terminal

Toggle dark mode and verify shadows switch correctly.

- [ ] **Step 6: Commit**

```bash
git add src/components/journal-section.tsx
git commit -m "style: replace journal card grid with row list, simplify EmptyState"
```

---

## Task 5: Final verification

- [ ] **Step 1: Build check**

```bash
pnpm build
```

Expected: no TypeScript errors, build completes successfully.

- [ ] **Step 2: Visual check — light mode**

Run `pnpm dev`, open http://localhost:3000 in light mode:
- Section labels: `01 ─────── ABOUT` / `02 ─────── JOURNAL` / `03 ─────── LAB` / `04 ─────── CONNECT`
- Hero name visibly heavier than before
- MetaItem cards: white background, 8px radius, subtle shadow, no top border-rule above them
- Journal rows: `#001 · JAN 2025` above title, reading time badge right-aligned
- No gradient placeholder cards anywhere

- [ ] **Step 3: Visual check — dark mode**

Toggle to dark mode:
- Section label rules use `--border` (`#1f1f1f`) — visible but subtle
- MetaItem cards: `#111111` background, white-ring shadow visible
- Reading time badges lift slightly off the dark background
- Journal row dividers match `--border` (`#1f1f1f`)

- [ ] **Step 4: Final commit if clean**

```bash
git add -A
git status  # confirm nothing unexpected staged
git commit -m "chore: homepage redesign complete — Direction B Linear Editorial"
```
