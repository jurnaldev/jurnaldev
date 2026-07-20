# Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the audited runtime and production-readiness defects while preserving every existing public route.

**Architecture:** Keep the App Router/server-rendered design, move interaction to explicit client leaves, enforce a timed Strapi boundary with opt-in fallback, and share pure parsing utilities between HTTP, Markdown rendering, and tests. Add standard verification without implementing the deferred locale-path migration.

**Tech Stack:** Next.js 16, React 19, TypeScript 6 strict, Strapi v5 REST, Vitest, Playwright, ESLint 10 flat config, GitHub Actions, pnpm 10 on Node 20.

**Spec:** `docs/superpowers/specs/2026-07-20-production-hardening-design.md`

---

## File map

| Area | Files | Responsibility |
|---|---|---|
| Toolchain | `package.json`, `pnpm-lock.yaml`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts` | Repeatable lint, type, unit, build, and browser checks |
| API | `src/lib/api/articles-query.ts`, `src/app/api/articles/route.ts` | Validated 200/400/503 contract |
| CMS | `src/lib/strapi/{types,client,index,mock,policy}.ts` | Summary types, timeout, and explicit fallback |
| Markdown | `src/lib/markdown-{blocks,headings}.ts`, `article-body.tsx`, `toc.tsx` | Lossless custom blocks and deterministic IDs |
| Runtime | layout, contexts, article cards/embeds, journal clients | Theme, language, RSC safety, fetch states |
| Operations | error/loading/not-found, sitemap/robots, `next.config.mjs` | Recovery, discovery, and headers |
| Verification | `src/**/*.test.ts`, `tests/e2e/smoke.spec.ts`, `.github/workflows/ci.yml` | Automated acceptance |
| Docs | `.env.example`, README, DOCS, CLAUDE, STRAPI_SETUP | Current setup and policy |

---

## Chunk 1: Toolchain and pure contracts

### Task 1: Establish the verification toolchain

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Create: `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`
- Delete: `.eslintrc.json`

- [ ] **Step 1: Install dependencies**

Run: `pnpm install --frozen-lockfile`

Then run:

`pnpm add -D vitest @playwright/test`

`pnpm add github-slugger unified remark-parse mdast-util-to-string unist-util-visit`

Expected: install succeeds; only manifest, lockfile, and ignored `node_modules` change.

- [ ] **Step 2: Replace obsolete scripts**

Set `lint=eslint .`, `typecheck=tsc --noEmit`, `test=vitest run`, `test:watch=vitest`, `test:e2e=playwright test`, `verify=pnpm lint && pnpm typecheck && pnpm test && pnpm build`, and `verify:e2e=pnpm verify && pnpm test:e2e`.

- [ ] **Step 3: Configure ESLint 10 flat config**

Compose `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. Ignore `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `test-results/**`, and `playwright-report/**`. Delete legacy `.eslintrc.json`.

- [ ] **Step 4: Configure Vitest and Playwright**

Vitest: Node environment, `@` alias to `src`, include `src/**/*.test.ts`.

Playwright: Chromium, `tests/e2e`, base URL `http://127.0.0.1:3000`, trace on first retry, web server `pnpm start`; E2E assumes `pnpm build` already ran.

- [ ] **Step 5: Execute baseline tools**

Run: `pnpm lint && pnpm typecheck`

Expected: tools execute. Fix source failures instead of globally suppressing them.

### Task 2: Add article query validation test-first

**Files:**
- Create: `src/lib/api/articles-query.test.ts`
- Create: `src/lib/api/articles-query.ts`
- Create: `src/lib/site.ts`

- [ ] **Step 1: Write failing tests**

Cover default EN, valid ID, featured true, limits 1/50, invalid locale, and zero/negative/fractional/non-numeric/>50 limits. Assert `INVALID_LOCALE` or `INVALID_LIMIT`.

- [ ] **Step 2: Verify failure**

Run: `pnpm vitest run src/lib/api/articles-query.test.ts`

Expected: FAIL because implementation is absent.

- [ ] **Step 3: Implement contracts**

Export `ArticlesQuery`, `ArticlesQueryError`, and `parseArticlesQuery(URLSearchParams)`. Return `{locale, limit, featured}`; throw stable codes. Add `SITE_URL` from `NEXT_PUBLIC_SITE_URL` with trailing slash removed and `https://jurnal.dev` default.

- [ ] **Step 4: Verify pass**

Run: `pnpm vitest run src/lib/api/articles-query.test.ts`

Expected: PASS.

### Task 3: Add fallback policy test-first

**Files:**
- Create: `src/lib/strapi/policy.test.ts`
- Create: `src/lib/strapi/policy.ts`

- [ ] **Step 1: Write failing tests**

Assert mode `mock` without URL, `strapi` with URL, and `strapi-with-fallback` only when URL exists and `STRAPI_MOCK_FALLBACK` is exactly `true`.

- [ ] **Step 2: Implement pure policy**

`getStrapiMode(env)` accepts a small object, not global state.

- [ ] **Step 3: Verify and commit**

Run: `pnpm test && pnpm lint && pnpm typecheck`

Commit: `chore: establish production verification toolchain`

### Chunk 1 exact implementation contract

Use these complete configuration shapes; do not improvise equivalents.

`eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**", "out/**", "build/**", "next-env.d.ts",
    "test-results/**", "playwright-report/**",
  ]),
])
```

`vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "node", include: ["src/**/*.test.ts"], restoreMocks: true },
})
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
      NEXT_PUBLIC_STRAPI_URL: "",
      STRAPI_API_TOKEN: "",
    },
  },
})
```

`articles-query.ts` must implement exactly this public behavior:

```ts
export type ArticlesQueryErrorCode = "INVALID_LOCALE" | "INVALID_LIMIT"
export interface ArticlesQuery { locale: "en" | "id"; limit?: number; featured: boolean }
export class ArticlesQueryError extends Error {
  constructor(public code: ArticlesQueryErrorCode, message: string) {
    super(message)
    this.name = "ArticlesQueryError"
  }
}
export function parseArticlesQuery(params: URLSearchParams): ArticlesQuery {
  const rawLocale = params.get("locale") ?? "en"
  if (rawLocale !== "en" && rawLocale !== "id")
    throw new ArticlesQueryError("INVALID_LOCALE", "locale must be en or id")
  const rawLimit = params.get("limit")
  let limit: number | undefined
  if (rawLimit !== null) {
    limit = Number(rawLimit)
    if (!Number.isInteger(limit) || limit < 1 || limit > 50)
      throw new ArticlesQueryError("INVALID_LIMIT", "limit must be an integer from 1 to 50")
  }
  return { locale: rawLocale, limit, featured: params.get("featured") === "true" }
}
```

`policy.ts`:

```ts
export type StrapiMode = "mock" | "strapi" | "strapi-with-fallback"
export function getStrapiMode(env: {
  NEXT_PUBLIC_STRAPI_URL?: string
  STRAPI_MOCK_FALLBACK?: string
}): StrapiMode {
  if (!env.NEXT_PUBLIC_STRAPI_URL) return "mock"
  return env.STRAPI_MOCK_FALLBACK === "true" ? "strapi-with-fallback" : "strapi"
}
```

The policy test sequence is atomic: write test; run and expect module-not-found;
implement; run and expect all cases pass. Commit toolchain before Task 2, then
commit query/site/policy contracts as `test: define public content contracts`.

---

## Chunk 2: Runtime boundaries and content reliability

### Task 4: Repair server/client boundaries

**Files:**
- Modify: `src/components/article/article-card.tsx`
- Modify: `src/components/article/instagram-embed.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Move hover behavior to CSS**

Use existing `.article-card-row:hover` and add `.instagram-cta:hover`. Remove event handlers from both server-capable components.

- [ ] **Step 2: Run boundary regression search**

Search all TSX files containing `onX=` without a top-level `use client`.

Expected: no output.

### Task 5: Repair theme bootstrap and document language

**Files:**
- Modify: `src/app/layout.tsx`, `src/lib/theme-script.ts`
- Modify: `src/contexts/theme-context.tsx`, `src/contexts/lang-context.tsx`
- Create: `src/lib/theme-script.test.ts`

- [ ] **Step 1: Write failing bootstrap tests**

Execute the script with stubbed localStorage, matchMedia, and classList. Cover missing, dark, light, system, corrupt value, and localStorage exception.

- [ ] **Step 2: Fix bootstrap**

Validate stored values, render a real inline `script` rather than `template`, and keep no-transition behavior. Provider state must converge on the same resolved theme.

- [ ] **Step 3: Synchronize language**

On `lang` changes set `document.documentElement.lang`. Do not alter routes.

- [ ] **Step 4: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm test`

### Task 6: Narrow summaries and harden Strapi

**Files:**
- Modify: `src/lib/strapi/types.ts`, `client.ts`, `index.ts`, `mock.ts`
- Modify: `src/components/article/article-card.tsx`, `related-articles.tsx`
- Create: `src/lib/strapi/client.test.ts`

- [ ] **Step 1: Add explicit summary type**

Define the approved `Pick` fields. List/related fetchers and card props use summaries; detail fetchers keep full articles.

- [ ] **Step 2: Strip mock bodies**

Add a typed summary mapper. Mock list and related results must not contain `body` or `localizations`.

- [ ] **Step 3: Narrow Strapi list fields**

Request only card scalar fields plus cover/tags/author. Remove reading-time calculation and label from cards.

- [ ] **Step 4: Test and add timeout**

Mock `global.fetch` rejection and assert timeout/abort propagation. Apply `AbortSignal.timeout(8000)` to every Strapi request.

- [ ] **Step 5: Apply source policy**

Only fallback after configured-CMS failure in `strapi-with-fallback`. In `strapi` mode rethrow. Preserve zero-config mock mode.

- [ ] **Step 6: Add project slug enumeration**

Implement client/facade functions for sitemap with identical policy.

### Task 7: Enforce API and client error states

**Files:**
- Modify: `src/app/api/articles/route.ts`
- Modify: `src/app/jurnal/page.tsx`
- Modify: `src/components/journal-section.tsx`
- Create: `src/lib/api/articles-handler.ts`, `src/lib/api/articles-handler.test.ts`
- Create: `src/lib/client/load-articles.ts`, `src/lib/client/load-articles.test.ts`
- Create: `src/app/api/articles/route.test.ts`

- [ ] **Step 1: Write failing route tests**

Assert invalid queries return 400 with stable error codes. Mock a facade rejection and assert sanitized 503 with `CMS_UNAVAILABLE`; internal error text must not appear.

- [ ] **Step 2: Implement route contract**

Parse with the pure query parser, log internal CMS errors server-side, preserve `{articles}` success shape, and never return 200 for failures.

- [ ] **Step 3: Implement abortable client states**

Track loading/success/error, abort stale locale requests, check `response.ok`, reset loading on locale changes, and render retry/error copy instead of permanent skeletons.

- [ ] **Step 4: Verify and commit**

Run: `pnpm lint && pnpm typecheck && pnpm test`

Commit: `fix: harden runtime boundaries and content fetching`

### Chunk 2 exact implementation contract

Theme resolution has these exact expectations:

- missing or corrupt stored value resolves the system preference;
- stored `system` resolves the system preference;
- stored `light` or `dark` wins over the system preference;
- a throwing `localStorage.getItem` still resolves the system preference.

The inline bootstrap and provider use equivalent validation and resolution.
Provider may not apply a hardcoded `dark` result during its first effect.
Initialize `resolvedTheme` with a lazy browser initializer that reads
`documentElement.classList.contains("dark")` when available (otherwise
`light`), then resolve the validated persisted theme in one mount effect. Tests
assert that a bootstrapped dark class never briefly becomes light, and a
bootstrapped light document never briefly becomes dark.

The boundary regression command is:

```bash
for file in $(rg --files src -g '*.tsx'); do
  if rg -q 'on[A-Z][A-Za-z]+=' "$file" && ! head -n 3 "$file" | rg -q 'use client'; then
    echo "$file"
  fi
done
```

Expected after Task 4: no output. Do not add `use client` merely to silence the
check; remove static hover handlers and use CSS.

The summary is the explicit `Pick` from the spec. Add
`toArticleSummary(article): StrapiArticleSummary` using destructuring:

```ts
const { body: _body, localizations: _localizations, ...summary } = article
return summary
```

Tests assert `"body" in summary === false` and
`"localizations" in summary === false`. The Strapi list URL test inspects the
URL passed to mocked fetch: it contains scalar `fields[n]` entries and no
`body` field. `ArticleCard` metadata becomes entry number, date, and tags only;
delete its reading-time import and element.

Timeout testing uses fake timers and a fetch implementation that resolves only
when its signal aborts:

```ts
vi.useFakeTimers()
vi.stubGlobal("fetch", vi.fn((_url, init) => new Promise((_resolve, reject) => {
  init?.signal?.addEventListener("abort", () => reject(init.signal?.reason))
})))
const pending = getArticles("en")
await vi.advanceTimersByTimeAsync(8_000)
await expect(pending).rejects.toBeDefined()
```

Every facade method uses one helper with this behavior:

```ts
async function fromSource<T>(mockRead: () => T, strapiRead: () => Promise<T>): Promise<T> {
  if (STRAPI_MODE === "mock") return mockRead()
  try { return await strapiRead() }
  catch (error) {
    if (STRAPI_MODE === "strapi-with-fallback") {
      console.warn("[strapi] request failed; explicit mock fallback enabled", error)
      return mockRead()
    }
    throw error
  }
}
```

Apply it to articles, article detail, related, article slugs, projects, project
detail, project slugs, landing, and social links. Tests cover propagation in
`strapi` mode and fallback in `strapi-with-fallback` mode for representative
list and detail calls; enumeration functions contain no internal catches. Name
project enumeration `getAllProjectSlugs` and `fetchAllProjectSlugs`, both
returning `Array<{ slug: string; locale: Locale }>`.

Extract client JSON handling to `src/lib/client/load-articles.ts`:

```ts
export class ArticlesLoadError extends Error {}
export async function loadArticles(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new ArticlesLoadError("Articles are temporarily unavailable")
  const data = await response.json()
  return (data.articles ?? []) as StrapiArticleSummary[]
}
```

Unit tests cover success, 503, and abort propagation. Both client surfaces use
state `{ status: "loading" | "success" | "error"; articles: Summary[] }`.
Effects create an AbortController, set loading, call `loadArticles`, ignore
`AbortError`, set error otherwise, and abort in cleanup. Error copy is
`Articles are temporarily unavailable. Try again.` / `Artikel sementara tidak
tersedia. Coba lagi.` with a retry button incrementing a counter included in
the effect dependencies. Playwright verifies error and retry via interception.

Move HTTP orchestration into `src/lib/api/articles-handler.ts` with dependency
injection so route tests remain pure:

```ts
export async function handleArticlesRequest(
  request: Request,
  fetcher: typeof fetchArticles = fetchArticles,
): Promise<Response> {
  try {
    const query = parseArticlesQuery(new URL(request.url).searchParams)
    return Response.json({ articles: await fetcher(query.locale, query) })
  } catch (error) {
    if (error instanceof ArticlesQueryError)
      return Response.json({ articles: [], error: { code: error.code, message: error.message } }, { status: 400 })
    console.error("[api/articles] CMS request failed", error)
    return Response.json({ articles: [], error: { code: "CMS_UNAVAILABLE", message: "Articles are temporarily unavailable" } }, { status: 503 })
  }
}
```

The route `GET` delegates to this function. Contract tests call the pure handler
with stub fetchers and assert exact status, payload, and sanitization. For each
new unit: write test, run focused test and expect failure, implement, run focused
test and expect pass. Finish with
`pnpm lint && pnpm typecheck && pnpm test` and expect exit code 0.

---

## Chunk 3: Markdown, TOC, and sharing

### Task 8: Extract lossless block parsing test-first

**Files:**
- Create: `src/lib/markdown-blocks.test.ts`, `src/lib/markdown-blocks.ts`
- Modify: `src/components/article/article-body.tsx`

- [ ] **Step 1: Write fixtures**

Cover normal Markdown, every callout, Instagram reel/post, URLs and markers inside code fences, and an unclosed callout. The unclosed output must preserve the opening line and buffered text exactly.

- [ ] **Step 2: Verify failure, implement, verify pass**

Run focused Vitest before and after implementation. Export `MarkdownBlock` and `parseMarkdownBlocks`. Replace the private parser.

### Task 9: Unify heading IDs test-first

**Files:**
- Create: `src/lib/markdown-headings.test.ts`, `src/lib/markdown-headings.ts`
- Modify: `src/lib/article-utils.ts`
- Modify: `src/components/article/article-body.tsx`, `toc.tsx`

- [ ] **Step 1: Write fixtures**

Cover H2/H3, code-fence exclusions, duplicates, Unicode, emphasis, links, and inline code. Assert locale prefixes and GitHub duplicate suffixes.

- [ ] **Step 2: Implement AST extraction**

Use unified+remark-parse, visit depth 2/3 headings, derive visible text with mdast-util-to-string, and slug through one GithubSlugger per body.

- [ ] **Step 3: Implement rendered-ID plugin**

Keep rehype-slug, then prefix H2/H3 IDs and reconcile duplicate counts across all Markdown blocks in one body.

- [ ] **Step 4: Align utility exports and TOC**

Remove regex slugging. Re-export shared extraction. TOC observes/links exact prefixed IDs.

### Task 10: Wire prefixes and correct share URLs

**Files:**
- Modify: `src/app/jurnal/[slug]/page.tsx`, `article-view.tsx`
- Modify: `src/app/portfolio/[slug]/project-view.tsx`

- [ ] **Step 1: Use `article-en`/`article-id` in extraction and rendering**

Use `project-en`/`project-id` for portfolio bodies to prevent duplicate DOM IDs.

- [ ] **Step 2: Use locale-specific server URLs**

EN share controls receive the EN article slug; ID controls receive the ID slug; both use `SITE_URL`. Delete the `typeof window` branch.

- [ ] **Step 3: Verify and commit**

Run: `pnpm lint && pnpm typecheck && pnpm test`

Commit: `fix: make markdown navigation deterministic`

### Chunk 3 exact implementation contract

`ArticleBody` public props become:

```ts
interface ArticleBodyProps { body: string; headingPrefix?: string }
export async function ArticleBody({ body, headingPrefix = "content" }: ArticleBodyProps)
```

`parseMarkdownBlocks` returns:

```ts
export type MarkdownBlock =
  | { type: "md"; content: string }
  | { type: "callout"; variant: "info" | "warning" | "tip" | "success"; content: string }
  | { type: "instagram"; url: string }
```

For input `:::warning\nkeep me` the exact result is
`[{ type: "md", content: ":::warning\nkeep me" }]`. The focused command is
`pnpm vitest run src/lib/markdown-blocks.test.ts`; before implementation expect
module-not-found, after implementation expect every fixture pass.

`markdown-headings.ts` owns one state abstraction used by both extraction and
render plugins:

```ts
export interface Heading { text: string; slug: string; level: number }
export function createHeadingSlugger(prefix: string) {
  const slugger = new GithubSlugger()
  return (text: string) => `${prefix}-${slugger.slug(text)}`
}
```

`extractHeadings(body, prefix)` parses one full mdast, converts visible heading
children with `toString(node)`, and calls one slugger in document order.
`createHeadingIdPlugin(prefix)` creates one slugger once and returns a rehype
attacher function; that attacher returns the tree transformer required by
ReactMarkdown's `rehypePlugins`. The transformer visits every H2/H3, derives
visible text with a small recursive HAST text helper, and replaces
`node.properties.id` with the slugger result. In
`ArticleBody`, create the plugin once before mapping blocks and pass that same
plugin reference to every `MarkdownContent`; never instantiate inside
`MarkdownContent`.

Cross-block integration test calls the same plugin instance on two minimal HAST
trees and compares emitted IDs to `extractHeadings` for equivalent Markdown.
Required exact expectations include:

- `## Setup`, `## Setup` -> `article-en-setup`, `article-en-setup-1`
- `## **Bold** [link](/x) and \`code\`` ->
  `article-en-bold-link-and-code`
- `## Café déjà vu` -> `article-id-café-déjà-vu`
- headings split by an Instagram block still increment the same duplicate
  counter.

Focused command: `pnpm vitest run src/lib/markdown-headings.test.ts`. Expect
module-not-found before implementation and all explicit IDs after.

Add `articleUrl(slug: string): string` to `site.ts` returning
`${SITE_URL}/jurnal/${slug}` and unit-test URL encoding policy with representative
EN and ID slugs. `ArticleView` calls it independently for each locale. The E2E
test switches to ID and asserts the copy-link action writes or targets the ID
slug. Finish the chunk with exact command
`pnpm lint && pnpm typecheck && pnpm test`; expected exit code 0.

---

## Chunk 4: Operational routes and security

### Task 11: Add route recovery UI

**Files:**
- Create: `src/app/error.tsx`, `not-found.tsx`, `loading.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Build accessible status surfaces**

Use the existing editorial shell. Error is a Client Component calling `reset()`; not-found links home/journal; loading exposes `aria-busy`.

- [ ] **Step 2: Re-run boundary regression search**

Expected: only explicit client files contain event handlers.

### Task 12: Add sitemap and robots test-first

**Files:**
- Create: `src/lib/sitemap.test.ts`, `src/lib/sitemap.ts`
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`
- Modify: `src/app/layout.tsx`, `src/components/article/giscus-comments.tsx`

- [ ] **Step 1: Test sitemap assembly**

Assert static routes always exist, dynamic slugs are included/deduplicated, and rejected loaders degrade to static routes.

- [ ] **Step 2: Implement best-effort assembly**

Log loader failures and omit dynamic routes. Never substitute mocks after configured-CMS failure.

- [ ] **Step 3: Use canonical origin everywhere**

Use `SITE_URL` for metadataBase, robots, sitemap, Giscus theme URLs, and share URLs.

### Task 13: Add security headers

**Files:**
- Modify: `next.config.mjs`

- [ ] **Step 1: Implement CSP directives**

Use the exact approved directives. Add configured Strapi origin to connect-src when valid. Add unsafe-eval only in development.

- [ ] **Step 2: Add other headers**

Add nosniff, referrer policy, permissions policy, HSTS, frame protection, and retain Giscus CSS CORS.

- [ ] **Step 3: Build and commit**

Run: `pnpm build`

Expected: all app, sitemap, and robots routes build.

Commit: `feat: add operational routes and security policy`

### Chunk 4 exact implementation contract

`error.tsx` must render both `<button onClick={() => reset()}>Try again</button>`
and `<Link href="/">Go home</Link>`. `not-found.tsx` renders links to `/` and
`/jurnal`. `loading.tsx` wraps its skeleton in an element with
`aria-busy="true"` and `aria-label="Loading page"`.

Put sitemap assembly in a pure injectable function:

```ts
type Slug = { slug: string; locale: Locale }
type SlugLoader = () => Promise<Slug[]>
export async function buildSitemapEntries(
  articleLoader: SlugLoader,
  projectLoader: SlugLoader,
): Promise<MetadataRoute.Sitemap>
```

It starts with exactly `/`, `/jurnal`, and `/portfolio`. It awaits each loader
independently in `try/catch`, logs failures, adds `/jurnal/${slug}` and
`/portfolio/${slug}`, deduplicates by absolute URL, and returns entries with
`lastModified: new Date()` and sensible priorities 1.0/0.8/0.7. A rejected
article loader must not remove successful project entries. Tests cover both
loaders succeeding, duplicate EN/ID slugs, one rejecting, and both rejecting.
`src/app/sitemap.ts` calls it with `fetchAllSlugs` and
`fetchAllProjectSlugs`. `robots.ts` returns allow `/`, disallow `/api/`, and
`${SITE_URL}/sitemap.xml`.

Extract header construction to `src/lib/security-headers.mjs` with tests in
`src/lib/security-headers.test.ts` so it is importable by `next.config.mjs`:

```js
export function buildSecurityHeaders({ production, strapiUrl }) {
  const connect = ["'self'", "https://giscus.app", "https://api.github.com"]
  try { if (strapiUrl) connect.push(new URL(strapiUrl).origin) } catch {}
  const scripts = ["'self'", "'unsafe-inline'", "https://giscus.app"]
  if (!production) scripts.push("'unsafe-eval'")
  const csp = [
    ["default-src", "'self'"],
    ["script-src", ...scripts],
    ["style-src", "'self'", "'unsafe-inline'"],
    ["img-src", "'self'", "data:", "blob:", "https:"],
    ["font-src", "'self'", "data:"],
    ["connect-src", ...new Set(connect)],
    ["frame-src", "https://giscus.app"],
    ["worker-src", "'self'", "blob:"],
    ["object-src", "'none'"],
    ["base-uri", "'self'"],
    ["form-action", "'self'"],
    ["frame-ancestors", "'none'"],
  ].map((parts) => parts.join(" ")).join("; ")
  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  ]
}
```

Tests assert production excludes unsafe-eval, development includes it, valid
Strapi contributes only its origin, invalid URL is ignored, and every exact
header/value exists. `next.config.mjs` applies these headers to `/(.*)` and
retains a separate `/giscus-theme-:theme.css` CORS rule.

After `pnpm build`, start production with Playwright or the server helper and
verify: `curl -I http://127.0.0.1:3000/` contains CSP, DENY, nosniff, and HSTS;
`curl http://127.0.0.1:3000/robots.txt` includes sitemap; and
`curl http://127.0.0.1:3000/sitemap.xml` includes all three static routes.
Expected HTTP status is 200 for all three resources.

---

## Chunk 5: Browser coverage, CI, and docs

### Task 14: Add browser smoke tests

**Files:**
- Create: `tests/e2e/smoke.spec.ts`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Inspect server helper usage**

Run: `python /Users/fahmi/.agents/skills/webapp-testing/scripts/with_server.py --help`

Do not read helper source unless invocation cannot satisfy the test.

- [ ] **Step 2: Write Playwright cases**

Cover home, journal, mock article, portfolio, mock project, and 404. Toggle ID and assert content plus document lang. Toggle dark and assert class. Assert unique article heading IDs and working TOC anchors. Fail on page errors and unexpected CSP-blocked required resources.

- [ ] **Step 3: Install Chromium and verify**

Run: `pnpm exec playwright install chromium`

Run: `pnpm verify:e2e`

Expected: lint, types, unit, build, and Chromium smoke tests pass.

### Task 15: Add CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Configure workflow**

On push/PR: checkout, pnpm setup from packageManager, Node 20 with pnpm cache, frozen install, Playwright Chromium+OS dependencies, then `pnpm verify:e2e`. Do not require Strapi secrets.

### Task 16: Synchronize docs

**Files:**
- Modify: `.env.example`, `README.md`, `DOCS.md`, `CLAUDE.md`, `STRAPI_SETUP.md`

- [ ] **Step 1: Document environment policy**

Add `NEXT_PUBLIC_SITE_URL` and commented `STRAPI_MOCK_FALLBACK`. Explain explicit failure behavior.

- [ ] **Step 2: Update versions and commands**

Use pnpm, Next 16, Node 20, and list lint/typecheck/test/test:e2e/verify commands. Remove no-test and unimplemented-webhook claims.

- [ ] **Step 3: Update architecture**

Describe summary API, server-rendered detail/portfolio, fallback policy, and deferred locale-path migration.

- [ ] **Step 4: Final verification**

Run: `pnpm verify:e2e`

Run: `git diff --check`

Expected: all checks pass; user's untracked `AGENTS.md` remains untouched.

- [ ] **Step 5: Commit**

Commit: `test: verify production hardening flows`

### Task 17: Final audit

- [ ] **Step 1: Review `git diff main...HEAD` against the spec**
- [ ] **Step 2: Confirm `AGENTS.md` was neither modified nor committed**
- [ ] **Step 3: Report outcomes, verification, commits, and deferred locale migration**

### Chunk 5 exact implementation contract

The helper inspection remains because the webapp-testing skill requires it;
use it only for the manual header/metadata smoke after Playwright owns the main
server lifecycle. Run exactly:

`python /Users/fahmi/.agents/skills/webapp-testing/scripts/with_server.py --help`

`smoke.spec.ts` installs `pageerror`, console-error, and failed-request
collectors in `beforeEach` and asserts they remain empty except requests
explicitly intercepted by that test. Required cases and selectors are:

1. Visit `/`, `/jurnal`, `/jurnal/my-first-llm-call`, `/portfolio`, and
   `/portfolio/jurnal-summarizer`; each response is 200 and has one H1.
2. Visit `/does-not-exist`; assert 404 and visible `Page not found`.
3. Click `Switch to Bahasa Indonesia`; assert `html[lang=id]`. Click `Dark
   theme`; assert `html.dark`.
4. Visit `/jurnal/my-first-llm-call`; assert all H2/H3 IDs are unique and every
   `nav[aria-label="Table of contents"] a` hash resolves to exactly one element.
5. Seed localStorage language `id`, visit `/jurnal/pertama-kali-manggil-llm`,
   and assert the Twitter share href contains the encoded ID slug. This tests
   translated sharing without requiring both mock localizations on one page.
6. Intercept `/api/articles*` with 503, visit `/jurnal`, assert error copy and no
   skeleton after network idle; remove interception, click `Try again`, and
   assert article links appear.
7. Inspect the home response headers: CSP includes giscus script/frame origins,
   frame-ancestors none, and security headers have exact values. The unit header
   test separately proves a configured Strapi origin is included.

CI file is exactly:

```yaml
name: CI
on:
  push:
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          run_install: false
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm verify:e2e
```

Validate YAML structurally by loading it with the bundled YAML parser if
available; otherwise inspect `git diff --check` and rely on GitHub Actions'
documented schema. Expected CI command exit code is 0.

Documentation edits are bounded to these exact sections:

- `.env.example`: add `NEXT_PUBLIC_SITE_URL=https://jurnal.dev` and commented
  `STRAPI_MOCK_FALLBACK=false`, followed by two comments explaining no-URL mock
  mode and configured-CMS failure propagation.
- `CLAUDE.md`: replace commands block with pnpm dev/build/start/lint/typecheck/
  test/test:e2e/verify; replace `No test suite` with Vitest+Playwright locations;
  replace Next 15 with Next 16; replace automatic fallback wording with the
  three-mode policy.
- `DOCS.md`: change npm commands to pnpm, Next 15 to 16, add Testing and CMS
  failure-policy subsections, add portfolio routes to route table, and remove
  the claim that the platform is a static-export candidate because it has route
  handlers and ISR.
- `README.md`: keep the personal profile, add a `Development` section linking
  `DOCS.md` and showing `pnpm install`, `pnpm dev`, and `pnpm verify`.
- `STRAPI_SETUP.md`: replace the unimplemented webhook instruction with a note
  that ISR revalidates every 60 seconds and webhook invalidation is future work;
  document explicit fallback flag for previews only.

Execute final commands separately and record each exit code:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
git diff --check
git status --short
git diff main...HEAD --stat
```

Expected: every pnpm/git validation command exits 0; Playwright reports all
tests passed; status contains intended changes plus untouched untracked
`AGENTS.md`. Review `git diff main...HEAD` and map every approved spec section
to at least one changed file before the final commit/report.
