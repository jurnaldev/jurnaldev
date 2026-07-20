# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Dev server (http://localhost:3000)
pnpm build      # Production build
pnpm start      # Run production build
pnpm lint       # ESLint flat config
pnpm typecheck  # TypeScript no-emit validation
pnpm test       # Vitest unit tests
pnpm test:e2e   # Playwright against an existing production build
pnpm verify     # Lint + typecheck + tests + production build
pnpm verify:e2e # Full verification including Playwright
```

Unit tests live beside source as `*.test.ts`; browser tests live in
`tests/e2e/`. Formatting uses Prettier (`.prettierrc`).

## Environment

Copy `.env.example` → `.env.local`. Both vars are optional:

- `NEXT_PUBLIC_STRAPI_URL` + `STRAPI_API_TOKEN` — CMS. Without a URL, app uses mock data (`src/lib/strapi/mock.ts`). With a URL, failures propagate unless `STRAPI_MOCK_FALLBACK=true` is explicitly set.
- `NEXT_PUBLIC_SITE_URL` — canonical public origin (defaults to `https://jurnal.dev`)
- `NEXT_PUBLIC_GISCUS_REPO` + `NEXT_PUBLIC_GISCUS_REPO_ID` + `NEXT_PUBLIC_GISCUS_CATEGORY` + `NEXT_PUBLIC_GISCUS_CATEGORY_ID` — comments. Hidden if unset

## Architecture

Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, deployed standalone (`output: "standalone"`).

### Data layer: `src/lib/strapi/`

- `index.ts` — public API (`fetchArticles`, `fetchArticleBySlug`, `fetchRelatedArticles`, `fetchAllSlugs`). Uses mock data when `NEXT_PUBLIC_STRAPI_URL` is unset. Configured CMS failures propagate unless `STRAPI_MOCK_FALLBACK=true` explicitly enables preview/demo fallback
- `client.ts` — REST calls to Strapi v5
- `mock.ts` — 5 sample articles for local dev
- `types.ts` — `StrapiArticle`, `StrapiAuthor`, `StrapiTag`, `StrapiImage`, `Locale`

### Article rendering pipeline

`/[locale]/jurnal/[slug]/page.tsx` validates the locale and fetches only that
localized article. It computes reading time and headings for the requested body,
fetches related articles in the same locale, and uses Strapi localization data
only to build a translated-slug language destination and metadata alternates.

`article-view.tsx` calls `ArticleBody` to pre-render one Markdown body server-side
(Shiki syntax highlighting runs here, zero highlighting client JS). Project
details follow the same single-locale fetch/render model.

`article-body.tsx` custom parser splits markdown into blocks before ReactMarkdown: callouts (`:::info/warning/tip/success :::`), Instagram embeds (bare URL on own line), and regular markdown. Shiki highlights all code blocks server-side.

### i18n

Public pages live under `/en` and `/id`; `params.locale` is the source of truth.
`LangProvider` (`src/contexts/lang-context.tsx`) exposes that validated route
locale as read-only state and may persist it after navigation, but storage never
overrides the URL. `LangToggle` navigates instead of mutating context. General
pages preserve page type; detail pages use the real translated slug or disable
the unavailable locale control. There is no browser-language auto-redirect.

Legacy `/`, `/jurnal`, and `/portfolio` routes permanently redirect (`308`) to
English. Legacy detail handlers resolve both locales, prefer English on a slug
collision, preserve query strings, and propagate CMS failures. `/api/articles`
remains unprefixed and keeps the `/api/articles?locale=en|id` contract.

Localized pages own their canonical and hreflang metadata. Sitemap, Open Graph,
and share URLs use locale-prefixed paths. Giscus retains `mapping="specific"`
and `term={slug}` so the migration does not rename existing discussions.

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
- Shared SEO metadata: `src/app/[locale]/layout.tsx`; self canonicals and
  language alternates are owned by localized pages
- Avatar SVG: `src/components/avatar.tsx`
- Landing code snippet: `src/components/code-snippet.tsx`
