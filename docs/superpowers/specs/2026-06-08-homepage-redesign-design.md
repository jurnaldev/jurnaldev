# Homepage Redesign — Design Spec

**Date:** 2026-06-08  
**DNA:** Linear primary · Vercel secondary · Raycast tertiary  
**Scope:** Homepage (`page.tsx`) + `primitives.tsx` + `journal-section.tsx` only. Article pages untouched.

---

## What Changes

### 1. SectionLabel — `src/components/primitives.tsx`

**Before:** `01 /` plain mono text, left-aligned, positive letter-spacing  
**After:** three-piece flex row — number left, horizontal rule center, label right

```
[01]  ─────────────────────  [ABOUT]
```

Values:
- Container: `display: flex`, `align-items: center`, `gap: 10px`
- Number + label: `font-family: geist-mono`, `font-size: 11px`, `font-weight: 500`, `letter-spacing: 0.3px`, `text-transform: uppercase`, `color: var(--text-subtle)`, `flex-shrink: 0`
- Rule: `flex: 1`, `height: 1px`, `background: var(--border)`
- `marginBottom: 1.5rem` (unchanged)

---

### 2. MetaItem — `src/components/primitives.tsx`

**Before:** bare text block, no background  
**After:** small surface card with shadow depth, 8px radius

Values:
- Background: `var(--bg-elevated)`
- Border-radius: `8px`
- Padding: `10px 12px`
- Shadow light: `0 0 0 1px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)`
- Shadow dark: `0 0 0 1px rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.25)`
- No `border` property — shadow-as-border handles it
- Label: unchanged (mono, 10px, uppercase, `--text-subtle`)
- Value: unchanged (14px, `--text`)

The grid wrapper in `page.tsx` `About` section changes from `paddingTop: 1.5rem, borderTop: 1px solid var(--border)` to just `paddingTop: 1.5rem` — the cards carry their own visual weight now.

---

### 3. JournalSection — `src/components/journal-section.tsx`

**Before:** `repeat(auto-fit, minmax(220px, 1fr))` grid of `ArticleCard` components with 140px gradient cover images  
**After:** flat vertical list of rows, one per article, `border-bottom` hairline dividers

Each row layout:
- Container: `padding: 10px 0`, `display: flex`, `align-items: center`, `justify-content: space-between`, `border-bottom: 1px solid var(--border)`
- Last row: `border-bottom: none`
- Left: entry number + date meta line above title
  - Meta: `font-family: geist-mono`, `font-size: 10px`, `color: var(--text-subtle)`, `letter-spacing: 0.04em`, `margin-bottom: 3px` — format: `#001 · JAN 2025`
  - Title: `font-size: 14px`, `font-weight: 500`, `color: var(--text)`, `letter-spacing: -0.01em`
- Right: reading-time badge
  - Background: `var(--bg-elevated)`
  - Border-radius: `5px`
  - Padding: `2px 8px`
  - Shadow light: `0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)`
  - Shadow dark: `0 0 0 1px rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.3)`
  - Font: `font-family: geist-mono`, `font-size: 10px`, `color: var(--text-subtle)`

Loading skeleton: 3 rows of the same structure but with `background: var(--border)` placeholder blocks instead of text.

---

### 4. EmptyState — `src/components/journal-section.tsx`

**Before:** 3 fake gradient placeholder cards + CTA banner below  
**After:** CTA banner only — no fake card grid

The fake card grid (`[0,1,2].map(...)` with gradient backgrounds) is removed entirely. The `EmptyState` component renders just the existing CTA banner (`bg-elevated`, `border`, `10px radius`, title + description + optional CTA button). This is already well-designed and needs no change.

---

### 5. Hero h1 weight — `src/app/page.tsx`

**Before:** `fontWeight: 500`  
**After:** `fontWeight: 600`

Everything else on the Hero unchanged (size, tracking, line-height, color).

---

## What Does NOT Change

- Grid overlay
- Geist font stack
- CSS custom properties in `globals.css`
- Avatar component
- SocialLinks component
- CodeSnippet / Lab section
- Footer
- Article detail pages (`/jurnal/[slug]/`)
- Journal listing page (`/jurnal/`)
- ArticleCard component
- ThemeToggle / LangToggle
- Any server-side data fetching

---

## Shadow System Reference

| Context | Light mode | Dark mode |
|---------|-----------|-----------|
| Meta card | `0 0 0 1px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)` | `0 0 0 1px rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.25)` |
| Reading-time badge | `0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)` | `0 0 0 1px rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.3)` |

Dark-mode shadows require a CSS media query or `.dark` class check. Since the project uses a `.dark` class on `<html>` (not `prefers-color-scheme`), shadows must be implemented via inline style with a context-aware value — or extracted to a CSS variable.

Preferred approach: add two CSS variables to `globals.css`:
```css
:root {
  --shadow-card: 0 0 0 1px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-badge: 0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
}
.dark {
  --shadow-card: 0 0 0 1px rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.25);
  --shadow-badge: 0 0 0 1px rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.3);
}
```

Then components use `boxShadow: 'var(--shadow-card)'` — no JS theme detection needed.

---

## Files to Touch

| File | Change |
|------|--------|
| `src/components/primitives.tsx` | SectionLabel layout + MetaItem card treatment |
| `src/components/journal-section.tsx` | Replace card grid with row list + simplify EmptyState |
| `src/app/page.tsx` | h1 weight 500→600, remove borderTop from meta grid wrapper |
| `src/app/globals.css` | Add `--shadow-card` + `--shadow-badge` CSS vars |
