# Design Revamp — DESIGN.md Adaptation

**Date:** 2026-06-10
**Branch:** feat/revamp
**Scope:** All pages + shared primitives

---

## Overview

Apply the Runwai DESIGN.md system to jurnal.dev. Direction B (Adapted): DESIGN.md design language mapped onto the existing CSS var infrastructure. Geist replaces abcNormal (closest open-source substitute). Light + dark mode preserved — dark palette is an adaptive inversion of the light tokens. No new font dependency.

Approach 1 (Var rename + remap): CSS variable names are renamed to match DESIGN.md tokens exactly. All components updated to use new var names. Clean system alignment.

---

## 1. Color & Token System

### CSS Variable Renames

All vars in `src/app/globals.css` are renamed and revalued. Syntax color vars (`--syntax-*`) are out of scope and unchanged.

#### Light mode (direct from DESIGN.md)

| New var | Value | Replaces |
|---|---|---|
| `--canvas` | `#ffffff` | `--bg-elevated`, `--bg-card` |
| `--canvas-warm` | `#fefefe` | `--bg` (`#fafaf7`) |
| `--ink` | `#030303` | `--text` (`#0a0a0a`) |
| `--ink-soft` | `#1a1a1a` | — |
| `--graphite` | `#404040` | (body copy, was `--text-muted` `#666`) |
| `--slate` | `#676f7b` | `--text-muted` (secondary) |
| `--stone` | `#939393` | `--text-subtle` (`#999`) |
| `--hairline` | `#e7eaf0` | `--border` (`#e5e5e0`) |
| `--hairline-soft` | `#c9ccd1` | `--border-hover` |
| `--surface-cool` | `#d0d4d4` | `--code-bg` |
| `--primary` | `#000000` | — |
| `--on-primary` | `#ffffff` | — |
| `--footer-bg` | `#030303` | — |
| `--scrim` | `#1a1a1a` | — |

#### Dark mode (adaptive inversion)

| Var | Dark value | Rationale |
|---|---|---|
| `--canvas` | `#0a0a0a` | Inverted page bg |
| `--canvas-warm` | `#111111` | Elevated surface |
| `--ink` | `#ededed` | Primary text on dark |
| `--ink-soft` | `#d0d0d0` | Secondary headings |
| `--graphite` | `#8a8a8a` | Body copy on dark |
| `--slate` | `#6b7280` | Tertiary text |
| `--stone` | `#404040` | Subtle labels |
| `--hairline` | `#1f1f1f` | Dividers on dark |
| `--hairline-soft` | `#2a2a2a` | Hover borders |
| `--surface-cool` | `#1a1a1a` | Thumbnail placeholder |
| `--primary` | `#ededed` | White pill CTA on dark |
| `--on-primary` | `#0a0a0a` | Text inside pill on dark |
| `--footer-bg` | `#0f0f0f` | Footer surface on dark |
| `--scrim` | `#1a1a1a` | Unchanged |

`--shadow-card` and `--shadow-badge` are removed — DESIGN.md uses no drop shadows.

---

## 2. Typography

Font family unchanged: Geist Sans (`var(--font-geist-sans)`) as abcNormal substitute. Geist Mono retained for code/meta where specified.

### Token changes

| Role | Size | Weight before → after | Tracking |
|---|---|---|---|
| Display h1 (hero) | clamp → 48px | 600 → **400** | `-1.2px` |
| Heading-md (article h1, journal page h1) | 36px | 500 → **400** | `-0.9px` |
| Heading-sm (card titles) | 24px | 500 → **400** | `0` |
| Subtitle (hero sub-copy) | 20px | 400 unchanged | `0` |
| Body | 16px | 400 unchanged | `0`, `line-height: 1.5` |
| Body-tight (card excerpts) | 16px | 400 | `-0.16px`, `line-height: 1.3` |
| Eyebrow (SectionLabel) | 11px | 500 unchanged | `+0.3px`, uppercase |
| Meta (dates, entry numbers) | 13px | 400 | `-0.26px` |
| Button labels | 14px | 500 → **600** | `0` |
| Micro-caps (tags) | 10–11px | varied → **500** | `+0.2px`, uppercase |

**Principle:** Hierarchy via size + tracking, not weight contrast. No heading is bold.

---

## 3. Components

### `src/app/globals.css`
- Rename all vars per Section 1 table
- Remove `--shadow-card`, `--shadow-badge`
- Remove `grid-overlay` Swiss-grid background (not in DESIGN.md)
- Page background: `var(--canvas-warm)` (body bg) and `var(--canvas)` (card/elevated)

### `src/components/layout/site-header.tsx`
- Add `borderBottom: "1px solid var(--hairline)"` to header element
- Nav links: switch from Geist Mono to Geist Sans, `fontSize: "14px"`, `fontWeight: 600`, color `var(--slate)` (inactive) / `var(--ink)` (active)
- Wordmark: `var(--ink)`, `fontSize: "14px"`, `fontWeight: 600`, `letterSpacing: "-0.3px"`

### `src/components/home/hero.tsx`
- h1: `fontWeight: 400`, `letterSpacing: "-1.2px"`, `lineHeight: 1`
- Role/tagline paragraph: `color: "var(--graphite)"`, `fontSize: "20px"`, `letterSpacing: 0`
- Location/handle labels: keep Geist Mono, color `var(--stone)`, `fontSize: "11px"`, `letterSpacing: "0.2px"`, uppercase

### `src/components/ui/section-label.tsx`
- Number span: color `var(--slate)`, `fontSize: "11px"`, `letterSpacing: "0.35px"`
- Rule line: `var(--hairline)`
- Label span: color `var(--slate)`, same tracking

### `src/components/ui/meta-item.tsx`
- Remove `boxShadow`
- Replace background + borderRadius with flat `border: "1px solid var(--hairline)"`, `borderRadius: 0`
- Label: color `var(--stone)`, `fontSize: "10px"`, `letterSpacing: "0.2px"`, uppercase
- Value: color `var(--ink)`, `fontSize: "13px"`

### `src/components/ui/tag.tsx`
- `fontSize: "10px"`, `fontWeight: 500`, `letterSpacing: "0.2px"`, `textTransform: "uppercase"`
- `color: "var(--slate)"`, `border: "1px solid var(--hairline)"`, `borderRadius: "9999px"`
- Remove `background: var(--bg-elevated)` — transparent background

### `src/components/journal-section.tsx` (home)
- Row list: each entry is `display: flex`, thumbnail (56×38px, `borderRadius: "6px"`, `background: var(--surface-cool)`) + text block
- Meta: `fontSize: "9px"`, `color: var(--slate)`, uppercase, mono
- Title: `fontSize: "13px"`, `fontWeight: 400`, `letterSpacing: "-0.3px"`, `color: var(--ink)`
- Row separator: `borderBottom: "1px solid var(--hairline)"`
- "View all" link → `button-ghost` pill: `border: "1px solid var(--ink)"`, `borderRadius: "9999px"`, `padding: "6px 16px"`, `fontSize: "13px"`, `fontWeight: 600`
- Remove reading-time badge (shadow-badge removed)

### `src/components/article/article-card.tsx`
- Convert from vertical card to horizontal row: flex row, thumbnail left (80×54px, `borderRadius: "6px"`), text right
- Remove cover image height div; thumbnail uses `var(--surface-cool)` placeholder when no cover
- Meta strip: `fontSize: "9px"`, `color: var(--slate)`, uppercase
- Title: `fontWeight: 400`, `letterSpacing: "-0.4px"`
- Excerpt: `fontSize: "12px"`, `color: var(--graphite)`, `lineHeight: 1.4`
- Tags row at bottom: updated Tag component

### `src/app/jurnal/page.tsx`
- Remove inline local `ArticleCard` and `CoverIllustration` — use shared `ArticleCard` from `src/components/article/article-card.tsx` instead
- Remove grid layout — replace with flat list of `ArticleCard` rows
- Page h1: `fontWeight: 400`, `letterSpacing: "-1px"`, `color: var(--ink)`
- Page eyebrow above h1: `fontSize: "11px"`, `color: var(--slate)`, uppercase, `letterSpacing: "0.35px"`
- Subtitle: `color: var(--graphite)`
- Entry count: `fontSize: "11px"`, `color: var(--stone)`, mono, `letterSpacing: "0.2px"`
- Top hairline divider above list
- `LoadingGrid` → `LoadingList`: skeleton rows matching new row layout

### `src/components/article/article-header.tsx`
- Meta strip (entry/date/reading time): `fontSize: "10px"`, `color: var(--slate)`, uppercase, mono, `letterSpacing: "0.2px"`. Separator: `/` in `var(--hairline)`
- h1: `fontWeight: 400`, `letterSpacing: "-1.2px"`, `lineHeight: 1.05`
- Excerpt: `fontSize: "16px"`, `color: var(--graphite)`, `lineHeight: 1.5`
- Cover image: `borderRadius: "8px"`, remove border (flat)
- Tags row: updated Tag component

### `src/components/home/home-footer.tsx`
- Outer div: `background: "var(--footer-bg)"`, `color: "var(--on-primary)"`, negative horizontal margin to bleed to container edge
- Eyebrow text spans: `color: "var(--stone)"`, `fontSize: "11px"`, `letterSpacing: "0.2px"`, uppercase

### `src/components/home/about-section.tsx`
- Markdown `p` color: `var(--graphite)` (was `var(--text)`)
- Link color: `var(--ink)` with underline

---

## 4. What Does NOT Change

- Article body typography (`article-body.tsx`) — Shiki code highlighting, callouts, Instagram embeds untouched
- `AuthorCard`, `RelatedArticles`, `ShareButtons`, `GiscusComments` — out of scope for this revamp
- Geist Mono for code blocks, inline code
- i18n / LangContext / ThemeContext logic
- ISR / data fetching

---

## 5. File Inventory

Files modified:
1. `src/app/globals.css`
2. `src/components/layout/site-header.tsx`
3. `src/components/home/hero.tsx`
4. `src/components/home/about-section.tsx`
5. `src/components/home/home-footer.tsx`
6. `src/components/ui/section-label.tsx`
7. `src/components/ui/meta-item.tsx`
8. `src/components/ui/tag.tsx`
9. `src/components/journal-section.tsx`
10. `src/components/article/article-card.tsx`
11. `src/app/jurnal/page.tsx`
12. `src/components/article/article-header.tsx`
