# Localized URL Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every public page to deterministic `/en` and `/id` URLs, preserve legacy links with `308` redirects, and make URL locale agree with fetched content, HTML language, metadata, sitemap, sharing, and navigation.

**Architecture:** Move the public root layout and pages beneath `src/app/[locale]`, keep non-page endpoints outside that segment, and replace old pages with thin redirect route handlers. Centralize locale paths, metadata, and legacy slug resolution in focused pure modules; pages fetch one locale and language switching navigates to a real localized URL.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6 strict, Strapi v5 REST, Vitest, Playwright, ESLint 9, pnpm 10.

**Approved spec:** `docs/superpowers/specs/2026-07-20-localized-url-migration-design.md`

---

## File Map

### New focused modules

- `src/lib/i18n/routing.ts`: locale constants, validation, encoded path builders,
  and locale replacement.
- `src/lib/i18n/routing.test.ts`: routing contract tests.
- `src/lib/i18n/metadata.ts`: canonical, language alternates, and Open Graph
  locale helpers.
- `src/lib/i18n/metadata.test.ts`: metadata helper tests.
- `src/lib/i18n/legacy-redirect.ts`: deterministic old-detail slug resolver.
- `src/lib/i18n/legacy-redirect.test.ts`: collision, not-found, and outage tests.
- `src/components/journal-list.tsx`: client loading/retry UI extracted from the
  current journal page and driven by a locale prop.
- `src/app/route.ts`, `src/app/jurnal/route.ts`,
  `src/app/jurnal/[slug]/route.ts`, `src/app/portfolio/route.ts`, and
  `src/app/portfolio/[slug]/route.ts`: legacy `308` adapters.

### Moved public route tree

- `src/app/layout.tsx` -> `src/app/[locale]/layout.tsx`
- `src/app/page.tsx` -> `src/app/[locale]/page.tsx`
- `src/app/error.tsx` -> `src/app/[locale]/error.tsx`
- `src/app/loading.tsx` -> `src/app/[locale]/loading.tsx`
- `src/app/not-found.tsx` -> `src/app/[locale]/not-found.tsx`
- `src/app/jurnal/page.tsx` -> `src/app/[locale]/jurnal/page.tsx`
- `src/app/jurnal/[slug]/page.tsx` ->
  `src/app/[locale]/jurnal/[slug]/page.tsx`
- `src/app/jurnal/[slug]/article-view.tsx` ->
  `src/app/[locale]/jurnal/[slug]/article-view.tsx`
- `src/app/portfolio/page.tsx` -> `src/app/[locale]/portfolio/page.tsx`
- `src/app/portfolio/[slug]/page.tsx` ->
  `src/app/[locale]/portfolio/[slug]/page.tsx`
- `src/app/portfolio/[slug]/project-view.tsx` ->
  `src/app/[locale]/portfolio/[slug]/project-view.tsx`

### Existing files with behavioral changes

- `src/contexts/lang-context.tsx`: read-only route-derived locale.
- `src/components/lang-toggle.tsx`: link navigation and unavailable state.
- `src/components/layout/site-header.tsx`: localized nav and detail alternate
  destination.
- `src/components/journal-section.tsx`: one locale prop and localized links.
- `src/components/article/article-card.tsx`,
  `src/components/article/related-articles.tsx`,
  `src/components/portfolio/featured-project.tsx`,
  `src/components/portfolio/project-row.tsx`, and
  `src/components/home/work-section.tsx`: locale-aware internal links.
- `src/components/article/giscus-comments.tsx`: preserve stable slug term while
  reading language from the route provider.
- `src/lib/site.ts`: localized absolute URL builders.
- `src/lib/strapi/types.ts`, `src/lib/strapi/client.ts`,
  `src/lib/strapi/mock.ts`, and `src/lib/strapi/index.ts`: localized slug record
  enumeration.
- `src/lib/sitemap.ts` and tests: localized sitemap plus paired alternates.
- `src/app/sitemap.ts`: consume the new enumeration contract.
- `tests/e2e/smoke.spec.ts`: replace old route assertions with localized route,
  redirect, metadata, toggle, and compatibility coverage.
- `CLAUDE.md`, `DOCS.md`, and `README.md`: document locale routing and commands.

## Chunk 1: Pure Routing and SEO Contracts

### Task 1: Establish the locale routing contract

**Files:**
- Create: `src/lib/i18n/routing.ts`
- Create: `src/lib/i18n/routing.test.ts`
- Modify: `src/lib/strapi/types.ts`

- [ ] **Step 1: Write failing validation and path tests**

Cover this contract explicitly:

```ts
expect(isLocale("en")).toBe(true)
expect(isLocale("id")).toBe(true)
expect(isLocale("fr")).toBe(false)
expect(() => assertLocale("fr")).toThrow("Unsupported locale: fr")
expect(localizedPath("id", "jurnal", "judul dengan spasi")).toBe(
  "/id/jurnal/judul%20dengan%20spasi",
)
expect(replacePathLocale("/en/jurnal/a?draft=1", "id")).toBe(
  "/id/jurnal/a?draft=1",
)
expect(replacePathLocale("/jurnal/a", "id")).toBeNull()
expect(localizedPath("en", "jurnal", "already%20encoded")).toBe(
  "/en/jurnal/already%2520encoded",
)
```

Also test home, listing, article, and project builders, no trailing slash, and
that query strings plus non-locale segments survive locale replacement exactly.
The public helper accepts decoded path segments; `%` is treated as a literal
character and encoded to `%25`, so callers must never pre-encode slugs.

- [ ] **Step 2: Run the focused test and confirm red state**

Run:

```bash
pnpm vitest run src/lib/i18n/routing.test.ts
```

Expected: FAIL because the i18n routing module and localized URL builders do
not exist.

- [ ] **Step 3: Implement the smallest routing API**

Export the following stable surface:

```ts
export const locales = ["en", "id"] as const
export type Locale = (typeof locales)[number]

export function isLocale(value: string): value is Locale
export function assertLocale(value: string): Locale
export function localizedPath(
  locale: Locale,
  ...decodedSegments: string[]
): string
export function homePath(locale: Locale): string
export function journalPath(locale: Locale): string
export function articlePath(locale: Locale, decodedSlug: string): string
export function portfolioPath(locale: Locale): string
export function projectPath(locale: Locale, decodedSlug: string): string
export function replacePathLocale(path: string, locale: Locale): string | null
```

`src/lib/i18n/routing.ts` becomes the only owner of `Locale`.
`src/lib/strapi/types.ts` imports that exact type for its interfaces and
re-exports it for temporary compatibility with existing consumers:

```ts
import type { Locale } from "@/lib/i18n/routing"
export type { Locale } from "@/lib/i18n/routing"
```

Do not change the existing one-argument `articleUrl` in this task. Its localized
signature and every caller change together atomically in Task 6, so this commit
remains type-safe and the current unprefixed application remains functional.

- [ ] **Step 4: Run focused tests and static checks**

Run:

```bash
pnpm vitest run src/lib/i18n/routing.test.ts
pnpm typecheck
```

Expected: focused tests and typecheck PASS with no application behavior change.

- [ ] **Step 5: Commit the routing contract**

```bash
git add src/lib/i18n/routing.ts src/lib/i18n/routing.test.ts src/lib/strapi/types.ts
git commit -m "feat: add localized route helpers"
```

### Task 2: Add localized metadata and sitemap identity contracts

**Files:**
- Create: `src/lib/i18n/metadata.ts`
- Create: `src/lib/i18n/metadata.test.ts`
- Modify: `src/lib/site.ts`
- Modify: `src/lib/site.test.ts`
- Modify: `src/lib/strapi/types.ts`
- Modify: `src/lib/strapi/client.ts`
- Modify: `src/lib/strapi/client.test.ts`
- Modify: `src/lib/strapi/mock.ts`
- Modify: `src/lib/strapi/mock.test.ts`
- Modify: `src/lib/strapi/index.ts`
- Modify: `src/lib/sitemap.ts`
- Modify: `src/lib/sitemap.test.ts`

- [ ] **Step 1: Write failing metadata helper tests**

Define tests for:

```ts
buildPageAlternates({
  canonicalPath: "/id/jurnal/artikel-id",
  languages: {
    en: "/en/jurnal/article-en",
    id: "/id/jurnal/artikel-id",
  },
})
```

Assert absolute canonical and language URLs use `SITE_URL`. Test a missing
translation omits that language instead of inventing a slug. Test Open Graph
locale mapping (`en_US`, `id_ID`) and calculate available alternate locales
through the explicit helper described in Step 4.

- [ ] **Step 2: Write failing slug enumeration and sitemap tests**

Add this data contract to `src/lib/strapi/types.ts`:

```ts
export interface LocalizedSlugRecord {
  documentId: string
  locale: Locale
  slug: string
  localizations: Array<{ locale: Locale; slug: string }>
}
```

Tests must prove:

- article/project enumeration retains `documentId`, locale, slug, and
  localizations;
- mock and Strapi adapters return the same shape;
- the English and Indonesian mock article pair share one `documentId` and have
  reciprocal localization records with different real slugs;
- the English and Indonesian mock project pair follows the same identity rule;
- sitemap emits `/en`, `/id`, both localized listings, and localized details;
- translated records have `alternates.languages` grouped from localization
  data;
- no unprefixed public URL appears;
- a CMS enumeration failure keeps the existing graceful sitemap degradation.

- [ ] **Step 3: Confirm the tests fail for the intended reasons**

```bash
pnpm vitest run src/lib/i18n/metadata.test.ts src/lib/strapi/client.test.ts src/lib/strapi/mock.test.ts src/lib/sitemap.test.ts
```

Expected: FAIL because metadata helpers, the richer enumeration contract, and
localized sitemap output are absent.

- [ ] **Step 4: Implement metadata and enumeration minimally**

Create focused metadata functions rather than page-specific conditionals:

```ts
export function openGraphLocale(locale: Locale): "en_US" | "id_ID"
export function openGraphLocaleSet(
  locale: Locale,
  availableLocales: Locale[],
): {
  locale: "en_US" | "id_ID"
  alternateLocale?: Array<"en_US" | "id_ID">
}
export function buildPageAlternates(input: {
  canonicalPath: string
  languages: Partial<Record<Locale, string>>
}): Metadata["alternates"]
```

Add `absoluteUrl(path: string)` to `src/lib/site.ts` and test trailing-origin
normalization. Leave the existing one-argument `articleUrl` unchanged until
Task 6; metadata helpers use only `absoluteUrl` in this task.

Update Strapi enumeration queries to request `documentId`, `slug`, and
`localizations`. Normalize optional API localization arrays to `[]`. Update the
mock enumerators and `fetchAllSlugs`/`fetchAllProjectSlugs` facade types.

Update the actual mock fixtures—not only the mapper—so each translated pair has
one shared `documentId` and reciprocal `localizations` containing the other
locale and slug. Keep one deliberately untranslated fixture for missing-
translation behavior. Tests must fail if grouping falls back to title, entry
number, numeric ID, or slug conventions.

Refactor `buildSitemapEntries` to consume `LocalizedSlugRecord[]`, emit only
localized routes, and group available language alternates without guessing
from slug text.

- [ ] **Step 5: Run focused and full unit tests**

```bash
pnpm vitest run src/lib/i18n/metadata.test.ts src/lib/strapi/client.test.ts src/lib/strapi/mock.test.ts src/lib/sitemap.test.ts
pnpm test
pnpm typecheck
pnpm lint
```

Expected: all commands PASS.

- [ ] **Step 6: Commit the SEO data contracts**

```bash
git add src/lib/i18n/metadata.ts src/lib/i18n/metadata.test.ts src/lib/site.ts src/lib/site.test.ts src/lib/strapi/types.ts src/lib/strapi/client.ts src/lib/strapi/client.test.ts src/lib/strapi/mock.ts src/lib/strapi/mock.test.ts src/lib/strapi/index.ts src/lib/sitemap.ts src/lib/sitemap.test.ts
git commit -m "feat: add localized metadata contracts"
```

## Chunk 2: Localized Public Route Tree

Tasks 3 through 6 are one atomic route-tree transaction. The working tree may
be temporarily unrunnable while the root layout and pages are being moved, but
no broken intermediate state is committed. The transaction ends with the full
green commit in Task 6.

### Task 3: Prepare and implement route-derived language state

**Files:**
- Modify: `src/contexts/lang-context.tsx`
- Create: `src/contexts/lang-context.test.tsx`
- Modify: `src/components/lang-toggle.tsx`
- Create: `src/components/lang-toggle.test.tsx`
- Modify: `src/components/layout/site-header.tsx`

- [ ] **Step 1: Install the exact DOM test dependencies**

Run:

```bash
pnpm add -D @testing-library/react @testing-library/dom jsdom
```

Update `vitest.config.ts` from `src/**/*.test.ts` to
`src/**/*.test.{ts,tsx}`. Keep the default environment as Node and add
`// @vitest-environment jsdom` only to the two component test files.

- [ ] **Step 2: Write failing provider and toggle tests**

Assert:

- `LangProvider initialLang="id"` exposes `id` on first render;
- stored `en` and Indonesian browser language cannot override `initialLang`;
- navigation persists `initialLang` after mount;
- no `setLang` exists in context;
- active toggle item is non-navigating and marked current;
- available alternate is a link to the exact supplied URL;
- missing alternate is disabled with accessible text “Translation
  unavailable”.

Prefer testing rendered roles and hrefs over implementation details.

- [ ] **Step 3: Run tests and verify red state**

```bash
pnpm vitest run src/contexts/lang-context.test.tsx src/components/lang-toggle.test.tsx
```

Expected: FAIL because the provider has no `initialLang` and the toggle still
mutates local state.

- [ ] **Step 4: Implement read-only provider and link toggle**

Target interfaces:

```ts
type LangContextValue = { lang: Locale }

export function LangProvider(props: {
  initialLang: Locale
  children: ReactNode
}): React.ReactNode

export function LangToggle(props: {
  alternateHref?: string | null
}): React.ReactNode
```

For general pages, `LangToggle` may derive the alternate from `usePathname()`
using `replacePathLocale`. Detail pages pass the translated slug destination
through `SiteHeader`. Persist the validated route locale in an effect; remove
browser-language detection, the custom change event, and `setLang`.

- [ ] **Step 5: Run the focused component tests**

```bash
pnpm vitest run src/contexts/lang-context.test.tsx src/components/lang-toggle.test.tsx
```

Expected: component tests PASS. Do not run or commit the full application yet:
the existing unprefixed root layout cannot satisfy the new required
`initialLang` contract until Task 4, and the public pages move in Task 5.

- [ ] **Step 6: Continue directly to the root-layout move**

Keep these changes uncommitted and proceed immediately to Task 4. They are
included in Task 5's atomic localized-route commit.

### Task 4: Move the root layout and establish localized shells

**Files:**
- Move: `src/app/layout.tsx` -> `src/app/[locale]/layout.tsx`
- Move: `src/app/error.tsx` -> `src/app/[locale]/error.tsx`
- Move: `src/app/loading.tsx` -> `src/app/[locale]/loading.tsx`
- Move: `src/app/not-found.tsx` -> `src/app/[locale]/not-found.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/[locale]/error.tsx`
- Modify: `src/app/[locale]/not-found.tsx`
- Test: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Add failing localized shell E2E assertions**

Give every browser test introduced in Tasks 4–6 the shared title prefix
`localized route tree`. Add tests for `/en` and `/id` using Playwright's
request API and assert the raw
response body contains `<html lang="en"` or `<html lang="id"` before any client
JavaScript runs. A hydrated DOM assertion alone is insufficient. Add invalid
`/fr` and `/fr/jurnal` `404` assertions. Do not delete old smoke coverage yet.

- [ ] **Step 2: Move the files without duplicating root layouts**

Use filesystem moves so history remains readable. Keep `src/app/globals.css`
at its current path and update the relative import from the moved layout.
`src/app/[locale]/layout.tsx` must be the only public document layout emitting
`<html>` and `<body>`.

- [ ] **Step 3: Validate locale before rendering providers**

The layout contract is:

```ts
interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }]
}

export default async function LocaleLayout(props: LocaleLayoutProps) {
  const { locale: candidate } = await props.params
  if (!isLocale(candidate)) notFound()
  return (
    <html
      lang={candidate}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LangProvider initialLang={candidate}>{props.children}</LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Do not export `dynamicParams = false`; runtime validation is the single invalid-
locale policy and avoids coupling locale enumeration to child dynamic slugs.
The layout owns shared title templates, robots, fonts, theme bootstrap, and
locale-aware Open Graph defaults. Self canonicals remain page-owned because the
layout cannot know the complete child pathname.

- [ ] **Step 4: Run focused tests and typecheck, then continue without commit**

```bash
pnpm typecheck
pnpm vitest run src/contexts/lang-context.test.tsx src/components/lang-toggle.test.tsx
```

Expected: both commands PASS. Do not run `pnpm build` yet because the old public
pages are temporarily outside any page root layout. Continue directly to Task
5; no intermediate commit is allowed.

### Task 5: Move and simplify home, journal, and portfolio listings

**Files:**
- Move: `src/app/page.tsx` -> `src/app/[locale]/page.tsx`
- Move/refactor: `src/app/jurnal/page.tsx` ->
  `src/app/[locale]/jurnal/page.tsx`
- Create: `src/components/journal-list.tsx`
- Move: `src/app/portfolio/page.tsx` -> `src/app/[locale]/portfolio/page.tsx`
- Modify: `src/components/journal-section.tsx`
- Modify: `src/components/article/article-card.tsx`
- Modify: `src/components/portfolio/featured-project.tsx`
- Modify: `src/components/portfolio/project-row.tsx`
- Modify: `src/components/home/work-section.tsx`
- Modify: `src/components/layout/site-header.tsx`
- Test: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write failing localized listing E2E cases**

Assert `/en/jurnal`, `/id/jurnal`, `/en/portfolio`, and `/id/portfolio` render
the correct localized heading and that their first internal detail link starts
with the same locale prefix.

- [ ] **Step 2: Refactor home to fetch one locale**

Read and validate `params.locale`, then fetch only:

```ts
Promise.all([
  fetchLandingPage(locale),
  fetchSocialLinks(),
  fetchProjects(locale),
  fetchArticles(locale, { limit: 3 }),
])
```

Delete `LocaleGate` branches, locale-indexed empty-state/view-all maps, and the
second locale fetch. Pass `locale`, one empty state, and one label into
`JournalSection`. Make `JournalSection` presentational for the server-fetched
summaries; the retryable API client remains only in `JournalList` for the full
journal page. This satisfies the approved home-data contract and prevents a
second client fetch after hydration.

- [ ] **Step 3: Split the journal client leaf from its server page**

The localized server page validates `params.locale` and renders:

```tsx
<JournalList locale={locale} />
```

Move current loading/retry UI to `src/components/journal-list.tsx`. Its locale
is a prop and fixed for that mounted route; remove result language mismatch
logic. Fetch `/api/articles?locale=${locale}` and build cards with localized
article URLs.

- [ ] **Step 4: Refactor portfolio listing to one locale**

Fetch `fetchProjects(locale)` once, select `copy[locale]`, render one
`ProjectList`, and pass locale into project link components. Replace static
metadata with locale-aware metadata and alternates.

- [ ] **Step 5: Add page-owned metadata for all general pages**

Implement `generateMetadata` in localized home, journal, and portfolio pages.
Each must have a self canonical and both valid general-page language
alternates. Use `buildPageAlternates`; do not ask the layout to infer child
paths. Assert these tags in the localized listing E2E cases.

- [ ] **Step 6: Localize header and home navigation**

Update `SiteHeader` home/journal/portfolio links and
`src/components/home/work-section.tsx` to use the centralized route helpers
with the route-derived locale. Verify active-nav matching includes the locale
prefix.

- [ ] **Step 7: Localize listing-card navigation**

Update article cards, featured project, project rows, and list view-all links to
use centralized path helpers. Search for remaining unprefixed internal links:

```bash
rg -n 'href=[{]?['\''"]/(jurnal|portfolio)?' src --glob '*.tsx'
```

Review every match; external links and legacy redirect handlers are the only
intentional exceptions.

- [ ] **Step 8: Verify only detail pages still use dual rendering**

Run `rg -n "LocaleGate" src`. Expected: matches only in article/project detail
files plus the component definition. Do not delete it yet; Task 6 removes the
last consumers and the file.

- [ ] **Step 9: Run unit and static checks, then continue without commit**

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Expected: all commands PASS. Do not build or run Playwright until Task 6 moves
the remaining detail pages under the locale root layout.

- [ ] **Step 10: Continue directly to localized detail routes**

Keep the route-tree transaction uncommitted and proceed to Task 6.

### Task 6: Convert article and project details to single-locale pages

**Files:**
- Move/refactor: `src/app/jurnal/[slug]/page.tsx` ->
  `src/app/[locale]/jurnal/[slug]/page.tsx`
- Move/refactor: `src/app/jurnal/[slug]/article-view.tsx` ->
  `src/app/[locale]/jurnal/[slug]/article-view.tsx`
- Move/refactor: `src/app/portfolio/[slug]/page.tsx` ->
  `src/app/[locale]/portfolio/[slug]/page.tsx`
- Move/refactor: `src/app/portfolio/[slug]/project-view.tsx` ->
  `src/app/[locale]/portfolio/[slug]/project-view.tsx`
- Modify: `src/components/article/related-articles.tsx`
- Modify: `src/components/article/giscus-comments.tsx`
- Modify: `src/components/layout/site-header.tsx`
- Modify: `src/lib/site.ts`
- Modify: `src/lib/site.test.ts`
- Modify: `src/lib/strapi/mock.ts`
- Modify: `src/lib/strapi/mock.test.ts`
- Delete: `src/components/locale-gate.tsx`
- Test: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write failing detail-route E2E coverage**

Cover one English and one Indonesian article, one project in each available
locale, correct `<html lang>`, localized back/related links, and localized share
URL. Keep the shared `localized route tree` title prefix so the final focused
Playwright command selects shells, listings, metadata, and details without
selecting stale legacy tests.

In `src/lib/strapi/mock.ts`, ensure at least one article pair and one project
pair have reciprocal `localizations` with real different slugs and the shared
identity established in Task 2. Keep one entry genuinely untranslated. Add mock
unit assertions before using those fixtures in E2E. Assert toggle navigation
from each translated slug reaches the other real slug, and assert the missing
translation control is disabled.

- [ ] **Step 2: Refactor article page to fetch one locale**

Use `params: Promise<{ locale: string; slug: string }>` and validate locale.
Fetch exactly one article by `(slug, locale)`. If absent, call `notFound()`.
Calculate reading time/headings only for that body and fetch related articles
only for that locale.

Read `article.localizations` to build the alternate detail path. Pass one
article, one metadata object, one related list, locale, and
`alternateHref | null` into `ArticleView`. Remove `articleEn`, `articleId`,
`resolvedEn`, `resolvedId`, and all `LocaleGate` branches.

- [ ] **Step 3: Refactor article metadata**

Fetch only `(slug, locale)`. Set self canonical, available language alternate,
Open Graph locale, alternate locale when present, and localized OG URL. Preserve
cover, author, tag, and published-time metadata. Unknown localized slug returns
not-found metadata behavior without attempting the other locale.

- [ ] **Step 4: Refactor project rendering to one locale**

Fetch one project, render one body with a locale-specific heading prefix, and
build alternate path only from real `localizations`. Delete
`MissingLocaleNotice`; unavailable translation is represented in the header
toggle, not as hidden page content.

- [ ] **Step 5: Add localized project metadata**

Make project metadata fetch only `(slug, locale)`. Add self canonical, only real
language alternates, localized Open Graph locale/URL, cover, title, and
description. A missing project in the requested locale returns not-found
behavior without probing the other locale.

- [ ] **Step 6: Preserve Giscus identity and localize sharing**

Change `src/lib/site.ts` and all current callers atomically to:

```ts
export function absoluteUrl(path: string): string
export function articleUrl(locale: Locale, slug: string): string
export function projectUrl(locale: Locale, slug: string): string
```

Update `src/lib/site.test.ts` for localized absolute URLs. Keep:

```tsx
mapping="specific"
term={slug}
```

Do not switch Giscus to pathname. Assert the resulting share target contains
`/en/` or `/id/`.

- [ ] **Step 7: Remove the final dual-rendering component**

After both detail views render one locale, delete
`src/components/locale-gate.tsx`. Run:

```bash
rg -n "LocaleGate|articleEn|articleId|resolvedEn|resolvedId|MissingLocaleNotice" src
```

Expected: no output.

- [ ] **Step 8: Replace stale detail smoke cases before focused E2E**

Update the existing article TOC and Indonesian share tests to localized URLs.
Do not leave any unprefixed detail test whose title would match the focused
grep.

- [ ] **Step 9: Run the complete atomic route-tree verification**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e --grep "localized route tree"
```

Expected: PASS. The build contains all localized general/detail pages; each
page fetches one locale; raw HTML language assertions pass; `LocaleGate` is
absent. Legacy unprefixed handlers remain the only intentionally unfinished
surface.

- [ ] **Step 10: Commit the complete localized route tree**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts src/app src/components src/contexts src/lib tests/e2e/smoke.spec.ts
git commit -m "feat: move public pages to localized URLs"
```

## Chunk 3: Legacy Compatibility, SEO, and Release Verification

### Task 7: Add deterministic legacy redirects

**Files:**
- Create: `src/lib/i18n/legacy-redirect.ts`
- Create: `src/lib/i18n/legacy-redirect.test.ts`
- Create: `src/app/route.ts`
- Create: `src/app/jurnal/route.ts`
- Create: `src/app/jurnal/[slug]/route.ts`
- Create: `src/app/portfolio/route.ts`
- Create: `src/app/portfolio/[slug]/route.ts`
- Test: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write failing pure resolver tests**

Inject locale-specific fetch functions so tests require no network. Cover:

```text
English only      -> { locale: "en", slug }
Indonesian only   -> { locale: "id", slug }
Both locales      -> English wins
Neither locale    -> null
Fetcher rejects   -> rejection propagates
```

Run `Promise.allSettled` only if it does not accidentally convert an outage in
one locale into a false result from the other. The contract must fail loudly
when the CMS lookup fails.

- [ ] **Step 2: Implement the pure resolver and make tests pass**

Expose separate article/project wrappers only if they reduce duplication;
otherwise keep a generic injected resolver in `legacy-redirect.ts` and call it
with the existing Strapi fetchers from route handlers.

- [ ] **Step 3: Write failing request-level redirect tests**

Assert exact status and location:

```text
/                              -> 308 /en
/jurnal?utm_source=old         -> 308 /en/jurnal?utm_source=old
/portfolio                     -> 308 /en/portfolio
/jurnal/my-first-llm-call      -> 308 /en/jurnal/my-first-llm-call
/jurnal/pertama-kali-manggil-llm -> 308 /id/jurnal/pertama-kali-manggil-llm
/portfolio/<english-project>   -> 308 /en/portfolio/<english-project>
/portfolio/<indonesian-project> -> 308 /id/portfolio/<indonesian-project>
unknown legacy detail          -> 404
```

Use Playwright's request API with redirects disabled so the original `308` is
observable. Append a query string to at least one article detail and one project
detail redirect and assert it is preserved. Also test encoded slug input and
verify the location is encoded once. Every one of the five legacy handlers must
have direct request-level coverage.

- [ ] **Step 4: Implement thin route handlers**

Static handlers clone `request.nextUrl`, replace only `pathname`, retain
`search`, and return `NextResponse.redirect(target, 308)`. Detail handlers await
the resolver, return `404` when it returns `null`, and allow Strapi errors to
propagate. Do not introduce browser-language inspection.

- [ ] **Step 5: Run resolver and redirect tests**

```bash
pnpm vitest run src/lib/i18n/legacy-redirect.test.ts
pnpm build
pnpm test:e2e --grep "legacy|redirect"
```

Expected: PASS with observable `308` responses and preserved query strings.

- [ ] **Step 6: Commit legacy compatibility**

```bash
git add src/lib/i18n/legacy-redirect.ts src/lib/i18n/legacy-redirect.test.ts src/app/route.ts src/app/jurnal src/app/portfolio tests/e2e/smoke.spec.ts
git commit -m "feat: redirect legacy URLs to localized routes"
```

### Task 8: Finish canonical metadata and localized sitemap integration

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/jurnal/page.tsx`
- Modify: `src/app/[locale]/jurnal/[slug]/page.tsx`
- Modify: `src/app/[locale]/portfolio/page.tsx`
- Modify: `src/app/[locale]/portfolio/[slug]/page.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/lib/sitemap.ts`
- Modify: `src/lib/sitemap.test.ts`
- Test: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Add metadata browser assertions before implementation**

For general pages, assert self canonical plus both `hreflang="en"` and
`hreflang="id"`. For translated details, assert different real slugs in
alternates. For untranslated details, assert the missing alternate is absent.
Assert no canonical or alternate points to an unprefixed public URL.
Assert `og:locale` is `en_US` or `id_ID` as appropriate and
`og:locale:alternate` exists only for an available translation.

- [ ] **Step 2: Wire helpers into every localized page**

Use one metadata helper contract consistently. Avoid spreading literal
`SITE_URL`, locale prefixes, and Open Graph locale strings across page files.
Keep page-specific title, description, cover, article timestamps, author, and
tags in their page metadata functions.

- [ ] **Step 3: Wire richer slug records into sitemap**

Ensure the generated sitemap includes localized general routes and detail
records with language alternate associations. Add a unit assertion that two
records with different translated slugs are grouped through
`documentId`/`localizations`, and cannot be grouped by slug similarity. Retain
graceful degradation when article or project enumeration fails independently.

- [ ] **Step 4: Inspect production output directly**

```bash
pnpm build
pnpm start
```

In another shell, inspect representative headers and markup:

```bash
curl -I http://127.0.0.1:3000/
curl -s http://127.0.0.1:3000/id/jurnal/pertama-kali-manggil-llm
curl -s http://127.0.0.1:3000/sitemap.xml
```

Expected: root `308`; detail markup has Indonesian canonical/lang; sitemap has
only `/en` and `/id` public URLs. Stop the manually started server afterward.

- [ ] **Step 5: Commit SEO integration**

```bash
git add src/app src/lib tests/e2e/smoke.spec.ts
git commit -m "feat: publish localized metadata and sitemap"
```

### Task 9: Complete regression coverage and documentation

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `DOCS.md`
- Modify: `.github/workflows/ci.yml` only if verification commands changed

- [ ] **Step 1: Update the full E2E route matrix**

Remove assertions expecting unprefixed `200` pages. Final coverage must include:

- localized home, journal, article, portfolio, and project rendering;
- correct initial `<html lang>`;
- language navigation with translated slug;
- unavailable detail translation state;
- canonical and alternate links;
- stable localized share URL;
- legacy `308` status and query preservation;
- invalid locale and missing localized slug `404`;
- security headers on localized responses;
- journal `503` retry behavior under both locale routing and API query;
- no console or hydration errors.

- [ ] **Step 2: Update repository documentation**

Document:

- new public route examples;
- URL locale as source of truth;
- deterministic legacy redirect policy;
- read-only `LangProvider` and navigation toggle;
- single-locale page fetching;
- unchanged `/api/articles?locale=en|id` contract;
- Giscus's preserved slug term;
- full verification commands.

Do not claim browser-language auto-redirects or middleware behavior.

- [ ] **Step 3: Run the complete release gate**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
git diff --check
```

Expected:

- ESLint exits `0` with no warnings.
- TypeScript exits `0`.
- All Vitest tests pass.
- Next production build succeeds with localized and legacy handler routes.
- All Playwright tests pass against `.next/standalone/server.js`.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 4: Audit for stale architecture**

Run:

```bash
rg -n "LocaleGate|setLang|navigator\.language|articleEn|articleId|projectEn|projectId|resolvedEn|resolvedId|MissingLocaleNotice" src CLAUDE.md DOCS.md README.md
rg -n 'href=[{]?['\''"]/(jurnal|portfolio)(/|['\''"])' src --glob '*.tsx'
rg -n '`/(jurnal|portfolio)(/|`)' src --glob '*.ts' --glob '*.tsx'
```

Expected: no stale dual-locale implementation or unprefixed internal links.
The final route-literal search may match only the five intentional legacy route
handlers, their tests, and migration documentation; inspect and document that
allowlist explicitly.

- [ ] **Step 5: Preserve unrelated workspace state**

Run `git status --short`. Do not stage the user's untracked `AGENTS.md` or any
unrelated changes. Stage only migration files.

- [ ] **Step 6: Commit the verified migration**

```bash
git add README.md CLAUDE.md DOCS.md tests/e2e/smoke.spec.ts .github/workflows/ci.yml
git commit -m "test: verify localized URL migration"
```

If `.github/workflows/ci.yml` did not change, omit it. If earlier tasks already
committed the E2E file, commit only actual remaining changes; never create an
empty commit.

## Final Definition of Done

- [ ] Every public `200` page begins with `/en` or `/id`.
- [ ] URL locale, fetched data, visible copy, `<html lang>`, canonical, and
  share URL agree.
- [ ] General language navigation preserves page type.
- [ ] Detail navigation uses the real translated slug or is disabled.
- [ ] All supported legacy URLs return deterministic `308` redirects.
- [ ] Query strings survive legacy redirects.
- [ ] Invalid locale and missing localized content return `404`.
- [ ] CMS failures are never rewritten as false `404` responses.
- [ ] Sitemap contains only localized public URLs with valid translation pairs.
- [ ] Giscus keeps stable `mapping="specific"` slug terms.
- [ ] `LocaleGate`, dual-locale page fetches, and imperative `setLang` are gone.
- [ ] Lint, typecheck, unit tests, build, and E2E all pass.
- [ ] Untracked `AGENTS.md` remains untouched.
