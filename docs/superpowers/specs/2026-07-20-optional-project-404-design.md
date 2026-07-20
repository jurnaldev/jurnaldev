# Optional Project Collection 404 Design

## Context

The localized frontend requests the Strapi `projects` collection for the home,
portfolio, detail, and sitemap flows. The collection has not yet been deployed
to production, so Strapi returns `404 Not Found`. Because normal configured-CMS
failures propagate, the missing optional collection currently turns localized
pages such as `/en` into HTTP 500 responses.

The locale query is valid and is not the source of the failure.

## Decision

Treat only a Strapi 404 for the `projects` resource as an unavailable optional
feature:

- project lists return an empty array;
- project detail reads return `null`;
- localized project slug enumeration returns an empty array;
- a server-side warning records that the project collection is unavailable.

Once the collection is deployed, the existing requests work without a frontend
configuration or code change.

When `NEXT_PUBLIC_STRAPI_URL` is unset, normal mock mode is unchanged and still
returns bundled project fixtures. When a CMS URL is configured, project 404
classification occurs inside the Strapi read branch before the generic
`STRAPI_MOCK_FALLBACK=true` behavior can substitute mock projects. Therefore a
missing production collection consistently produces `[]` or `null`, even when
generic fallback is enabled for other CMS failures.

## Boundaries

The generic Strapi client remains strict. Authentication failures, invalid
queries, timeouts, network failures, and server errors continue to propagate.
404 responses from articles, landing content, social links, or any future core
resource also continue to propagate.

The exception is implemented at the project facade boundary rather than in page
components. This gives home, portfolio, detail, legacy redirect, and sitemap
consumers one consistent contract without duplicating error handling.

`CLAUDE.md` and `DOCS.md` will document this narrow project-collection exception
so their configured-CMS failure policy remains accurate.

## Error Classification

`strapiFetch` will throw a typed error containing the HTTP status and request
URL. A small predicate identifies only status 404. Project facade functions
catch that error and return their appropriate empty value while logging a
concise warning. All other errors are rethrown unchanged.

## Verification

Unit tests cover:

- a project list 404 returning `[]`;
- a project detail 404 returning `null`;
- project slug enumeration 404 returning `[]`;
- non-404 project failures still propagating;
- a project 404 returning an empty value instead of mock data when explicit
  generic fallback is enabled;
- unrelated Strapi failures remaining strict.

Run focused tests, TypeScript validation, and lint after implementation.
