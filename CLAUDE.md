# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Dev server (http://localhost:3000)
pnpm build      # Production build
pnpm start      # Run production build
pnpm lint       # ESLint via next lint
```

No test suite. Formatting via Prettier (`.prettierrc`).

## Environment

Copy `.env.example` → `.env.local`. Both vars are optional:

- `NEXT_PUBLIC_STRAPI_URL` + `STRAPI_API_TOKEN` — CMS. Without these, app uses mock data (`src/lib/strapi/mock.ts`)
- `NEXT_PUBLIC_GISCUS_REPO` + `NEXT_PUBLIC_GISCUS_REPO_ID` + `NEXT_PUBLIC_GISCUS_CATEGORY` + `NEXT_PUBLIC_GISCUS_CATEGORY_ID` — comments. Hidden if unset

## Architecture

Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS v4, deployed standalone (`output: "standalone"`).

### Data layer: `src/lib/strapi/`

- `index.ts` — public API (`fetchArticles`, `fetchArticleBySlug`, `fetchRelatedArticles`, `fetchAllSlugs`). Auto-falls back to mock if `NEXT_PUBLIC_STRAPI_URL` unset or request fails
- `client.ts` — REST calls to Strapi v5
- `mock.ts` — 5 sample articles for local dev
- `types.ts` — `StrapiArticle`, `StrapiAuthor`, `StrapiTag`, `StrapiImage`, `Locale`

### Article rendering pipeline

`/jurnal/[slug]/page.tsx` (server) fetches both EN + ID article versions in parallel, computes reading time and headings, then passes pre-rendered bodies to `ArticleView`.

`article-view.tsx` (server async component) calls `ArticleBody` to pre-render markdown server-side (Shiki syntax highlighting runs here, zero client JS). Both locale bodies are rendered into the DOM; `LocaleGate` (client component) shows/hides via CSS `display` based on `LangContext`.

`article-body.tsx` custom parser splits markdown into blocks before ReactMarkdown: callouts (`:::info/warning/tip/success :::`), Instagram embeds (bare URL on own line), and regular markdown. Shiki highlights all code blocks server-side.

### i18n

`LangContext` (`src/contexts/lang-context.tsx`) — client context storing `"en" | "id"`. `LocaleGate` wraps content blocks with `display: block/none`. Both locale versions are always in the DOM (SSR-friendly, no re-fetch on toggle). Browser locale auto-detects on first load.

### Theme

`ThemeContext` (`src/contexts/theme-context.tsx`) — `"light" | "dark" | "system"`, persisted to localStorage. `theme-script.ts` injects inline script in `<head>` to set `document.documentElement.classList` before hydration (prevents flash). Shiki uses `github-light` / `github-dark-dimmed` dual themes via CSS variables.

### Styling

All colors via CSS variables in `src/app/globals.css` (`:root` + `.dark`). No Tailwind for article body — inline styles only (theme-aware via CSS vars). `grid-overlay` class applies the Swiss-grid background. Giscus themes live in `public/giscus-theme-light.css` / `public/giscus-theme-dark.css`.

### ISR

Article pages revalidate every 60s (`export const revalidate = 60` in `page.tsx`).

## Key types

```ts
type Locale = "en" | "id"

interface StrapiArticle {
  slug: string; title: string; excerpt: string; body: string  // Markdown
  locale: Locale; publishedAt: string
  localizations?: Array<{ locale: Locale; slug: string; ... }>
  cover?: StrapiImage; tags?: StrapiTag[]; author?: StrapiAuthor
  featured?: boolean; entryNumber?: number
}
```

## Personal content

- Personal info, taglines, about text, social links: `src/lib/content.ts`
- SEO metadata: `src/app/layout.tsx` (`metadata` export, `metadataBase`)
- Avatar SVG: `src/components/avatar.tsx`
- Landing code snippet: `src/components/code-snippet.tsx`
