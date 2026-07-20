# Localized URL Migration Design

**Date:** 2026-07-20
**Status:** Approved
**Scope:** Migrate public pages from unprefixed URLs to locale-prefixed
`/en` and `/id` URLs while preserving deterministic permanent redirects.

## Context

The application currently stores the active language in client state and
renders both English and Indonesian content under one unprefixed URL. Article
and project detail pages fetch both locales, `LocaleGate` hides the inactive
copy, and the language toggle changes state without changing the URL.

This makes the visible language ambiguous to crawlers, prevents a stable
canonical URL per translation, leaves `<html lang>` disconnected from the
route, and requires unnecessary data and markup on every bilingual page.

The production-hardening pass is complete on
`codex/production-hardening`. This migration must preserve its explicit Strapi
failure behavior, API validation, security headers, tests, and standalone
deployment.

## Goals

- Serve every public page from a URL prefixed with `/en` or `/id`.
- Make the URL the source of truth for the active language.
- Render and fetch only the requested locale.
- Produce correct server-rendered document language and locale-aware metadata.
- Preserve legacy inbound links with deterministic permanent redirects.
- Keep API paths, Strapi schemas, and deployment behavior unchanged.

## Non-goals

- Browser-language, cookie, geolocation, or `Accept-Language` redirects.
- Adding locales beyond English and Indonesian.
- Changing Strapi content types or localization relationships.
- Translating UI copy that is currently missing.
- Redesigning pages or changing visual styling.
- Changing `/api/articles` to a locale-prefixed endpoint.

## Chosen Approach

Move public UI routes beneath `app/[locale]` and make the locale segment an
explicit server input. This follows the App Router's dynamic-segment model and
allows the locale layout to emit `<html lang={locale}>` in the initial HTML.

Alternative approaches were rejected:

- Middleware rewrites retain less file movement but make metadata, debugging,
  and route ownership implicit.
- Separate `app/en` and `app/id` trees duplicate page logic and are likely to
  drift.

## Route Architecture

The public route map becomes:

```text
/[locale]
/[locale]/jurnal
/[locale]/jurnal/[slug]
/[locale]/portfolio
/[locale]/portfolio/[slug]
```

Only `en` and `id` are valid locale values. Invalid values such as `/fr` or
`/fr/jurnal` return `404`.

The existing `src/app/layout.tsx` is moved to
`src/app/[locale]/layout.tsx`; this is a root layout, not a nested layout. It
continues importing global CSS and owning `<html>`, `<body>`, fonts, theme
bootstrap, viewport, shared providers, global metadata, and the `lang`
attribute. `error.tsx`, `loading.tsx`, and `not-found.tsx` move beneath the
locale segment. A root-layout failure UI, if retained, must be a
`global-error.tsx` that emits its own document shell.

Legacy page files are replaced with route handlers, which can return redirects
without a page layout. Public pages live beneath the locale root layout.
Non-page endpoints remain outside the segment:

```text
/api/articles
/robots.txt
/sitemap.xml
/icon.svg
```

Route construction and validation are centralized in a locale-routing module.
Components must not assemble locale paths ad hoc.

## Legacy URL Compatibility

All supported legacy public URLs issue permanent `308` redirects.

Static routes redirect to English deterministically:

| Legacy URL | Destination |
| --- | --- |
| `/` | `/en` |
| `/jurnal` | `/en/jurnal` |
| `/portfolio` | `/en/portfolio` |

Legacy detail routes resolve the slug against both locales:

1. If the slug exists only in English, redirect to its `/en` detail URL.
2. If the slug exists only in Indonesian, redirect to its `/id` detail URL.
3. If the same slug exists in both locales, prefer English.
4. If neither locale contains the slug, return `404`.
5. If Strapi fails, propagate the operational failure instead of converting it
   to `404` or silently falling back unless mock fallback was explicitly
   enabled.

The redirect resolver is shared by article and project legacy handlers so the
precedence and error behavior remain consistent.

Legacy handlers preserve the original query string. Fragments are not sent to
the server and remain a browser concern. Canonical URLs use no trailing slash;
the application keeps Next.js's default trailing-slash normalization. Route
helpers accept decoded slug values and percent-encode each path segment exactly
once.

## Language State and Navigation

`params.locale` is the source of truth. The locale layout validates it and
passes it into `LangProvider` as `initialLang`.

The provider exposes the validated route locale as read-only state. It may
persist the current locale to localStorage after navigation, but storage never
overrides a locale present in the URL and never changes visible content without
navigation. Browser locale detection and the imperative `setLang` API are
removed.

The language toggle becomes navigation:

- General pages link to the equivalent path in the other locale.
- Detail pages use the translated entity's localized slug.
- When a detail translation does not exist, the target locale control is
  disabled and exposes an accessible “Translation unavailable” label.
- The toggle must not send users to a listing page or synthesize a slug.

After all consumers are migrated, `LocaleGate` and dual-locale rendering are
removed.

## Data Fetching

Each page fetches only the requested locale:

- Home fetches its landing content, featured articles, and projects for
  `params.locale`.
- Journal and portfolio listings request only `params.locale`.
- Article and project details request their slug only in `params.locale`.
- Detail fetches retain localization metadata only when needed to build the
  language-switch destination and alternate metadata.

The `/api/articles` contract remains unchanged and continues accepting its
validated `locale` query parameter. Client fetches derive that query from the
route locale rather than mutable context state.

## SEO and Metadata

Every localized page has a self-referencing canonical URL. General pages list
both English and Indonesian alternate URLs. Detail pages list only translations
that actually exist.

Metadata requirements:

- `alternates.canonical` matches the requested locale URL.
- `alternates.languages.en` and `.id` point to the corresponding localized
  pages when available.
- Open Graph locale uses `en_US` or `id_ID` and lists the available alternate
  locale.
- Share buttons use the current localized detail URL.
- Giscus preserves `mapping="specific"` with the localized entry's stable slug
  as its discussion term.
- Legacy URLs never appear as canonical or alternate targets.

The sitemap contains only locale-prefixed URLs. General routes appear once per
locale, and article/project entries use their actual locale and slug.
Translations are grouped as language alternates. To support this, article and
project enumeration returns a `LocalizedSlugRecord` containing `documentId`,
`locale`, `slug`, and the available `localizations` (`locale` and `slug`). The
Strapi query explicitly requests `documentId`, `slug`, and localization data;
the mock adapter returns the same contract. The sitemap builder consumes these
records rather than attempting to infer pairs from slug text. Robots continues
pointing to the single sitemap endpoint.

Giscus keeps its current `mapping="specific"` and `term={slug}` identity. The
migration changes the page URL but does not rename or merge discussion terms,
avoiding deliberate orphaning of existing threads. Translations with different
slugs continue to have distinct discussions, matching their existing terms.

## Error Handling

- Invalid locale: `404`.
- Valid locale with unknown slug: `404`.
- Known content without a translation: requested locale detail is `404`; the
  source locale page keeps its unavailable toggle state.
- Strapi outage: existing error boundary or `503` behavior remains intact.
- Legacy detail lookup outage: no false `404`; the error propagates.
- Redirect targets are built from validated locales and encoded slugs only.

## File Boundaries

The implementation should establish these responsibilities:

- `src/lib/i18n/routing.ts`: locale constants, validation, path builders, and
  path locale replacement.
- `src/lib/i18n/metadata.ts`: canonical and language-alternate construction.
- `src/lib/i18n/legacy-redirect.ts`: locale resolution for old detail slugs.
- `src/lib/i18n/types.ts`: the shared `LocalizedSlugRecord` enumeration
  contract when it does not belong cleanly in existing Strapi types.
- `src/app/[locale]/...`: localized layouts and pages.
- Legacy route handlers: thin adapters that call redirect helpers.
- `LangProvider` and `LangToggle`: URL-derived state and navigation UI only.

Existing Strapi functions remain the content boundary. Refactor only the
minimum signatures required to avoid dual-locale page fetches.

## Testing Strategy

Use test-driven changes with focused unit tests before route movement.

### Unit and Integration Coverage

- Accept `en` and `id`; reject all other locale segments.
- Build localized home, listing, and detail paths.
- Replace only the leading locale segment.
- Build canonical and alternate metadata with missing translations.
- Resolve legacy slugs to English, Indonesian, English on collision, or not
  found.
- Propagate CMS failures from the legacy resolver.
- Generate sitemap entries containing only localized URLs.
- Group sitemap language alternates from `documentId` and `localizations`.

### Browser Acceptance Coverage

- `/` redirects permanently to `/en`.
- `/jurnal` redirects permanently to `/en/jurnal`.
- A legacy Indonesian article slug redirects to `/id/jurnal/[slug]`.
- Legacy redirects preserve query strings.
- English and Indonesian home, listing, article, and portfolio routes render.
- Initial HTML has the correct `<html lang>` value.
- The language toggle changes both URL and visible content.
- A missing detail translation disables the unavailable locale control.
- Canonical and alternate link tags match available translations.
- Invalid locale and unknown slug return `404`.
- Share URLs include the active locale.
- Browser console and hydration remain error-free.

### Full Verification

The migration is complete only when these commands pass:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Rollout and Compatibility

The localized routes and legacy redirects ship together. There is no period in
which both localized and unprefixed pages return `200`, preventing duplicate
content. Existing external links remain valid through `308` redirects.

Before merge, verify redirects and canonical tags against the standalone
production server. No Strapi migration or environment change is required.

## Acceptance Criteria

- Every public `200` page URL begins with `/en` or `/id`.
- URL locale, rendered language, data locale, `<html lang>`, canonical, and
  share URL agree.
- General language switching preserves the page kind.
- Detail language switching uses the translated slug or is disabled.
- All supported legacy routes return deterministic `308` redirects.
- Invalid routes and missing localized content return truthful `404` responses.
- Sitemap and metadata expose no unprefixed content URLs.
- Existing production-hardening verification remains green.
