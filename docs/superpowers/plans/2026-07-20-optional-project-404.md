# Optional Project Collection 404 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep localized pages operational when the not-yet-deployed Strapi `projects` collection returns 404, without weakening failure handling for any other response.

**Architecture:** Add a typed HTTP error to the generic Strapi request function, then catch only status 404 inside the three project client entry points. These entry points return their natural empty values before the higher-level mock-fallback policy runs, while all other resources and statuses remain strict.

**Tech Stack:** TypeScript 6, Next.js 16 server data layer, Strapi v5 REST, Vitest 4

---

## File Structure

- `src/lib/strapi/client.ts`: own HTTP error classification and the narrow project-only empty-result policy.
- `src/lib/strapi/client.test.ts`: verify list/detail/enumeration 404 behavior and strict non-project/non-404 behavior.
- `src/lib/strapi/index.test.ts`: verify a project 404 wins over explicit generic mock fallback.
- `CLAUDE.md`: document the project-only exception in repository guidance.
- `DOCS.md`: document the same exception in user-facing runtime behavior.

## Chunk 1: Typed Error and Project Policy

### Task 1: Add failing project 404 tests

**Files:**
- Modify: `src/lib/strapi/client.test.ts`
- Modify: `src/lib/strapi/client.ts`

- [ ] **Step 1: Import all project readers and add 404 response coverage**

Add imports for `getProjects` and `getProjectBySlug`. Add a `describe` block that stubs `fetch` with `new Response(null, { status: 404, statusText: "Not Found" })`, spies on `console.warn`, and asserts:

```ts
await expect(getProjects("en")).resolves.toEqual([])
await expect(getProjectBySlug("missing", "en")).resolves.toBeNull()
await expect(getAllProjectSlugs()).resolves.toEqual([])
expect(warn).toHaveBeenCalled()
```

Use separate tests or reset the fetch mock between calls so each public entry point is independently proven.

Add explicit global cleanup because the Vitest configuration restores spies but
does not unstub globals:

```ts
afterEach(() => {
  vi.unstubAllGlobals()
})
```

- [ ] **Step 2: Add strictness tests**

Stub a 500 response and assert `getProjects("en")` rejects with the existing Strapi failure message. Stub a 404 response and assert `getArticles("en")` rejects. These tests prove the exception is both status-specific and resource-specific.

- [ ] **Step 3: Run focused tests and confirm red state**

Run: `pnpm test src/lib/strapi/client.test.ts`

Expected: FAIL because project 404 responses still throw.

- [ ] **Step 4: Add typed HTTP error classification**

Define a private or exported class carrying `status` and `url` while preserving the current error text:

```ts
export class StrapiHttpError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
    statusText: string,
  ) {
    super(`Strapi fetch failed: ${status} ${statusText} — ${url}`)
    this.name = "StrapiHttpError"
  }
}
```

Replace the generic `Error` in `strapiFetch` with this class.

- [ ] **Step 5: Add a project-only wrapper**

Add one helper near the project query section:

```ts
async function optionalProjectRead<T>(
  read: () => Promise<T>,
  emptyValue: T,
): Promise<T> {
  try {
    return await read()
  } catch (error) {
    if (!(error instanceof StrapiHttpError) || error.status !== 404) throw error
    console.warn(
      "[strapi] projects collection unavailable (404); returning an empty result",
    )
    return emptyValue
  }
}
```

- [ ] **Step 6: Wrap the three project entry points**

Wrap `getProjects` around its existing request and return `[]` on 404. Wrap `getProjectBySlug` and return `null`. Wrap `getAllProjectSlugs` around `getAllLocalizedSlugs("projects")` and return `[]`. Do not modify article, landing-page, social-link, or generic request behavior.

- [ ] **Step 7: Run focused tests and confirm green state**

Run: `pnpm test src/lib/strapi/client.test.ts`

Expected: all tests PASS.

- [ ] **Step 8: Commit tests and implementation together**

```bash
git add src/lib/strapi/client.test.ts src/lib/strapi/client.ts
git commit -m "fix: tolerate missing project collection"
```

## Chunk 2: Fallback Precedence and Documentation

### Task 2: Prove precedence over generic mock fallback

**Files:**
- Create: `src/lib/strapi/index.test.ts`

- [ ] **Step 1: Add an integration-style facade test**

Reset modules, configure both a CMS URL and `STRAPI_MOCK_FALLBACK=true`, stub `fetch` to return 404, then dynamically import the facade:

```ts
vi.stubEnv("NEXT_PUBLIC_STRAPI_URL", "https://cms.example.test")
vi.stubEnv("STRAPI_MOCK_FALLBACK", "true")
vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue(
    new Response(null, { status: 404, statusText: "Not Found" }),
  ),
)

const { fetchProjects } = await import("./index")
await expect(fetchProjects("en")).resolves.toEqual([])
```

Restore environment/global stubs after the test. This specifically prevents a regression where bundled mock projects appear in production while the collection is absent.

Use exact cleanup so cached module-level environment decisions cannot leak:

```ts
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})
```

- [ ] **Step 2: Run the facade test**

Run: `pnpm test src/lib/strapi/index.test.ts`

Expected: PASS because project classification happens before `fromSource` sees a rejection.

- [ ] **Step 3: Commit the facade test**

```bash
git add src/lib/strapi/index.test.ts
git commit -m "test: keep project 404 ahead of mock fallback"
```

### Task 3: Update runtime policy documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `DOCS.md`

- [ ] **Step 1: Document the narrow exception**

Keep the existing strict configured-CMS policy, then add that a 404 from the optional `projects` collection returns empty list/detail/slug results until that collection is deployed. Explicitly state that this exception does not cover 401/403, 5xx, timeouts, network failures, or other collections.

- [ ] **Step 2: Check documentation diff**

Run: `git diff --check && git diff -- CLAUDE.md DOCS.md`

Expected: no whitespace errors and only the scoped policy clarification.

- [ ] **Step 3: Commit documentation**

```bash
git add CLAUDE.md DOCS.md
git commit -m "docs: explain optional project collection behavior"
```

## Chunk 3: Verification

### Task 4: Run complete proportional verification

**Files:**
- Verify only

- [ ] **Step 1: Run the Strapi unit suite**

Run: `pnpm test src/lib/strapi`

Expected: all Strapi tests PASS.

- [ ] **Step 2: Run static checks**

Run: `pnpm typecheck`

Expected: PASS with no TypeScript diagnostics.

Run: `pnpm lint`

Expected: PASS with no ESLint errors.

- [ ] **Step 3: Run the complete unit suite**

Run: `pnpm test`

Expected: all tests PASS.

- [ ] **Step 4: Validate final diff and worktree state**

Run: `git diff --check`

Expected: no output.

Run: `git status --short`

Expected: only the user's pre-existing untracked `AGENTS.md` remains; the plan
document and all implementation changes are committed.
