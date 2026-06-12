# Portfolio Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/portfolio` (featured + numbered list index) and `/portfolio/[slug]` (split-header case-study) pages backed by a new Strapi `project` collection with mock fallback, plus homepage "Selected Work" section and header nav link.

**Architecture:** Mirrors the existing article pipeline exactly: Strapi collection → `client.ts` REST queries → `index.ts` fetchers with automatic mock fallback → server components that render both EN and ID locale versions into the DOM, toggled by `LocaleGate`. Case-study markdown is rendered server-side by the existing `ArticleBody` (Shiki highlighting, callouts). ISR 60s on both pages.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript strict, Strapi v5 REST, inline styles + CSS vars (per project convention — no Tailwind in article-like surfaces).

**Spec:** `docs/superpowers/specs/2026-06-12-portfolio-pages-design.md`

**Testing note:** This repo has no test suite (per CLAUDE.md). TDD steps are replaced by verification steps: `pnpm lint`, `pnpm build`, and manual browser checks with mock data. Do not introduce a test framework.

**Deviations from spec (intentional):**
- No `fetchAllProjectSlugs` / `generateStaticParams`: the existing article detail page has neither (the `fetchAllSlugs` fetcher is dead code, used nowhere). Detail pages rely on on-demand ISR, same as articles.
- UI copy lives in per-component `copy` objects (the pattern used by `src/app/jurnal/page.tsx` and `site-header.tsx`), not `src/lib/content.ts` — homepage labels actually come from the Strapi landing page, and `content.ts` is the legacy mock for it. Adding a `work` key to the landing-page `sections` would require a Strapi single-type schema change for one label; hardcoded bilingual copy is the established pattern for new pages.

---

## File map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/strapi/types.ts` | Modify | `StrapiProject`, `ProjectStatus` types |
| `src/lib/strapi/mock.ts` | Modify | 3 mock projects × 2 locales + getters |
| `src/lib/strapi/client.ts` | Modify | `getProjects`, `getProjectBySlug` REST queries |
| `src/lib/strapi/index.ts` | Modify | `fetchProjects`, `fetchProjectBySlug` with mock fallback |
| `public/mock/project-cover.svg` | Create | Placeholder cover so mock featured card renders |
| `src/app/globals.css` | Modify | `.project-row`, `.featured-project`, `.project-header` responsive classes |
| `src/components/portfolio/status-label.ts` | Create | `STATUS_LABEL` display map |
| `src/components/portfolio/project-row.tsx` | Create | Compact numbered list row |
| `src/components/portfolio/featured-project.tsx` | Create | Featured card (cover + blurb) |
| `src/components/portfolio/project-meta.tsx` | Create | Hairline spec table (Year/Status/Stack/Links) |
| `src/components/portfolio/project-gallery.tsx` | Create | Stacked screenshots below body |
| `src/app/portfolio/page.tsx` | Create | Index page |
| `src/app/portfolio/[slug]/project-view.tsx` | Create | Detail view (mirrors `article-view.tsx`) |
| `src/app/portfolio/[slug]/page.tsx` | Create | Detail page (fetch, locale resolution, metadata) |
| `src/components/layout/site-header.tsx` | Modify | Add Portfolio nav link |
| `src/components/home/work-section.tsx` | Create | Homepage "Selected Work" rows + view-all link |
| `src/app/page.tsx` | Modify | Fetch projects, insert Work section as 03, renumber Connect 04→05 |
| `src/components/home/lab-section.tsx` | Modify | Renumber Lab 03→04 |
| `STRAPI_SETUP.md` | Modify | Document `project` collection setup |

---

### Task 1: Project types

**Files:**
- Modify: `src/lib/strapi/types.ts`

- [ ] **Step 1: Add project types**

Append after the `StrapiArticle` interface (after line 61):

```ts
export type ProjectStatus = "live" | "wip" | "archived"

export interface StrapiProject {
  id: number
  documentId: string
  slug: string
  title: string
  excerpt: string
  body: string // Markdown case study
  year: number
  status: ProjectStatus
  stack: string[] // JSON field in Strapi, e.g. ["Python", "LLM"]
  githubUrl?: string | null
  demoUrl?: string | null
  publishedAt: string
  updatedAt: string
  locale: Locale
  localizations?: Array<{
    id: number
    documentId: string
    locale: Locale
    slug: string
  }>
  cover?: StrapiImage | null
  gallery?: StrapiImage[]
  featured?: boolean
  order?: number // manual curated sort (1, 2, 3...)
}
```

- [ ] **Step 2: Verify**

Run: `pnpm lint`
Expected: passes (warnings unrelated to this change are acceptable if pre-existing).

- [ ] **Step 3: Commit**

```bash
git add src/lib/strapi/types.ts
git commit -m "feat: add StrapiProject type for portfolio"
```

---

### Task 2: Mock projects + placeholder cover

**Files:**
- Modify: `src/lib/strapi/mock.ts`
- Create: `public/mock/project-cover.svg`

- [ ] **Step 1: Create placeholder cover SVG**

Create `public/mock/project-cover.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#d0d4d4"/><text x="600" y="345" text-anchor="middle" font-family="monospace" font-size="28" fill="#676f7b">project cover</text></svg>
```

- [ ] **Step 2: Add `StrapiProject` to the type import in `mock.ts`**

The import at the top of `mock.ts` gains `StrapiProject`:

```ts
import type {
  Locale,
  StrapiArticle,
  StrapiLandingPage,
  StrapiProject,
  StrapiSocialLink,
} from "./types"
```

(Match the actual existing import statement — add the name, keep the rest.)

- [ ] **Step 3: Add mock projects and getters**

Append at the end of `mock.ts`. EN/ID pairs share the same slug (Strapi i18n allows this), so the detail page resolves both locales without `localizations` in mock mode. Bodies reuse the existing `sampleBody` constant.

```ts
// --- Project mocks ---

const mockCover = {
  id: 901,
  url: "/mock/project-cover.svg",
  width: 1200,
  height: 675,
  alternativeText: "Project cover placeholder",
}

export const mockProjects: StrapiProject[] = [
  {
    id: 101,
    documentId: "mock-project-1",
    slug: "jurnal-summarizer",
    title: "Jurnal Summarizer",
    excerpt:
      "AI pipeline that digests my dev journals into weekly briefs with an LLM.",
    body: sampleBody,
    year: 2026,
    status: "live",
    stack: ["Python", "LLM", "Cron"],
    githubUrl: "https://github.com/jurnaldev",
    demoUrl: "https://jurnal.dev",
    publishedAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
    locale: "en",
    cover: mockCover,
    gallery: [mockCover, { ...mockCover, id: 902 }],
    featured: true,
    order: 1,
  },
  {
    id: 102,
    documentId: "mock-project-1-id",
    slug: "jurnal-summarizer",
    title: "Jurnal Summarizer",
    excerpt:
      "Pipeline AI yang ngerangkum jurnal dev gw jadi brief mingguan pake LLM.",
    body: sampleBody,
    year: 2026,
    status: "live",
    stack: ["Python", "LLM", "Cron"],
    githubUrl: "https://github.com/jurnaldev",
    demoUrl: "https://jurnal.dev",
    publishedAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
    locale: "id",
    cover: mockCover,
    gallery: [mockCover, { ...mockCover, id: 902 }],
    featured: true,
    order: 1,
  },
  {
    id: 103,
    documentId: "mock-project-2",
    slug: "jurnal-dev",
    title: "jurnal.dev",
    excerpt:
      "This site — bilingual dev journal built with Next.js 15 and Strapi.",
    body: sampleBody,
    year: 2026,
    status: "live",
    stack: ["Next.js", "TypeScript", "Strapi"],
    githubUrl: "https://github.com/jurnaldev/jurnaldev",
    demoUrl: "https://jurnal.dev",
    publishedAt: "2026-04-20T10:00:00.000Z",
    updatedAt: "2026-04-20T10:00:00.000Z",
    locale: "en",
    cover: mockCover,
    gallery: [],
    featured: false,
    order: 2,
  },
  {
    id: 104,
    documentId: "mock-project-2-id",
    slug: "jurnal-dev",
    title: "jurnal.dev",
    excerpt:
      "Situs ini — jurnal dev bilingual yang dibangun pake Next.js 15 dan Strapi.",
    body: sampleBody,
    year: 2026,
    status: "live",
    stack: ["Next.js", "TypeScript", "Strapi"],
    githubUrl: "https://github.com/jurnaldev/jurnaldev",
    demoUrl: "https://jurnal.dev",
    publishedAt: "2026-04-20T10:00:00.000Z",
    updatedAt: "2026-04-20T10:00:00.000Z",
    locale: "id",
    cover: mockCover,
    gallery: [],
    featured: false,
    order: 2,
  },
  {
    id: 105,
    documentId: "mock-project-3",
    slug: "devlog-cli",
    title: "devlog CLI",
    excerpt:
      "Terminal tool for capturing dev-journal entries straight from the shell.",
    body: sampleBody,
    year: 2025,
    status: "wip",
    stack: ["Node.js", "TypeScript"],
    githubUrl: "https://github.com/jurnaldev",
    demoUrl: null,
    publishedAt: "2025-12-10T10:00:00.000Z",
    updatedAt: "2025-12-10T10:00:00.000Z",
    locale: "en",
    cover: null,
    gallery: [],
    featured: false,
    order: 3,
  },
  {
    id: 106,
    documentId: "mock-project-3-id",
    slug: "devlog-cli",
    title: "devlog CLI",
    excerpt:
      "Tool terminal buat nyatet entry jurnal dev langsung dari shell.",
    body: sampleBody,
    year: 2025,
    status: "wip",
    stack: ["Node.js", "TypeScript"],
    githubUrl: "https://github.com/jurnaldev",
    demoUrl: null,
    publishedAt: "2025-12-10T10:00:00.000Z",
    updatedAt: "2025-12-10T10:00:00.000Z",
    locale: "id",
    cover: null,
    gallery: [],
    featured: false,
    order: 3,
  },
]

export function getMockProjects(locale: Locale = "en"): StrapiProject[] {
  return mockProjects.filter((p) => p.locale === locale)
}

export function getMockProjectBySlug(
  slug: string,
  locale: Locale = "en",
): StrapiProject | null {
  return (
    mockProjects.find((p) => p.slug === slug && p.locale === locale) ?? null
  )
}
```

- [ ] **Step 4: Verify**

Run: `pnpm lint`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/strapi/mock.ts public/mock/project-cover.svg
git commit -m "feat: add mock projects for portfolio local dev"
```

---

### Task 3: Strapi client queries

**Files:**
- Modify: `src/lib/strapi/client.ts`

- [ ] **Step 1: Add `StrapiProject` to the type import in `client.ts`**

Add `StrapiProject` to the existing `import type { ... } from "./types"` at the top of the file.

- [ ] **Step 2: Add project queries**

Append after the article queries section (after `getRelatedArticles`, before `// --- Landing page queries ---`):

```ts
// --- Project queries ---

export async function getProjects(
  locale: Locale = "en",
  options?: { limit?: number; featured?: boolean },
): Promise<StrapiProject[]> {
  const params = new URLSearchParams({
    locale,
    "sort[0]": "order:asc",
    "populate[cover]": "true",
  })
  if (options?.limit) params.set("pagination[limit]", String(options.limit))
  if (options?.featured) params.set("filters[featured][$eq]", "true")

  const res = await strapiFetch<StrapiListResponse<StrapiProject>>(
    `/projects?${params.toString()}`,
    { next: { revalidate: 60, tags: ["projects"] } },
  )
  return res.data
}

export async function getProjectBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<StrapiProject | null> {
  const params = new URLSearchParams({
    locale,
    "filters[slug][$eq]": slug,
    "populate[cover]": "true",
    "populate[gallery]": "true",
    "populate[localizations]": "true",
  })

  const res = await strapiFetch<StrapiListResponse<StrapiProject>>(
    `/projects?${params.toString()}`,
    { next: { revalidate: 60, tags: [`project:${slug}`] } },
  )
  return res.data[0] ?? null
}
```

- [ ] **Step 3: Verify**

Run: `pnpm lint`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/lib/strapi/client.ts
git commit -m "feat: add Strapi project queries"
```

---

### Task 4: Public fetchers with mock fallback

**Files:**
- Modify: `src/lib/strapi/index.ts`

- [ ] **Step 1: Add `StrapiProject` to the type import in `index.ts`**

Add `StrapiProject` to the existing `import type { ... } from "./types"`.

- [ ] **Step 2: Add fetchers**

Append after `fetchAllSlugs` (before `fetchLandingPage`). Same fallback shape as `fetchArticles`/`fetchArticleBySlug`:

```ts
export async function fetchProjects(
  locale: Locale = "en",
  options?: { limit?: number; featured?: boolean },
): Promise<StrapiProject[]> {
  if (USE_MOCK) {
    let projects = mock.getMockProjects(locale)
    if (options?.featured) projects = projects.filter((p) => p.featured)
    if (options?.limit) projects = projects.slice(0, options.limit)
    return projects
  }

  try {
    return await client.getProjects(locale, options)
  } catch (err) {
    console.warn("[strapi] fetchProjects failed, falling back to mock:", err)
    let projects = mock.getMockProjects(locale)
    if (options?.featured) projects = projects.filter((p) => p.featured)
    if (options?.limit) projects = projects.slice(0, options.limit)
    return projects
  }
}

export async function fetchProjectBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<StrapiProject | null> {
  if (USE_MOCK) return mock.getMockProjectBySlug(slug, locale)

  try {
    return await client.getProjectBySlug(slug, locale)
  } catch (err) {
    console.warn(
      "[strapi] fetchProjectBySlug failed, falling back to mock:",
      err,
    )
    return mock.getMockProjectBySlug(slug, locale)
  }
}
```

- [ ] **Step 3: Verify**

Run: `pnpm lint && pnpm build`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/strapi/index.ts
git commit -m "feat: add project fetchers with mock fallback"
```

---

### Task 5: Portfolio CSS classes

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add responsive layout classes**

Inline styles can't express hover or media queries, so these live in `globals.css` (same approach as `.article-layout`, `.nav-link`). Append at the end of the file:

```css
/* --- Portfolio --- */

.project-row {
  display: flex;
  gap: 14px;
  align-items: baseline;
  padding: 14px 0;
  text-decoration: none;
  transition: opacity 0.15s ease;
}
.project-row:hover {
  opacity: 0.7;
}

.featured-project {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  text-decoration: none;
  padding: 1.25rem 0;
  transition: opacity 0.15s ease;
}
.featured-project:hover {
  opacity: 0.8;
}
@media (min-width: 640px) {
  .featured-project {
    grid-template-columns: 46% 1fr;
    align-items: start;
  }
}

.project-header {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}
.project-header-cover {
  order: -1; /* cover on top on mobile */
}
@media (min-width: 768px) {
  .project-header {
    grid-template-columns: 1fr 42%;
    align-items: start;
  }
  .project-header-cover {
    order: 2; /* cover right on desktop */
  }
}
```

- [ ] **Step 2: Verify**

Run: `pnpm lint`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add portfolio layout css classes"
```

---

### Task 6: Portfolio components

**Files:**
- Create: `src/components/portfolio/status-label.ts`
- Create: `src/components/portfolio/project-row.tsx`
- Create: `src/components/portfolio/featured-project.tsx`
- Create: `src/components/portfolio/project-meta.tsx`
- Create: `src/components/portfolio/project-gallery.tsx`

All are server-safe (no hooks, no event handlers — hover comes from CSS classes added in Task 5).

- [ ] **Step 1: Create `src/components/portfolio/status-label.ts`**

```ts
import type { ProjectStatus } from "@/lib/strapi/types"

// Status badges stay English in both locales (per spec)
export const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "Live",
  wip: "WIP",
  archived: "Archived",
}
```

- [ ] **Step 2: Create `src/components/portfolio/project-row.tsx`**

```tsx
import Link from "next/link"
import type { StrapiProject } from "@/lib/strapi/types"
import { STATUS_LABEL } from "./status-label"

export function ProjectRow({ project }: { project: StrapiProject }) {
  const number = String(project.order ?? 0).padStart(3, "0")

  return (
    <Link href={`/portfolio/${project.slug}`} className="project-row">
      <span
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "11px",
          color: "var(--stone)",
          letterSpacing: "0.2px",
          flexShrink: 0,
        }}
      >
        {number}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.2px",
          }}
        >
          {project.title}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "13px",
            color: "var(--graphite)",
            marginTop: "2px",
            lineHeight: 1.5,
          }}
        >
          {project.excerpt}
        </span>
      </span>
      <span
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "11px",
          color: "var(--stone)",
          letterSpacing: "0.2px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {project.year} · {STATUS_LABEL[project.status]}
      </span>
    </Link>
  )
}
```

- [ ] **Step 3: Create `src/components/portfolio/featured-project.tsx`**

Only rendered when the project has a cover (the index page guarantees this — see Task 7).

```tsx
import Link from "next/link"
import type { StrapiProject } from "@/lib/strapi/types"
import { strapiMediaUrl } from "@/lib/strapi"
import { Tag } from "@/components/ui/tag"

export function FeaturedProject({
  project,
  label,
}: {
  project: StrapiProject
  label: string
}) {
  const coverUrl = strapiMediaUrl(project.cover?.url)
  const number = String(project.order ?? 0).padStart(3, "0")

  return (
    <Link href={`/portfolio/${project.slug}`} className="featured-project">
      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={project.cover?.alternativeText || project.title}
          style={{
            width: "100%",
            aspectRatio: "16 / 10",
            objectFit: "cover",
            display: "block",
            background: "var(--hairline)",
          }}
        />
      )}
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "11px",
            color: "var(--stone)",
            letterSpacing: "0.2px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          {label} · {number}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "1.35rem",
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.4px",
            lineHeight: 1.15,
          }}
        >
          {project.title}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "14px",
            color: "var(--graphite)",
            margin: "8px 0 12px",
            lineHeight: 1.55,
          }}
        >
          {project.excerpt}
        </span>
        <span style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {project.stack.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </span>
      </span>
    </Link>
  )
}
```

- [ ] **Step 4: Create `src/components/portfolio/project-meta.tsx`**

```tsx
import { ArrowUpRight } from "lucide-react"
import type { StrapiProject } from "@/lib/strapi/types"
import { STATUS_LABEL } from "./status-label"

export interface MetaLabels {
  year: string
  status: string
  stack: string
  links: string
}

function MetaRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "16px",
        padding: "8px 0",
        borderTop: "1px solid var(--hairline)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "10px",
          color: "var(--stone)",
          letterSpacing: "0.35px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          color: "var(--ink)",
          textAlign: "right",
        }}
      >
        {children}
      </span>
    </div>
  )
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "var(--ink)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        borderBottom: "1px solid var(--hairline-soft)",
      }}
    >
      {label}
      <ArrowUpRight size={12} strokeWidth={2} />
    </a>
  )
}

export function ProjectMeta({
  project,
  labels,
}: {
  project: StrapiProject
  labels: MetaLabels
}) {
  const hasLinks = Boolean(project.githubUrl || project.demoUrl)

  return (
    <div style={{ borderBottom: "1px solid var(--hairline)" }}>
      <MetaRow label={labels.year}>{project.year}</MetaRow>
      <MetaRow label={labels.status}>{STATUS_LABEL[project.status]}</MetaRow>
      <MetaRow label={labels.stack}>{project.stack.join(" · ")}</MetaRow>
      {hasLinks && (
        <MetaRow label={labels.links}>
          <span
            style={{
              display: "inline-flex",
              gap: "14px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {project.githubUrl && (
              <ExternalLink href={project.githubUrl} label="GitHub" />
            )}
            {project.demoUrl && (
              <ExternalLink href={project.demoUrl} label="Demo" />
            )}
          </span>
        </MetaRow>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/portfolio/project-gallery.tsx`**

```tsx
import { strapiMediaUrl } from "@/lib/strapi"
import type { StrapiImage } from "@/lib/strapi/types"

export function ProjectGallery({ images }: { images: StrapiImage[] }) {
  if (!images.length) return null

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginTop: "3rem",
      }}
    >
      {images.map((image) => {
        const url = strapiMediaUrl(image.url)
        if (!url) return null
        return (
          <figure key={image.id} style={{ margin: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={image.alternativeText || ""}
              style={{
                width: "100%",
                display: "block",
                background: "var(--hairline)",
              }}
            />
            {image.alternativeText && (
              <figcaption
                style={{
                  fontSize: "12px",
                  color: "var(--stone)",
                  marginTop: "8px",
                }}
              >
                {image.alternativeText}
              </figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 6: Verify**

Run: `pnpm lint`
Expected: passes. (Components are not yet imported anywhere; unused-module warnings don't apply to files.)

- [ ] **Step 7: Commit**

```bash
git add src/components/portfolio/
git commit -m "feat: add portfolio components (row, featured card, meta table, gallery)"
```

---

### Task 7: Portfolio index page

**Files:**
- Create: `src/app/portfolio/page.tsx`

- [ ] **Step 1: Create the page**

Server component; fetches both locales in parallel and renders both via `LocaleGate` (homepage pattern, NOT the client-fetch pattern of `/jurnal`). Featured logic per spec: first `featured` project gets the big card; a featured project without a cover degrades to a row; if nothing is flagged featured, the first project (by `order`) is promoted — but only if it has a cover.

```tsx
import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/site-header"
import { LocaleGate } from "@/components/locale-gate"
import { FeaturedProject } from "@/components/portfolio/featured-project"
import { ProjectRow } from "@/components/portfolio/project-row"
import { fetchProjects } from "@/lib/strapi"
import type { StrapiProject } from "@/lib/strapi/types"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected projects by Fahmi Hidayat — backend services, AI experiments, and side projects.",
}

const copy = {
  en: {
    eyebrow: "Portfolio",
    title: "Selected work.",
    subtitle:
      "Projects I've built and shipped — production services, AI experiments, side projects.",
    empty: "No projects yet. Check back soon.",
    featuredLabel: "Featured",
    count: (n: number) => `${n} ${n === 1 ? "project" : "projects"}`,
  },
  id: {
    eyebrow: "Portofolio",
    title: "Karya pilihan.",
    subtitle:
      "Project yang gw bikin dan rilis — service production, eksperimen AI, side project.",
    empty: "Belum ada project. Cek lagi nanti ya.",
    featuredLabel: "Featured",
    count: (n: number) => `${n} project`,
  },
}

function splitProjects(projects: StrapiProject[]): {
  featured: StrapiProject | null
  rows: StrapiProject[]
} {
  const candidate = projects.find((p) => p.featured) ?? projects[0]
  if (candidate?.cover) {
    return {
      featured: candidate,
      rows: projects.filter((p) => p.id !== candidate.id),
    }
  }
  return { featured: null, rows: projects }
}

function ProjectList({
  projects,
  t,
}: {
  projects: StrapiProject[]
  t: (typeof copy)["en"]
}) {
  const { featured, rows } = splitProjects(projects)

  return (
    <>
      <section style={{ marginBottom: "3rem" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--slate)",
            letterSpacing: "0.35px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          {t.eyebrow}
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 400,
            letterSpacing: "-1px",
            lineHeight: 1.05,
            margin: "0 0 0.75rem 0",
            color: "var(--ink)",
          }}
        >
          {t.title}
        </h1>
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.5,
            color: "var(--graphite)",
            margin: 0,
            maxWidth: "540px",
          }}
        >
          {t.subtitle}
        </p>
      </section>

      {projects.length > 0 && (
        <div
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "11px",
            color: "var(--stone)",
            letterSpacing: "0.2px",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          {t.count(projects.length)}
        </div>
      )}

      <div style={{ height: "1px", background: "var(--hairline)" }} />

      {projects.length === 0 ? (
        <div
          style={{
            padding: "3rem 1.5rem",
            textAlign: "center",
            color: "var(--graphite)",
            border: "1px solid var(--hairline)",
            marginTop: "1rem",
          }}
        >
          {t.empty}
        </div>
      ) : (
        <div>
          {featured && (
            <div style={{ borderBottom: "1px solid var(--hairline)" }}>
              <FeaturedProject project={featured} label={t.featuredLabel} />
            </div>
          )}
          {rows.map((project, i) => (
            <div
              key={project.id}
              style={{
                borderBottom:
                  i < rows.length - 1 ? "1px solid var(--hairline)" : "none",
              }}
            >
              <ProjectRow project={project} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default async function PortfolioPage() {
  const [projectsEn, projectsId] = await Promise.all([
    fetchProjects("en"),
    fetchProjects("id"),
  ])

  return (
    <main
      className="page-enter"
      style={{ minHeight: "100dvh", position: "relative" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "760px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <SiteHeader />
        <LocaleGate locale="en">
          <ProjectList projects={projectsEn} t={copy.en} />
        </LocaleGate>
        <LocaleGate locale="id">
          <ProjectList projects={projectsId} t={copy.id} />
        </LocaleGate>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify in browser**

Run: `pnpm dev`, open `http://localhost:3000/portfolio`
Expected: featured card (Jurnal Summarizer with placeholder cover) + two rows (jurnal.dev, devlog CLI). Language toggle switches excerpts. Theme toggle works.

- [ ] **Step 3: Verify build**

Run: `pnpm lint && pnpm build`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/portfolio/page.tsx
git commit -m "feat: add portfolio index page"
```

---

### Task 8: Project detail page

**Files:**
- Create: `src/app/portfolio/[slug]/project-view.tsx`
- Create: `src/app/portfolio/[slug]/page.tsx`

- [ ] **Step 1: Create `src/app/portfolio/[slug]/project-view.tsx`**

Mirrors `article-view.tsx`: server async component, pre-renders both locale bodies via `ArticleBody`, `LocaleGate` toggles, dashed-box fallback when one locale is missing. No TOC sidebar, no comments, no related section (per spec).

```tsx
import Link from "next/link"
import type { StrapiProject } from "@/lib/strapi/types"
import { ArticleBody } from "@/components/article/article-body"
import { ProjectMeta, type MetaLabels } from "@/components/portfolio/project-meta"
import { ProjectGallery } from "@/components/portfolio/project-gallery"
import { SiteHeader } from "@/components/layout/site-header"
import { LocaleGate } from "@/components/locale-gate"
import { strapiMediaUrl } from "@/lib/strapi"

interface Props {
  projectEn: StrapiProject | null
  projectId: StrapiProject | null
}

const copy: Record<
  "en" | "id",
  { label: string; back: string; meta: MetaLabels }
> = {
  en: {
    label: "Project",
    back: "← All projects",
    meta: { year: "Year", status: "Status", stack: "Stack", links: "Links" },
  },
  id: {
    label: "Project",
    back: "← Semua project",
    meta: { year: "Tahun", status: "Status", stack: "Stack", links: "Tautan" },
  },
}

function ProjectContent({
  project,
  body,
  t,
}: {
  project: StrapiProject
  body: React.ReactNode
  t: (typeof copy)["en"]
}) {
  const coverUrl = strapiMediaUrl(project.cover?.url)
  const number = String(project.order ?? 0).padStart(3, "0")

  return (
    <>
      <header className="project-header">
        <div>
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "var(--stone)",
              letterSpacing: "0.2px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            {t.label} · {number}
          </div>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)",
              fontWeight: 400,
              letterSpacing: "-0.9px",
              lineHeight: 1.05,
              margin: "0 0 0.75rem 0",
              color: "var(--ink)",
            }}
          >
            {project.title}
          </h1>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.55,
              color: "var(--graphite)",
              margin: "0 0 1.5rem 0",
            }}
          >
            {project.excerpt}
          </p>
          <ProjectMeta project={project} labels={t.meta} />
        </div>
        {coverUrl && (
          <div className="project-header-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={project.cover?.alternativeText || project.title}
              style={{
                width: "100%",
                aspectRatio: "4 / 3",
                objectFit: "cover",
                display: "block",
                background: "var(--hairline)",
              }}
            />
          </div>
        )}
      </header>

      {body}

      <ProjectGallery images={project.gallery ?? []} />

      <div
        style={{
          borderTop: "1px solid var(--hairline)",
          marginTop: "3rem",
          paddingTop: "1.5rem",
        }}
      >
        <Link
          href="/portfolio"
          style={{
            fontSize: "14px",
            color: "var(--slate)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          {t.back}
        </Link>
      </div>
    </>
  )
}

function MissingLocaleNotice({ locale }: { locale: "en" | "id" }) {
  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        color: "var(--graphite)",
        border: "1px dashed var(--hairline)",
        margin: "2rem 0",
      }}
    >
      {locale === "id" ? (
        <>
          Versi Bahasa Indonesia belum tersedia. <br />
          <em style={{ color: "var(--stone)" }}>
            This project is only available in English.
          </em>
        </>
      ) : (
        <>
          English version not available yet. <br />
          <em style={{ color: "var(--stone)" }}>
            Project ini hanya tersedia dalam Bahasa Indonesia.
          </em>
        </>
      )}
    </div>
  )
}

export async function ProjectView({ projectEn, projectId }: Props) {
  const bodyEn = projectEn ? await ArticleBody({ body: projectEn.body }) : null
  const bodyId = projectId ? await ArticleBody({ body: projectId.body }) : null

  return (
    <main
      className="page-enter"
      style={{ minHeight: "100vh", position: "relative" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "760px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <SiteHeader />

        <article style={{ minWidth: 0 }}>
          {projectEn && (
            <LocaleGate locale="en">
              <ProjectContent project={projectEn} body={bodyEn} t={copy.en} />
            </LocaleGate>
          )}
          {projectId && (
            <LocaleGate locale="id">
              <ProjectContent project={projectId} body={bodyId} t={copy.id} />
            </LocaleGate>
          )}
          {projectEn && !projectId && (
            <LocaleGate locale="id">
              <MissingLocaleNotice locale="id" />
            </LocaleGate>
          )}
          {!projectEn && projectId && (
            <LocaleGate locale="en">
              <MissingLocaleNotice locale="en" />
            </LocaleGate>
          )}
        </article>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create `src/app/portfolio/[slug]/page.tsx`**

Same locale-resolution dance as `src/app/jurnal/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { fetchProjectBySlug, strapiMediaUrl } from "@/lib/strapi"
import { ProjectView } from "./project-view"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project =
    (await fetchProjectBySlug(slug, "en")) ||
    (await fetchProjectBySlug(slug, "id"))

  if (!project) {
    return { title: "Not found · jurnal.dev" }
  }

  const ogImage = strapiMediaUrl(project.cover?.url)

  return {
    title: project.title,
    description: project.excerpt,
    openGraph: {
      title: project.title,
      description: project.excerpt,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.excerpt,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params

  const [projectEn, projectId] = await Promise.all([
    fetchProjectBySlug(slug, "en"),
    fetchProjectBySlug(slug, "id"),
  ])

  let resolvedEn = projectEn
  let resolvedId = projectId

  if (!resolvedEn && resolvedId?.localizations?.length) {
    const enLoc = resolvedId.localizations.find((l) => l.locale === "en")
    if (enLoc) resolvedEn = await fetchProjectBySlug(enLoc.slug, "en")
  }
  if (!resolvedId && resolvedEn?.localizations?.length) {
    const idLoc = resolvedEn.localizations.find((l) => l.locale === "id")
    if (idLoc) resolvedId = await fetchProjectBySlug(idLoc.slug, "id")
  }

  if (!resolvedEn && !resolvedId) notFound()

  return <ProjectView projectEn={resolvedEn} projectId={resolvedId} />
}

// ISR: revalidate every 60s
export const revalidate = 60
```

- [ ] **Step 3: Verify in browser**

Run: `pnpm dev`, open `http://localhost:3000/portfolio/jurnal-summarizer`
Expected: split header (meta table left, cover right on desktop; cover on top on mobile width), markdown body with highlighted code, 2-image gallery, back link. Toggle language and theme. Also check `http://localhost:3000/portfolio/devlog-cli` (no cover — header renders single column info only) and a bogus slug → 404.

- [ ] **Step 4: Verify build**

Run: `pnpm lint && pnpm build`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/portfolio/
git commit -m "feat: add project detail page with case-study layout"
```

---

### Task 9: Header nav link

**Files:**
- Modify: `src/components/layout/site-header.tsx`

- [ ] **Step 1: Add Portfolio to nav**

Change the `nav` constant (lines 9–12):

```tsx
const nav = {
  en: { home: "Home", journal: "Journal", portfolio: "Portfolio" },
  id: { home: "Beranda", journal: "Jurnal", portfolio: "Portofolio" },
}
```

And the links array inside the `<nav>` (around line 56):

```tsx
{[
  { href: "/", label: nav[lang].home },
  { href: "/jurnal", label: nav[lang].journal },
  { href: "/portfolio", label: nav[lang].portfolio },
].map(({ href, label }) => {
```

- [ ] **Step 2: Verify in browser**

Run: `pnpm dev`, check header on `/`, `/jurnal`, `/portfolio`
Expected: Portfolio link present, active state (ink color) on portfolio pages, label switches with language toggle.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/site-header.tsx
git commit -m "feat: add portfolio link to site header"
```

---

### Task 10: Homepage "Selected Work" section

**Files:**
- Create: `src/components/home/work-section.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/home/lab-section.tsx`

- [ ] **Step 1: Create `src/components/home/work-section.tsx`**

Shows up to 3 projects, featured first then by `order`, as compact rows + view-all link:

```tsx
import Link from "next/link"
import type { StrapiProject } from "@/lib/strapi/types"
import { ProjectRow } from "@/components/portfolio/project-row"

function topProjects(projects: StrapiProject[], n = 3): StrapiProject[] {
  return [...projects]
    .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
    .slice(0, n)
}

export function WorkSection({
  projects,
  viewAllLabel,
}: {
  projects: StrapiProject[]
  viewAllLabel: string
}) {
  const top = topProjects(projects)

  return (
    <>
      <div>
        {top.map((project, i) => (
          <div
            key={project.id}
            style={{
              borderBottom:
                i < top.length - 1 ? "1px solid var(--hairline)" : "none",
            }}
          >
            <ProjectRow project={project} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1rem" }}>
        <Link
          href="/portfolio"
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--slate)",
            textDecoration: "none",
          }}
        >
          {viewAllLabel}
        </Link>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Renumber Lab section**

In `src/components/home/lab-section.tsx` line 8, change:

```tsx
<SectionLabel number="03" label={data.sections.lab} icon={Sparkles} />
```

to:

```tsx
<SectionLabel number="04" label={data.sections.lab} icon={Sparkles} />
```

- [ ] **Step 3: Insert Work section into `src/app/page.tsx`**

Add imports:

```tsx
import { WorkSection } from "@/components/home/work-section"
import { fetchLandingPage, fetchProjects, fetchSocialLinks } from "@/lib/strapi"
```

(replacing the existing `fetchLandingPage, fetchSocialLinks` import line).

Extend the parallel fetch:

```tsx
const [enLanding, idLanding, socialLinks, projectsEn, projectsId] =
  await Promise.all([
    fetchLandingPage("en"),
    fetchLandingPage("id"),
    fetchSocialLinks(),
    fetchProjects("en"),
    fetchProjects("id"),
  ])
```

Insert between the Journal and Lab sections (work label is hardcoded bilingual copy — the Strapi landing-page `sections` type has no `work` key; this follows the hardcoded-copy pattern used by `site-header.tsx`):

```tsx
{/* Selected Work */}
{(projectsEn.length > 0 || projectsId.length > 0) && (
  <section data-animate="reveal" style={{ marginBottom: "5rem" }}>
    <LocaleGate locale="en">
      <SectionLabel number="03" label="Selected Work" />
      <WorkSection projects={projectsEn} viewAllLabel="View all projects →" />
    </LocaleGate>
    <LocaleGate locale="id">
      <SectionLabel number="03" label="Karya Pilihan" />
      <WorkSection projects={projectsId} viewAllLabel="Lihat semua project →" />
    </LocaleGate>
  </section>
)}
```

And renumber the Connect section labels from `number="04"` to `number="05"` (both `LocaleGate` blocks).

- [ ] **Step 4: Verify in browser**

Run: `pnpm dev`, open `http://localhost:3000`
Expected: section order Hero → About(01) → Journal(02) → Selected Work(03) → Lab(04) → Connect(05). Work section shows 3 rows (Jurnal Summarizer first — featured), view-all link navigates to `/portfolio`. GSAP reveal animation fires on the new section (it has `data-animate="reveal"`).

- [ ] **Step 5: Verify build**

Run: `pnpm lint && pnpm build`
Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/work-section.tsx src/components/home/lab-section.tsx src/app/page.tsx
git commit -m "feat: add Selected Work section to homepage"
```

---

### Task 11: Document Strapi collection setup

**Files:**
- Modify: `STRAPI_SETUP.md`

- [ ] **Step 1: Append project collection docs**

Read `STRAPI_SETUP.md` first and match its existing formatting style for collection definitions. Add a section documenting the new collection:

```markdown
## Project collection type

Create a collection type `project` (API ID: `project`, plural `projects`) with **Internationalization enabled** and **Draft & Publish on**.

| Field | Type | Notes |
| --- | --- | --- |
| `title` | Text (short) | required, localized |
| `slug` | UID (attached to title) | required. May be identical across locales |
| `excerpt` | Text (long) | required, localized — one-liner for list rows |
| `body` | Rich text (Markdown) | required, localized — the case study |
| `year` | Number (integer) | required |
| `status` | Enumeration: `live`, `wip`, `archived` | required |
| `stack` | JSON | string array, e.g. `["Python", "LLM"]` |
| `githubUrl` | Text (short) | optional |
| `demoUrl` | Text (short) | optional |
| `cover` | Media (single image) | optional but recommended — featured card needs it |
| `gallery` | Media (multiple images) | optional; captions come from alternative text |
| `featured` | Boolean | default false — drives index featured card + homepage order |
| `order` | Number (integer) | manual curated sort; lists sort by `order` ascending |

Grant the API token **find** and **findOne** permissions on `project`.
```

- [ ] **Step 2: Commit**

```bash
git add STRAPI_SETUP.md
git commit -m "docs: document project collection setup in Strapi"
```

---

### Task 12: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `pnpm lint && pnpm build`
Expected: both pass with `/portfolio` and `/portfolio/[slug]` in the route list.

- [ ] **Step 2: Manual matrix check**

Run `pnpm dev` and verify (use the webapp-testing skill for screenshots if available):

| Page | Checks |
| --- | --- |
| `/` | Work section present, numbering 01–05 correct, EN/ID toggle, light/dark |
| `/portfolio` | Featured card + rows, EN/ID toggle, light/dark, mobile width (375px) |
| `/portfolio/jurnal-summarizer` | Split header (cover right on desktop, top on mobile), meta table, body code highlighting, gallery, back link |
| `/portfolio/devlog-cli` | No-cover header renders cleanly, no Demo link in meta (githubUrl only) |
| `/portfolio/nonexistent` | 404 |
| Header | Portfolio link active state on portfolio pages |

- [ ] **Step 3: Fix anything found, commit fixes**

Each fix gets its own small commit (`fix: ...`).
