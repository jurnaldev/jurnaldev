# Portfolio Pages — Design

**Date:** 2026-06-12
**Status:** Approved

## Purpose

Add portfolio pages to jurnal.dev for a mixed personal-brand audience (recruiters, peers, readers). Projects-only scope — career history stays in the About section. Structure: index page at `/portfolio` plus per-project case-study pages at `/portfolio/[slug]`.

## Decisions (from brainstorm)

| Question | Decision |
|---|---|
| Audience | Mixed / personal brand |
| Structure | Index + detail pages |
| Data source | Strapi CMS (new `project` collection), mock fallback |
| i18n | Bilingual EN/ID via existing `LocaleGate` pattern |
| Index layout | Featured project card + compact numbered list (option C) |
| Detail layout | Split header + spec-sheet meta table (option B) |
| Entry points | Header nav link + homepage "Selected Work" section |
| Work history | Not included — projects only |

## Data model

New Strapi collection type `project` (i18n enabled, draft/publish on):

```ts
export interface StrapiProject {
  id: number
  documentId: string
  slug: string
  title: string
  excerpt: string          // one-liner for index rows + featured blurb
  body: string             // Markdown case study
  year: number
  status: "live" | "wip" | "archived"
  stack: string[]          // JSON field, e.g. ["Python", "LLM"]
  githubUrl?: string | null
  demoUrl?: string | null
  publishedAt: string
  updatedAt: string
  locale: Locale
  localizations?: Array<{ id: number; documentId: string; locale: Locale; slug: string }>
  cover?: StrapiImage | null
  gallery?: StrapiImage[]  // extra screenshots
  featured?: boolean       // drives big card on index + homepage section
  order?: number           // manual curated sort (001, 002, ...)
}
```

Notes:

- `stack` is a JSON string array, not a relation to `tags` — project stack labels differ from journal topic tags and should not pollute the tag namespace.
- `order` is a manual sort field because a portfolio is curated, not chronological.

### Fetchers (`src/lib/strapi/`)

Same auto-fallback-to-mock pattern as articles:

- `fetchProjects(locale)` — all projects sorted by `order`
- `fetchProjectBySlug(slug, locale)`
- `fetchAllProjectSlugs()` — for `generateStaticParams`
- `mock.ts` gains 3–4 sample projects so local dev works without Strapi

## Routes & pages

```
src/app/portfolio/
  page.tsx           — index (featured + numbered list)
  [slug]/
    page.tsx         — detail (split header + spec sheet)
    project-view.tsx — server component, mirrors article-view.tsx
```

### Index `/portfolio`

- Server component; fetches EN + ID project lists in parallel. Both locale versions rendered in the DOM, `LocaleGate` toggles visibility (same as journal).
- Featured project (first with `featured: true`): cover image left (~46% width), `Featured · 001` label, title, excerpt, stack tags; links to detail page.
- Remaining projects: compact hairline rows — order number, title, one-line excerpt, `year · status` right-aligned.
- Empty state when no projects exist.
- `export const revalidate = 60` (ISR, matches articles).

### Detail `/portfolio/[slug]`

- `generateStaticParams` from `fetchAllProjectSlugs`; ISR 60s; `notFound()` on missing slug.
- Fetches both locale versions via `localizations` (same flow as article page).
- Header: left column — project label, title, excerpt, hairline meta table (Year / Status / Stack / Links with external-link icons); right column — cover image. Stacks vertically on mobile, cover on top.
- Body: rendered with existing `ArticleBody` (Shiki, callouts, embeds work unchanged).
- Gallery: stacked images below body when present, captions from `alternativeText`.
- Footer nav: "← All projects" link back to index. No related-projects section (YAGNI).
- `generateMetadata`: title, description from excerpt, OG image from cover.

GSAP entrance animations follow later using the `home-animations.tsx` pattern — out of scope for this spec.

## Components

```
src/components/portfolio/
  featured-project.tsx   — index featured card
  project-row.tsx        — compact numbered row
  project-meta.tsx       — hairline spec table (Year/Status/Stack/Links)
  project-gallery.tsx    — stacked screenshots
src/components/home/
  work-section.tsx       — homepage "Selected Work" section
```

Reused as-is: `ArticleBody`, `LocaleGate`, `SectionLabel`, `Tag`, `site-header`, existing GSAP patterns.

## Entry points

- **Homepage:** new `work-section.tsx` between the Journal and Lab sections. Section label "Selected Work", up to 3 projects as compact rows (featured projects first, then by `order`), "View all →" link to `/portfolio`. Homepage fetches projects alongside articles in parallel. Section hidden entirely when zero projects.
- **Header nav:** "Portfolio" link in `site-header.tsx` next to Journal. Labels: EN "Portfolio" / ID "Portofolio".

## i18n UI labels

Added to `src/lib/content.ts` following the existing structure: section titles, "View all", meta table labels (Year/Tahun, etc.). Status badges ("Live", "WIP", "Archived") stay English in both locales.

## Error handling

- Strapi unreachable or env unset → automatic mock fallback (existing pattern).
- Featured project without cover → rendered as a row instead of the featured card (no broken image box).
- No project flagged `featured` → first project by `order` is promoted to the featured slot.
- External links always get `rel="noopener noreferrer" target="_blank"`.

## Verification

No test suite in this repo. Verification is:

1. `pnpm build` passes.
2. Manual check with mock data via webapp-testing screenshots: both pages, both locales (EN/ID), both themes (light/dark), mobile + desktop widths.
