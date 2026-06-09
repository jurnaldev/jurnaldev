# Design Revamp — DESIGN.md Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Runwai DESIGN.md design system to jurnal.dev — renaming CSS vars to DESIGN.md tokens, updating typography weights/tracking, switching article cards to research-card row layout, and giving every component the editorial monochrome aesthetic.

**Architecture:** Task 1 adds DESIGN.md vars to `globals.css` and forwards old var names to new ones (aliases) so out-of-scope article components keep working. Tasks 2–10 migrate each in-scope component to the new var names and visual spec. Task 11 cleans up globals.css utility classes. No new dependencies.

**Tech Stack:** Next.js 15, React 19, TypeScript strict, Tailwind CSS v4, inline styles (no Tailwind for component-level styles)

---

## File Map

| File | Change type |
|---|---|
| `src/app/globals.css` | Add DESIGN.md vars + alias old names; clean utility classes |
| `src/components/ui/section-label.tsx` | Token rename |
| `src/components/ui/meta-item.tsx` | Token rename + remove shadow, flat border |
| `src/components/ui/tag.tsx` | Token rename + micro-caps style |
| `src/components/layout/site-header.tsx` | Token rename + hairline border + sans nav links |
| `src/components/home/hero.tsx` | Token rename + weight 400 + tracking |
| `src/components/home/about-section.tsx` | Token rename + graphite body |
| `src/components/home/lab-section.tsx` | Token rename |
| `src/components/home/home-footer.tsx` | Token rename + dark footer bg |
| `src/components/social-links.tsx` | Token rename |
| `src/components/journal-section.tsx` | Token rename + thumbnail row layout + ghost pill |
| `src/components/article/article-card.tsx` | Full rewrite to research-card row |
| `src/app/jurnal/page.tsx` | Remove grid + illustrations + use shared ArticleCard |
| `src/components/article/article-header.tsx` | Token rename + weight 400 + micro-caps meta |

---

## Task 1: Add DESIGN.md CSS tokens + alias old vars

**Files:**
- Modify: `src/app/globals.css`

Out-of-scope article components (`article-body.tsx`, `toc.tsx`, `code-block.tsx`, etc.) still reference old var names. This task keeps old names as aliases pointing to new values so those files keep working without changes.

- [ ] **Step 1: Replace `src/app/globals.css` with new content**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* DESIGN.md tokens — light */
  --canvas: #ffffff;
  --canvas-warm: #fefefe;
  --ink: #030303;
  --ink-soft: #1a1a1a;
  --graphite: #404040;
  --slate: #676f7b;
  --stone: #939393;
  --hairline: #e7eaf0;
  --hairline-soft: #c9ccd1;
  --surface-cool: #d0d4d4;
  --primary: #000000;
  --on-primary: #ffffff;
  --footer-bg: #030303;
  --scrim: #1a1a1a;

  /* Aliases — keep out-of-scope components working */
  --bg: var(--canvas-warm);
  --bg-elevated: var(--canvas);
  --bg-card: var(--canvas);
  --text: var(--ink);
  --text-muted: var(--slate);
  --text-subtle: var(--stone);
  --border: var(--hairline);
  --border-hover: var(--hairline-soft);
  --code-bg: var(--surface-cool);
  --code-border: var(--hairline);

  /* Syntax */
  --syntax-key: #7c3aed;
  --syntax-str: #059669;
  --syntax-comment: #94a3b8;
  --syntax-fn: #2563eb;
  --syntax-num: #d97706;
}

.dark {
  /* DESIGN.md tokens — dark (adaptive inversion) */
  --canvas: #0a0a0a;
  --canvas-warm: #111111;
  --ink: #ededed;
  --ink-soft: #d0d0d0;
  --graphite: #8a8a8a;
  --slate: #6b7280;
  --stone: #404040;
  --hairline: #1f1f1f;
  --hairline-soft: #2a2a2a;
  --surface-cool: #1a1a1a;
  --primary: #ededed;
  --on-primary: #0a0a0a;
  --footer-bg: #0f0f0f;
  --scrim: #1a1a1a;

  --syntax-key: #c084fc;
  --syntax-str: #86efac;
  --syntax-comment: #525252;
  --syntax-fn: #60a5fa;
  --syntax-num: #fbbf24;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

h1,
h2,
h3,
h4 {
  text-wrap: balance;
}

:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
  border-radius: 3px;
}

html,
body {
  padding: 0;
  margin: 0;
  background-color: var(--canvas-warm);
  color: var(--ink);
  font-family:
    var(--font-geist-sans),
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
}

/* Prevent flash on theme switch */
html.no-transitions *,
html.no-transitions *::before,
html.no-transitions *::after {
  transition: none !important;
}

::selection {
  background: var(--ink);
  color: var(--canvas);
}

.social-link:hover {
  color: var(--ink) !important;
  border-color: var(--hairline-soft) !important;
  transform: translateY(-2px);
}

.cta-button:hover {
  transform: translateY(-1px);
}

.grid-overlay {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--hairline) 1px, transparent 1px),
    linear-gradient(90deg, var(--hairline) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}

.dark .grid-overlay {
  opacity: 0.25;
}

.article-card-row:hover .article-card-title {
  color: var(--ink-soft);
}

.nav-link {
  position: relative;
  transition: color 0.15s ease;
}
.nav-link:hover {
  color: var(--ink) !important;
}

/* Article detail layout: two-column on desktop, single column on mobile */
.article-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
}

@media (min-width: 1024px) {
  .article-layout {
    grid-template-columns: minmax(0, 1fr) 200px;
    gap: 3rem;
    align-items: start;
  }
  .toc-sidebar {
    order: 2;
    position: sticky;
    top: 2rem;
    align-self: start;
  }
}

@media (max-width: 1023px) {
  .toc-sidebar {
    display: none;
  }
}

/* Shiki code block adjustments */
.shiki {
  background: transparent !important;
  margin: 0;
}
.shiki code {
  background: transparent !important;
}
.dark .shiki .shiki-light {
  display: none !important;
}
.dark .shiki .shiki-dark {
  display: inline !important;
}
:root:not(.dark) .shiki .shiki-dark {
  display: none !important;
}
```

- [ ] **Step 2: Verify lint passes**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add DESIGN.md CSS tokens, alias old vars for compatibility"
```

---

## Task 2: Update UI primitives — SectionLabel, MetaItem, Tag

**Files:**
- Modify: `src/components/ui/section-label.tsx`
- Modify: `src/components/ui/meta-item.tsx`
- Modify: `src/components/ui/tag.tsx`

- [ ] **Step 1: Replace `src/components/ui/section-label.tsx`**

```tsx
import type { LucideIcon } from "lucide-react"

export function SectionLabel({
  number,
  label,
  icon: Icon,
}: {
  number: string
  label: string
  icon?: LucideIcon
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "1.5rem",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--slate)",
          letterSpacing: "0.35px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {number}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--hairline)" }} />
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--slate)",
          letterSpacing: "0.35px",
          textTransform: "uppercase",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {label}
        {Icon && <Icon size={11} strokeWidth={2} />}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/components/ui/meta-item.tsx`**

```tsx
export function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--hairline)",
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 500,
          color: "var(--stone)",
          letterSpacing: "0.2px",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "var(--ink)", lineHeight: "1.5" }}>
        {value}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Replace `src/components/ui/tag.tsx`**

```tsx
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "0.2px",
        textTransform: "uppercase",
        padding: "3px 10px",
        border: "1px solid var(--hairline)",
        borderRadius: "9999px",
        color: "var(--slate)",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Verify**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/section-label.tsx src/components/ui/meta-item.tsx src/components/ui/tag.tsx
git commit -m "style: update SectionLabel, MetaItem, Tag to DESIGN.md tokens"
```

---

## Task 3: Update SiteHeader

**Files:**
- Modify: `src/components/layout/site-header.tsx`

Changes: add hairline bottom border; nav links become 14px/600 Geist Sans in `--slate`; wordmark 14px/600 `--ink`.

- [ ] **Step 1: Replace `src/components/layout/site-header.tsx`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { LangToggle } from "@/components/lang-toggle"
import { useLang } from "@/contexts/lang-context"

const nav = {
  en: { home: "Home", journal: "Journal" },
  id: { home: "Beranda", journal: "Jurnal" },
}

export function SiteHeader({ marginBottom = "3rem" }: { marginBottom?: string }) {
  const { lang } = useLang()
  const pathname = usePathname()

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid var(--hairline)",
        marginBottom,
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          fontSize: "14px",
        }}
      >
        <Link
          href="/"
          style={{
            color: "var(--ink)",
            textDecoration: "none",
            fontWeight: 600,
            letterSpacing: "-0.3px",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          jurnal.dev
        </Link>

        <nav style={{ display: "flex", gap: "16px" }}>
          {[
            { href: "/", label: nav[lang].home },
            { href: "/jurnal", label: nav[lang].journal },
          ].map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname?.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="nav-link"
                style={{
                  color: active ? "var(--ink)" : "var(--slate)",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = active ? "var(--ink)" : "var(--slate)")
                }
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <LangToggle />
        <ThemeToggle />
      </div>
    </header>
  )
}
```

**Note:** Prop renamed from `paddingBottom` to `marginBottom` — it controls space AFTER the hairline divider. Internal padding above the hairline is fixed at `0.75rem`. Update callers in Task 11: replace `paddingBottom="4rem"` with `marginBottom="4rem"` on the homepage SiteHeader call.

- [ ] **Step 2: Verify**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/site-header.tsx
git commit -m "style: update SiteHeader — hairline border, sans nav 14/600, DESIGN.md tokens"
```

---

## Task 4: Update Hero

**Files:**
- Modify: `src/components/home/hero.tsx`

Changes: h1 weight → 400, letter-spacing → `-1.2px`; subtitle color → `--graphite`; location/handle → `--stone` uppercase.

- [ ] **Step 1: Replace `src/components/home/hero.tsx`**

```tsx
import { Avatar } from "@/components/avatar"
import { strapiMediaUrl } from "@/lib/strapi"
import type { StrapiLandingPage } from "@/lib/strapi/types"

export function Hero({ data }: { data: StrapiLandingPage }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "2rem",
        }}
      >
        <Avatar
          src={strapiMediaUrl(data.avatar?.url)}
          alt={data.avatar?.alternativeText ?? data.displayName}
        />

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "var(--stone)",
              letterSpacing: "0.2px",
              textTransform: "uppercase",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {data.statusDot && (
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "inline-block",
                  boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
                }}
              />
            )}
            {data.location.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "var(--stone)",
              letterSpacing: "0.2px",
            }}
          >
            {data.handle}
          </div>
        </div>
      </div>

      <h1
        style={{
          fontSize: "clamp(2.75rem, 7vw, 4.5rem)",
          fontWeight: 400,
          letterSpacing: "-1.2px",
          lineHeight: 1.0,
          margin: "0 0 1.5rem 0",
          color: "var(--ink)",
        }}
      >
        {data.displayName}
      </h1>

      <p
        style={{
          fontSize: "1.25rem",
          fontWeight: 400,
          letterSpacing: "0",
          lineHeight: 1.5,
          color: "var(--graphite)",
          margin: 0,
          maxWidth: "520px",
        }}
      >
        {data.role}{" "}
        <span style={{ color: "var(--stone)" }}>—</span>{" "}
        <span style={{ color: "var(--ink)" }}>{data.tagline}</span>
      </p>
    </>
  )
}
```

- [ ] **Step 2: Verify**

```bash
pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add src/components/home/hero.tsx
git commit -m "style: Hero — weight 400, -1.2px tracking, DESIGN.md tokens"
```

---

## Task 5: Update AboutSection, LabSection, HomeFooter

**Files:**
- Modify: `src/components/home/about-section.tsx`
- Modify: `src/components/home/lab-section.tsx`
- Modify: `src/components/home/home-footer.tsx`

- [ ] **Step 1: Replace `src/components/home/about-section.tsx`**

```tsx
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { SectionLabel } from "@/components/ui/section-label"
import { MetaItem } from "@/components/ui/meta-item"
import type { StrapiLandingPage } from "@/lib/strapi/types"

export function AboutSection({ data }: { data: StrapiLandingPage }) {
  return (
    <>
      <SectionLabel number="01" label={data.sections.about} />

      <div style={{ maxWidth: "580px" }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  color: "var(--graphite)",
                  margin: "0 0 1.25rem 0",
                  letterSpacing: "-0.005em",
                }}
              >
                {children}
              </p>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                style={{ color: "var(--ink)", textDecoration: "underline" }}
              >
                {children}
              </a>
            ),
          }}
        >
          {data.about}
        </ReactMarkdown>
      </div>

      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <MetaItem label={data.currentlyLabel} value={data.currentlyValue} />
        <MetaItem label={data.stackLabel} value={data.stackValue} />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Replace `src/components/home/lab-section.tsx`**

```tsx
import { Sparkles } from "lucide-react"
import { SectionLabel } from "@/components/ui/section-label"
import type { StrapiLandingPage } from "@/lib/strapi/types"

export function LabSection({ data }: { data: StrapiLandingPage }) {
  return (
    <>
      <SectionLabel number="03" label={data.sections.lab} icon={Sparkles} />

      <p
        style={{
          fontSize: "14px",
          color: "var(--graphite)",
          margin: "0 0 1rem 0",
          lineHeight: 1.6,
          maxWidth: "560px",
        }}
      >
        {data.labCaption}
      </p>
    </>
  )
}
```

- [ ] **Step 3: Replace `src/components/home/home-footer.tsx`**

The footer bleeds to full container width via negative horizontal margins matching the container's `1.5rem` side padding.

```tsx
import type { StrapiLandingPage } from "@/lib/strapi/types"

export function HomeFooter({ data }: { data: StrapiLandingPage }) {
  return (
    <footer
      style={{
        marginTop: "3rem",
        marginLeft: "-1.5rem",
        marginRight: "-1.5rem",
        padding: "1.5rem",
        background: "var(--footer-bg)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "11px",
        color: "var(--stone)",
        letterSpacing: "0.2px",
        textTransform: "uppercase",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      <span>{data.footer}</span>
      <span>{data.built}</span>
    </footer>
  )
}
```

- [ ] **Step 4: Verify**

```bash
pnpm lint
```

- [ ] **Step 5: Commit**

```bash
git add src/components/home/about-section.tsx src/components/home/lab-section.tsx src/components/home/home-footer.tsx
git commit -m "style: update AboutSection, LabSection, HomeFooter to DESIGN.md tokens"
```

---

## Task 6: Update SocialLinks

**Files:**
- Modify: `src/components/social-links.tsx`

- [ ] **Step 1: Replace `src/components/social-links.tsx`**

```tsx
import {
  Instagram,
  Linkedin,
  Github,
  Twitter,
  Mail,
  Rss,
  Link2,
  type LucideIcon,
} from "lucide-react"
import type { StrapiSocialLink, SocialIcon } from "@/lib/strapi/types"

const iconMap: Record<SocialIcon, LucideIcon> = {
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  email: Mail,
  rss: Rss,
}

function pickIcon(link: StrapiSocialLink): LucideIcon {
  if (link.icon && iconMap[link.icon]) return iconMap[link.icon]
  const byName = link.name.toLowerCase() as SocialIcon
  if (iconMap[byName]) return iconMap[byName]
  return Link2
}

export function SocialLinks({ links }: { links: StrapiSocialLink[] }) {
  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      {links.map((link) => {
        const Icon = pickIcon(link)
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className="social-link"
            style={{
              width: "44px",
              height: "44px",
              border: "1px solid var(--hairline)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--slate)",
              textDecoration: "none",
              transition: "all 0.15s ease",
              background: "var(--canvas)",
            }}
          >
            <Icon size={18} strokeWidth={1.75} />
          </a>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add src/components/social-links.tsx
git commit -m "style: update SocialLinks to DESIGN.md tokens"
```

---

## Task 7: Update JournalSection (home page rows)

**Files:**
- Modify: `src/components/journal-section.tsx`

Changes: add 56×38 thumbnail placeholder left of each row; remove reading-time badge; "view all" becomes ghost pill button.

- [ ] **Step 1: Replace `src/components/journal-section.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLang, type Lang } from "@/contexts/lang-context"
import { strapiMediaUrl } from "@/lib/strapi"
import {
  formatDateShort,
  formatEntryNumber,
  calculateReadingTime,
} from "@/lib/article-utils"
import type { StrapiArticle, StrapiEmptyState } from "@/lib/strapi/types"

interface Props {
  emptyState: Record<Lang, StrapiEmptyState>
  viewAllLabel: Record<Lang, string>
}

export function JournalSection({ emptyState, viewAllLabel }: Props) {
  const { lang } = useLang()
  const [articles, setArticles] = useState<StrapiArticle[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetch(`/api/articles?locale=${lang}&limit=3`)
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setArticles(data.articles ?? [])
      })
      .catch(() => {
        if (mounted) setArticles([])
      })
    return () => {
      mounted = false
    }
  }, [lang])

  if (articles !== null && articles.length === 0) {
    return <EmptyState empty={emptyState[lang]} />
  }

  if (articles === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", marginBottom: "1.5rem" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 0",
              borderBottom: i < 2 ? "1px solid var(--hairline)" : "none",
              opacity: 0.4,
            }}
          >
            <div
              style={{
                width: "56px",
                height: "38px",
                background: "var(--hairline)",
                borderRadius: "6px",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: "9px",
                  background: "var(--hairline)",
                  borderRadius: "3px",
                  marginBottom: "6px",
                  width: "30%",
                }}
              />
              <div
                style={{
                  height: "13px",
                  background: "var(--hairline)",
                  borderRadius: "3px",
                  width: "75%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", marginBottom: "1.5rem" }}>
        {articles.map((article, i) => {
          const coverUrl = strapiMediaUrl(article.cover?.url)
          return (
            <Link
              key={article.id}
              href={`/jurnal/${article.slug}`}
              className="article-card-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 0",
                borderBottom:
                  i < articles.length - 1 ? "1px solid var(--hairline)" : "none",
                textDecoration: "none",
                color: "inherit",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <div
                style={{
                  width: "56px",
                  height: "38px",
                  borderRadius: "6px",
                  flexShrink: 0,
                  backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  background: coverUrl ? undefined : "var(--surface-cool)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "9px",
                    color: "var(--slate)",
                    letterSpacing: "0.2px",
                    textTransform: "uppercase",
                    marginBottom: "3px",
                  }}
                >
                  {formatEntryNumber(article.entryNumber)} ·{" "}
                  {formatDateShort(article.publishedAt, article.locale)}
                </div>
                <div
                  className="article-card-title"
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "var(--ink)",
                    letterSpacing: "-0.3px",
                    lineHeight: 1.35,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {article.title}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <Link
        href="/jurnal"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 16px",
          border: "1px solid var(--ink)",
          borderRadius: "9999px",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--ink)",
          textDecoration: "none",
          transition: "opacity 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {viewAllLabel[lang]}
      </Link>
    </>
  )
}

function EmptyState({ empty }: { empty: StrapiEmptyState }) {
  return (
    <div
      style={{
        border: "1px solid var(--hairline)",
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ flex: 1, minWidth: "240px" }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 400,
            margin: "0 0 6px 0",
            color: "var(--ink)",
            letterSpacing: "-0.3px",
          }}
        >
          {empty.title}
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "var(--graphite)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {empty.desc}
        </p>
      </div>
      {empty.cta && empty.ctaHref && (
        <a
          href={empty.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            background: "var(--primary)",
            color: "var(--on-primary)",
            textDecoration: "none",
            borderRadius: "9999px",
            fontSize: "13px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            transition: "transform 0.15s ease",
          }}
        >
          {empty.cta}
        </a>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add src/components/journal-section.tsx
git commit -m "style: JournalSection — research-card rows, thumbnail, ghost pill CTA"
```

---

## Task 8: Rewrite shared ArticleCard to research-card row

**Files:**
- Modify: `src/components/article/article-card.tsx`

Full rewrite: vertical card → horizontal row (thumbnail left, text right). This is the shared component used in `RelatedArticles` and will be used in `jurnal/page.tsx` after Task 9.

- [ ] **Step 1: Replace `src/components/article/article-card.tsx`**

```tsx
import Link from "next/link"
import type { StrapiArticle } from "@/lib/strapi/types"
import {
  formatDateShort,
  formatEntryNumber,
  calculateReadingTime,
} from "@/lib/article-utils"
import { strapiMediaUrl } from "@/lib/strapi"
import { Tag } from "@/components/ui/tag"

export function ArticleCard({
  article,
}: {
  article: StrapiArticle
  index?: number
}) {
  const coverUrl = strapiMediaUrl(article.cover?.url)
  const readingTime = calculateReadingTime(article.body)

  return (
    <Link
      href={`/jurnal/${article.slug}`}
      className="article-card-row"
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        padding: "14px 0",
        textDecoration: "none",
        color: "inherit",
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: "80px",
          height: "54px",
          borderRadius: "6px",
          flexShrink: 0,
          backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          background: coverUrl ? undefined : "var(--surface-cool)",
        }}
      />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "9px",
            color: "var(--slate)",
            letterSpacing: "0.2px",
            textTransform: "uppercase",
            marginBottom: "4px",
            display: "flex",
            gap: "6px",
            alignItems: "center",
          }}
        >
          <span>{formatEntryNumber(article.entryNumber)}</span>
          <span>·</span>
          <span>{formatDateShort(article.publishedAt, article.locale)}</span>
          <span>·</span>
          <span>{readingTime.text}</span>
        </div>

        <h3
          className="article-card-title"
          style={{
            fontSize: "14px",
            fontWeight: 400,
            letterSpacing: "-0.4px",
            lineHeight: 1.3,
            margin: "0 0 4px 0",
            color: "var(--ink)",
          }}
        >
          {article.title}
        </h3>

        {article.excerpt && (
          <p
            style={{
              fontSize: "12px",
              lineHeight: 1.4,
              letterSpacing: "-0.16px",
              color: "var(--graphite)",
              margin: "0 0 6px 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.excerpt}
          </p>
        )}

        {article.tags && article.tags.length > 0 && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {article.tags.slice(0, 3).map((tag) => (
              <Tag key={tag.id}>{tag.name}</Tag>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Verify**

```bash
pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add src/components/article/article-card.tsx
git commit -m "style: ArticleCard — rewrite to research-card row layout"
```

---

## Task 9: Revamp JurnalListPage

**Files:**
- Modify: `src/app/jurnal/page.tsx`

Remove: local `ArticleCard`, `CoverIllustration`, grid layout, PALETTES.
Add: page eyebrow, hairline divider, flat list using shared `ArticleCard`, `LoadingList` skeleton.

- [ ] **Step 1: Replace `src/app/jurnal/page.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"
import { useLang } from "@/contexts/lang-context"
import { SiteHeader } from "@/components/layout/site-header"
import { ArticleCard } from "@/components/article/article-card"
import type { StrapiArticle } from "@/lib/strapi/types"

const copy = {
  en: {
    eyebrow: "Journal",
    title: "Notes from learning.",
    subtitle:
      "A running log of what I'm learning as a backend engineer exploring AI. Unpolished, honest, mine.",
    empty: "No entries yet. Check back soon.",
    count: (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`,
  },
  id: {
    eyebrow: "Jurnal",
    title: "Catatan dari proses belajar.",
    subtitle:
      "Log berjalan dari apa yang gw pelajarin sebagai backend engineer yang lagi eksplor AI. Mentah, jujur, milik gw.",
    empty: "Belum ada entry. Cek lagi nanti ya.",
    count: (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`,
  },
}

export default function JurnalListPage() {
  const { lang } = useLang()
  const t = copy[lang]
  const [articles, setArticles] = useState<StrapiArticle[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetch(`/api/articles?locale=${lang}`)
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setArticles(data.articles ?? [])
      })
      .catch(() => {
        if (mounted) setArticles([])
      })
    return () => { mounted = false }
  }, [lang])

  return (
    <main style={{ minHeight: "100dvh", position: "relative" }}>
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

        {articles !== null && articles.length > 0 && (
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
            {t.count(articles.length)}
          </div>
        )}

        <div style={{ height: "1px", background: "var(--hairline)", marginBottom: "0" }} />

        {articles === null ? (
          <LoadingList />
        ) : articles.length === 0 ? (
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
            {articles.map((article, i) => (
              <div
                key={article.id}
                style={{
                  borderBottom:
                    i < articles.length - 1 ? "1px solid var(--hairline)" : "none",
                }}
              >
                <ArticleCard article={article} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function LoadingList() {
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            padding: "14px 0",
            borderBottom: i < 2 ? "1px solid var(--hairline)" : "none",
            opacity: 0.4,
          }}
        >
          <div
            style={{
              width: "80px",
              height: "54px",
              background: "var(--hairline)",
              borderRadius: "6px",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: "9px",
                background: "var(--hairline)",
                borderRadius: "3px",
                marginBottom: "8px",
                width: "35%",
              }}
            />
            <div
              style={{
                height: "14px",
                background: "var(--hairline)",
                borderRadius: "3px",
                marginBottom: "6px",
                width: "80%",
              }}
            />
            <div
              style={{
                height: "12px",
                background: "var(--hairline)",
                borderRadius: "3px",
                width: "60%",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add src/app/jurnal/page.tsx
git commit -m "style: JurnalListPage — research-card rows, remove grid/illustrations, DESIGN.md tokens"
```

---

## Task 10: Update ArticleHeader

**Files:**
- Modify: `src/components/article/article-header.tsx`

Changes: meta strip micro-caps; h1 weight 400, `-1.2px` tracking; excerpt in `--graphite`; cover image flat (no border); tags use updated Tag.

- [ ] **Step 1: Replace `src/components/article/article-header.tsx`**

```tsx
import type { StrapiArticle } from "@/lib/strapi/types"
import { formatDate, formatEntryNumber } from "@/lib/article-utils"
import { strapiMediaUrl } from "@/lib/strapi"
import { Tag } from "@/components/ui/tag"

export function ArticleHeader({
  article,
  readingTime,
}: {
  article: StrapiArticle
  readingTime: string
}) {
  const coverUrl = strapiMediaUrl(article.cover?.url)

  return (
    <header style={{ marginBottom: "3rem" }}>
      {/* Meta strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "10px",
          color: "var(--slate)",
          letterSpacing: "0.2px",
          textTransform: "uppercase",
        }}
      >
        <span>{formatEntryNumber(article.entryNumber)}</span>
        <span style={{ color: "var(--hairline-soft)" }}>/</span>
        <span>{formatDate(article.publishedAt, article.locale)}</span>
        <span style={{ color: "var(--hairline-soft)" }}>/</span>
        <span>{readingTime}</span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 2.75rem)",
          fontWeight: 400,
          letterSpacing: "-1.2px",
          lineHeight: 1.05,
          margin: "0 0 1rem 0",
          color: "var(--ink)",
        }}
      >
        {article.title}
      </h1>

      {/* Excerpt */}
      <p
        style={{
          fontSize: "1.125rem",
          lineHeight: 1.5,
          color: "var(--graphite)",
          margin: "0 0 2rem 0",
        }}
      >
        {article.excerpt}
      </p>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          {article.tags.map((tag) => (
            <Tag key={tag.id}>{tag.name}</Tag>
          ))}
        </div>
      )}

      {/* Cover image */}
      {coverUrl && (
        <figure style={{ margin: "0 0 2.5rem 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={article.cover?.alternativeText || article.title}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
              display: "block",
            }}
          />
        </figure>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Verify**

```bash
pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add src/components/article/article-header.tsx
git commit -m "style: ArticleHeader — weight 400, micro-caps meta, DESIGN.md tokens"
```

---

## Task 11: Page-level spacing cleanup + remove grid-overlay

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/jurnal/[slug]/article-view.tsx`

`SiteHeader` now manages its own bottom margin, so callers remove their manual spacing overrides. `grid-overlay` divs are removed from pages (the class stays in globals.css for now but is unused).

- [ ] **Step 1: Update `src/app/page.tsx`**

Remove `<div className="grid-overlay" />` and update the `SiteHeader` prop (renamed from `paddingBottom` to `marginBottom`).

In `src/app/page.tsx`, find and remove:
```tsx
<div className="grid-overlay" />
```

And change:
```tsx
<SiteHeader paddingBottom="4rem" />
```
to:
```tsx
<SiteHeader marginBottom="4rem" />
```

- [ ] **Step 2: Update `src/app/jurnal/[slug]/article-view.tsx`**

Remove `<div className="grid-overlay" />` from the article view. Find:
```tsx
<div className="grid-overlay" />
```
and delete that line.

Also update the ShareButtons separator border to use new var:
```tsx
borderTop: "1px solid var(--hairline)",
```
(was `var(--border)` — now resolved via alias but update for consistency).

- [ ] **Step 3: Verify build**

```bash
pnpm lint && pnpm build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/jurnal/[slug]/article-view.tsx
git commit -m "style: remove grid-overlay from pages, fix SiteHeader prop, update ShareButtons border"
```

---

## Task 12: Final visual verification

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Check homepage at http://localhost:3000**

Verify:
- Header has hairline bottom border
- Hero h1 is weight 400 with tight tracking (not bold)
- About section body text is graphite (not black)
- MetaItem cards are flat (no shadow, square corners)
- Journal rows show thumbnail + title, no reading-time badges
- "View all" is a ghost pill button
- Footer is dark (`#030303` / `#0f0f0f` dark)

- [ ] **Step 3: Check journal list at http://localhost:3000/jurnal**

Verify:
- No grid, no coloured illustrations
- Flat hairline-separated rows with thumbnail + meta + title + excerpt
- Tags are micro-caps pills in slate

- [ ] **Step 4: Check article view at http://localhost:3000/jurnal/[any-slug]**

Verify:
- Article h1 is weight 400
- Meta strip (entry/date/reading time) is micro-caps in slate
- Excerpt in graphite
- Tags are micro-caps pills

- [ ] **Step 5: Toggle dark mode**

Verify dark mode: canvas `#0a0a0a`, ink `#ededed`, hairline dividers `#1f1f1f`, footer `#0f0f0f`. Pill CTAs invert (white pill, dark text).

- [ ] **Step 6: Final build check**

```bash
pnpm build
```

Expected: build succeeds with no errors.
