# Production Hardening — Design

**Date:** 2026-07-20
**Status:** Approved

## Purpose

Fix the runtime, reliability, SEO-adjacent, tooling, and operational defects
identified in the codebase audit without changing the public route structure.
The existing `/`, `/jurnal`, `/jurnal/[slug]`, `/portfolio`, and
`/portfolio/[slug]` URLs remain compatible. Locale-prefixed `/en` and `/id`
routes are explicitly deferred to a later migration.

## Scope and non-goals

This hardening pass includes:

- Repairing React Server Component boundaries and pre-hydration theme setup.
- Making CMS failures explicit, bounded by a timeout, and observable to callers.
- Reducing article-list responses to summary data and validating API inputs.
- Making heading IDs, the table of contents, and share URLs deterministic.
- Adding route-level failure UI, security headers, sitemap/robots metadata,
  automated tests, CI, and current project documentation.

This pass does not include:

- Locale-prefixed routes, redirects, canonical/hreflang migration, or Strapi
  schema changes.
- A visual redesign or a migration away from inline styles.
- Authentication, analytics, a CMS webhook, or a new deployment platform.

## Architecture

### Server and client boundaries

Static links and embeds remain Server Components. Hover behavior moves from
React event handlers to CSS so `ArticleCard` and `InstagramEmbed` can safely be
rendered in a server graph. Browser-only behavior remains in leaf Client
Components such as copy buttons, Mermaid, Giscus, theme controls, and language
controls.

The root layout executes the theme bootstrap as a real inline `<script>` before
hydration. `ThemeProvider` continues to own live theme changes. `LangProvider`
also synchronizes `document.documentElement.lang` after the user changes the
locale; server-rendered locale metadata remains an EN default until the future
URL migration.

### Strapi boundary and fallback policy

`src/lib/strapi/client.ts` remains the only REST client. Every request receives
an eight-second timeout. Errors retain endpoint and HTTP status context but are
not exposed verbatim through public API responses.

Mock behavior becomes environment-driven:

- No `NEXT_PUBLIC_STRAPI_URL`: use bundled mock data, preserving zero-config
  local development.
- Strapi configured and request succeeds: use Strapi.
- Strapi configured and request fails: propagate the error.
- `STRAPI_MOCK_FALLBACK=true`: explicitly allow fallback after a configured
  Strapi request fails, useful for preview/demo environments.

Pages surface propagated failures through App Router error boundaries. The
article API returns a stable JSON error with HTTP 503 rather than a successful
empty list.

### Article summaries

List and related-article queries return the following summary, which excludes
the Markdown `body`:

```ts
type StrapiArticleSummary = Pick<
  StrapiArticle,
  | "id"
  | "documentId"
  | "slug"
  | "title"
  | "excerpt"
  | "publishedAt"
  | "updatedAt"
  | "locale"
  | "cover"
  | "tags"
  | "author"
  | "featured"
  | "entryNumber"
>
```

`ArticleCard` consumes this summary. Its reading-time label is removed because
there is no trustworthy way to compute it without fetching the body or changing
the Strapi schema. Detail pages continue computing and displaying reading time
from the full `StrapiArticle.body`.

The Strapi list query requests only the scalar fields and relations needed by
cards. The public `/api/articles` route validates:

- `locale`: only `en` or `id`.
- `limit`: positive integer, maximum 50.
- `featured`: only the literal `true` enables the filter.

Invalid input returns HTTP 400 with a stable error code. CMS unavailability
returns HTTP 503. Successful responses retain `{ articles }` for client
compatibility.

The pure parser has this contract:

```ts
interface ArticlesQuery {
  locale: "en" | "id"
  limit?: number
  featured: boolean
}

class ArticlesQueryError extends Error {
  code: "INVALID_LOCALE" | "INVALID_LIMIT"
}

function parseArticlesQuery(params: URLSearchParams): ArticlesQuery
```

It returns a value or throws `ArticlesQueryError`. Public failures use one
shape without internal details:

```ts
interface ApiErrorResponse {
  articles: []
  error: {
    code: "INVALID_LOCALE" | "INVALID_LIMIT" | "CMS_UNAVAILABLE"
    message: string
  }
}
```

The journal page and homepage journal section expose loading, empty, and error
states. Request cancellation uses `AbortController`; a failed request never
leaves a permanent skeleton.

### Markdown headings and TOC

Heading IDs use the same GitHub-style slug algorithm for extraction and
rendering. Extraction parses Markdown into an mdast and derives visible heading
text with `mdast-util-to-string`, so links, emphasis, and inline code slug from
their rendered text rather than raw Markdown syntax. Rendering continues
through ReactMarkdown/rehype, then a shared heading-ID plugin applies the locale
prefix and duplicate counter.

Each locale body gets a namespace (`article-en` or `article-id`) so both
versions can coexist in the DOM without duplicate IDs. Duplicate headings
receive deterministic numeric suffixes across Markdown blocks, even when the
custom parser splits content around callouts or Instagram embeds.

`extractHeadings` returns the final prefixed ID. `TableOfContents` observes and
links to that exact ID. The plugin that prefixes rendered heading IDs shares a
counter across all Markdown blocks in one article body.

Block parsing moves to the named pure unit `src/lib/markdown-blocks.ts`, which
exports `parseMarkdownBlocks(body): MarkdownBlock[]`. An unclosed callout emits
one normal Markdown block containing the original `:::variant` opening line and
all buffered content verbatim; no input is discarded. Code fence parsing
continues to exclude callout/Instagram detection.

### Share URLs

Server-rendered share controls receive a URL derived from the specific article
being rendered, not `window` and not an EN-first fallback. The EN gate shares
the EN slug and the ID gate shares the ID slug. This fixes translated-slug
sharing while retaining existing routes.

### Operational surface

The application gains:

- `error.tsx`, `not-found.tsx`, and `loading.tsx` with bilingual-neutral,
  accessible recovery UI.
- `sitemap.ts` and `robots.ts` derived from known article/project slugs.
- Security headers in `next.config.mjs`: CSP, frame restrictions,
  `nosniff`, referrer policy, permissions policy, and HSTS.
- ESLint 10 flat configuration and scripts for lint, typecheck, unit test, and
  full verification.
- A GitHub Actions workflow using the pinned pnpm version and Node 20.
- Updated README/project docs for Next.js 16 and pnpm.

The current inline-style-heavy architecture requires an explicit
`'unsafe-inline'` policy rather than a nonce migration. Production CSP uses:

- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' https://giscus.app`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: blob: https:`
- `font-src 'self' data:`
- `connect-src 'self'`, the configured Strapi origin, `https://giscus.app`, and
  `https://api.github.com`
- `frame-src https://giscus.app`
- `worker-src 'self' blob:`
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and
  `frame-ancestors 'none'`

Development additionally permits `'unsafe-eval'` for Next.js tooling. Mermaid
is bundled locally and needs no external script origin. A future nonce-based CSP
is outside this pass because it would require replacing pervasive inline style
props.

`src/lib/site.ts` exports the canonical `SITE_URL`, sourced from
`NEXT_PUBLIC_SITE_URL` with `https://jurnal.dev` as the default. Metadata,
sitemap, robots, Giscus theme URLs, and share URLs use this value.

Sitemap generation always returns the base static routes. Dynamic article and
project slugs are best-effort: if a configured CMS fails, the error is logged
and dynamic entries are omitted. It never substitutes mock slugs after a
configured-CMS failure. In zero-config mock mode, mock dynamic slugs are valid
and included.

## Units and interfaces

| Unit | Responsibility | Public interface |
|---|---|---|
| `src/lib/strapi/client.ts` | Timed Strapi REST requests and narrow queries | `getArticles`, `getArticleBySlug`, project/landing/social fetchers |
| `src/lib/strapi/index.ts` | Mock policy and source selection | Existing `fetch*` facade plus article-summary return types |
| `src/lib/strapi/types.ts` | CMS domain and response types | `StrapiArticle`, `StrapiArticleSummary`, existing CMS types |
| `src/lib/api/articles-query.ts` | Pure query parsing and validation | `parseArticlesQuery(URLSearchParams)` |
| `src/lib/markdown-headings.ts` | Shared heading slug/ID policy | extraction and rehype ID-prefix plugin factory |
| `src/lib/markdown-blocks.ts` | Pure custom-block parser | `parseMarkdownBlocks(body)` returning lossless blocks |
| `src/lib/site.ts` | Canonical public origin | `SITE_URL` |
| `src/app/api/articles/route.ts` | HTTP contract only | `GET` returning 200, 400, or 503 JSON |
| `ArticleBody` | Markdown block parsing and rendering | `body` plus optional `headingPrefix` |
| `TableOfContents` | Observe and navigate exact heading IDs | `headings` array from the shared extractor |

## Error handling

- Network timeout, non-2xx Strapi response, or invalid JSON propagates through
  the data facade unless explicit mock fallback is enabled.
- Public APIs log the internal error server-side and return a non-sensitive,
  stable error payload.
- Client fetchers abort stale locale requests and transition to an error state.
- Route error UI offers retry and navigation home.
- Clipboard, Mermaid, and Giscus integrations continue degrading locally
  without taking down article content.

## Testing and acceptance criteria

Pure behavior is covered with Vitest:

- Article query validation and limits.
- Mock fallback policy.
- Request timeout propagation and public API 503 sanitization.
- Heading IDs including duplicate, Unicode, and locale-prefix cases.
- Heading text containing links, emphasis, and inline code.
- `parseMarkdownBlocks` handling of closed and unclosed callouts, Instagram
  URLs, and fenced code without losing content.
- Sitemap degradation when a configured CMS is unavailable.
- Theme bootstrap behavior with missing or corrupt localStorage values.

Repository verification must pass:

1. Frozen dependency installation.
2. ESLint.
3. TypeScript no-emit check.
4. Unit tests.
5. Next.js production build.
6. Playwright browser tests against mock mode for home, journal, article,
   portfolio, theme switching, locale switching, TOC anchors, translated share
   links, and missing routes.

Vitest runs pure unit tests through `pnpm test`. Playwright Test owns the server
lifecycle through `webServer` in `playwright.config.ts` and runs through
`pnpm test:e2e`. `pnpm verify` runs lint, typecheck, unit tests, and build;
`pnpm verify:e2e` runs `verify` followed by Playwright.

CI uses Node 20, installs Chromium through Playwright, and runs
`pnpm verify:e2e`. No acceptance criterion requires the deferred `/en` or `/id`
route migration. CSP acceptance is based on the production server used by the
Playwright suite, including console and failed-request checks for required
Next.js, Strapi, and Giscus origins.
