import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test"

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  ;(page as typeof page & { __errors?: string[] }).__errors = errors
})

function recordedErrors(page: Page) {
  return (page as typeof page & { __errors?: string[] }).__errors ?? []
}

test.afterEach(async ({ page }) => {
  expect(recordedErrors(page)).toEqual([])
})

async function expectPermanentRedirect(
  request: APIRequestContext,
  path: string,
  destination: string,
) {
  const response = await request.get(path, { maxRedirects: 0 })
  expect(response.status()).toBe(308)
  const location = new URL(response.headers().location)
  expect(`${location.pathname}${location.search}`).toBe(destination)
}

async function expectLocalizedMetadataTargets(page: Page) {
  const hrefs = await page
    .locator('link[rel="canonical"], link[rel="alternate"][hreflang]')
    .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href))

  expect(hrefs.length).toBeGreaterThan(0)
  for (const href of hrefs) {
    expect(new URL(href).pathname).toMatch(/^\/(en|id)(\/|$)/)
  }
}

async function expectOpenGraphLocales(
  page: Page,
  locale: "en" | "id",
  hasTranslation: boolean,
) {
  const current = locale === "en" ? "en_US" : "id_ID"
  const alternate = locale === "en" ? "id_ID" : "en_US"

  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    current,
  )
  const alternateMeta = page.locator('meta[property="og:locale:alternate"]')
  if (hasTranslation) {
    await expect(alternateMeta).toHaveCount(1)
    await expect(alternateMeta).toHaveAttribute("content", alternate)
  } else {
    await expect(alternateMeta).toHaveCount(0)
  }
}

test("legacy root redirect is a deterministic permanent redirect", async ({
  request,
}) => {
  await expectPermanentRedirect(request, "/", "/en")
})

test("legacy journal listing redirect preserves its query string", async ({
  request,
}) => {
  await expectPermanentRedirect(
    request,
    "/jurnal?utm_source=old",
    "/en/jurnal?utm_source=old",
  )
})

test("legacy portfolio listing redirect is deterministic", async ({
  request,
}) => {
  await expectPermanentRedirect(request, "/portfolio", "/en/portfolio")
})

test("legacy article redirects resolve locale, preserve query, and encode once", async ({
  request,
}) => {
  await expectPermanentRedirect(
    request,
    "/jurnal/my-first-llm-call?ref=old",
    "/en/jurnal/my-first-llm-call?ref=old",
  )
  await expectPermanentRedirect(
    request,
    "/jurnal/pertama-kali-manggil-llm",
    "/id/jurnal/pertama-kali-manggil-llm",
  )
  await expectPermanentRedirect(
    request,
    "/jurnal/my%2Dfirst%2Dllm%2Dcall",
    "/en/jurnal/my-first-llm-call",
  )

  const missing = await request.get("/jurnal/unknown-legacy-article", {
    maxRedirects: 0,
  })
  expect(missing.status()).toBe(404)
})

test("legacy project redirects resolve both locales and preserve queries", async ({
  request,
}) => {
  await expectPermanentRedirect(
    request,
    "/portfolio/jurnal-summarizer?campaign=old",
    "/en/portfolio/jurnal-summarizer?campaign=old",
  )
  await expectPermanentRedirect(
    request,
    "/portfolio/perangkum-jurnal",
    "/id/portfolio/perangkum-jurnal",
  )
})

for (const locale of ["en", "id"] as const) {
  test(`localized route tree /${locale} emits the route language in raw HTML`, async ({
    request,
  }) => {
    const response = await request.get(`/${locale}`)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(`<html lang="${locale}"`)
  })

  test(`localized metadata /${locale} has self canonical and both home alternates`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`)

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://jurnal.dev/${locale}`,
    )
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", "https://jurnal.dev/en")
    await expect(
      page.locator('link[rel="alternate"][hreflang="id"]'),
    ).toHaveAttribute("href", "https://jurnal.dev/id")
    await expectOpenGraphLocales(page, locale, true)
    await expectLocalizedMetadataTargets(page)
  })
}

for (const path of ["/fr", "/fr/jurnal"]) {
  test(`localized route tree ${path} rejects an unsupported locale`, async ({
    request,
  }) => {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
  })
}

for (const listing of [
  {
    locale: "en",
    section: "jurnal",
    heading: "Notes from learning.",
    alternateSection: "jurnal",
  },
  {
    locale: "id",
    section: "jurnal",
    heading: "Catatan dari proses belajar.",
    alternateSection: "jurnal",
  },
  {
    locale: "en",
    section: "portfolio",
    heading: "Selected work.",
    alternateSection: "portfolio",
  },
  {
    locale: "id",
    section: "portfolio",
    heading: "Karya pilihan.",
    alternateSection: "portfolio",
  },
] as const) {
  test(`localized route tree /${listing.locale}/${listing.section} renders its locale listing`, async ({
    page,
  }) => {
    const path = `/${listing.locale}/${listing.section}`
    const response = await page.goto(path)

    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", { level: 1, name: listing.heading }),
    ).toBeVisible()
    await expect(page.locator(`a[href^="${path}/"]`).first()).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://jurnal.dev${path}`,
    )
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute(
      "href",
      `https://jurnal.dev/en/${listing.alternateSection}`,
    )
    await expect(
      page.locator('link[rel="alternate"][hreflang="id"]'),
    ).toHaveAttribute(
      "href",
      `https://jurnal.dev/id/${listing.alternateSection}`,
    )
    await expectOpenGraphLocales(page, listing.locale, true)
    await expectLocalizedMetadataTargets(page)
  })
}

for (const article of [
  {
    locale: "en",
    slug: "my-first-llm-call",
    title: "My first LLM call, from scratch",
    alternateHref: "/id/jurnal/pertama-kali-manggil-llm",
    alternateName: "Switch to Bahasa Indonesia",
  },
  {
    locale: "id",
    slug: "pertama-kali-manggil-llm",
    title: "Pertama kali manggil LLM dari code",
    alternateHref: "/en/jurnal/my-first-llm-call",
    alternateName: "Switch to English",
  },
] as const) {
  test(`localized route tree /${article.locale}/jurnal/${article.slug} renders one localized article`, async ({
    page,
  }) => {
    const path = `/${article.locale}/jurnal/${article.slug}`
    const response = await page.goto(path)

    expect(response?.status()).toBe(200)
    await expect(page.locator("html")).toHaveAttribute("lang", article.locale)
    await expect(
      page.getByRole("heading", { level: 1, name: article.title }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: article.alternateName }),
    ).toHaveAttribute("href", article.alternateHref)
    await expect(
      page.locator(`article a[href^="/${article.locale}/jurnal/"]`).first(),
    ).toBeVisible()

    const shareHref = await page
      .getByLabel("Share on Twitter/X")
      .getAttribute("href")
    expect(decodeURIComponent(shareHref!)).toContain(path)

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://jurnal.dev${path}`,
    )
    await expect(
      page.locator(`link[rel="alternate"][hreflang="${article.locale}"]`),
    ).toHaveAttribute("href", `https://jurnal.dev${path}`)
    const alternateLocale = article.locale === "en" ? "id" : "en"
    await expect(
      page.locator(`link[rel="alternate"][hreflang="${alternateLocale}"]`),
    ).toHaveAttribute("href", `https://jurnal.dev${article.alternateHref}`)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `https://jurnal.dev${path}`,
    )
    await expectOpenGraphLocales(page, article.locale, true)
    await expectLocalizedMetadataTargets(page)
  })
}

for (const project of [
  {
    locale: "en",
    slug: "jurnal-summarizer",
    alternateHref: "/id/portfolio/perangkum-jurnal",
    alternateName: "Switch to Bahasa Indonesia",
    back: "← All projects",
  },
  {
    locale: "id",
    slug: "perangkum-jurnal",
    alternateHref: "/en/portfolio/jurnal-summarizer",
    alternateName: "Switch to English",
    back: "← Semua project",
  },
] as const) {
  test(`localized route tree /${project.locale}/portfolio/${project.slug} renders one localized project`, async ({
    page,
  }) => {
    const path = `/${project.locale}/portfolio/${project.slug}`
    const response = await page.goto(path)

    expect(response?.status()).toBe(200)
    await expect(page.locator("html")).toHaveAttribute("lang", project.locale)
    await expect(
      page.getByRole("heading", { level: 1, name: "Jurnal Summarizer" }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: project.alternateName }),
    ).toHaveAttribute("href", project.alternateHref)
    await expect(
      page.getByRole("link", { name: project.back }),
    ).toHaveAttribute("href", `/${project.locale}/portfolio`)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://jurnal.dev${path}`,
    )
    await expect(
      page.locator(`link[rel="alternate"][hreflang="${project.locale}"]`),
    ).toHaveAttribute("href", `https://jurnal.dev${path}`)
    const alternateLocale = project.locale === "en" ? "id" : "en"
    await expect(
      page.locator(`link[rel="alternate"][hreflang="${alternateLocale}"]`),
    ).toHaveAttribute("href", `https://jurnal.dev${project.alternateHref}`)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `https://jurnal.dev${path}`,
    )
    await expectOpenGraphLocales(page, project.locale, true)
    await expectLocalizedMetadataTargets(page)
  })
}

test("localized route tree disables a missing article translation", async ({
  page,
}) => {
  const response = await page.goto("/id/jurnal/agent-pertama-gw")

  expect(response?.status()).toBe(200)
  const unavailable = page.getByLabel("English: Translation unavailable")
  await expect(unavailable).toHaveAttribute("aria-disabled", "true")
  await expect(unavailable).not.toHaveAttribute("href")
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://jurnal.dev/id/jurnal/agent-pertama-gw",
  )
  await expect(
    page.locator('link[rel="alternate"][hreflang="id"]'),
  ).toHaveAttribute("href", "https://jurnal.dev/id/jurnal/agent-pertama-gw")
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveCount(0)
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://jurnal.dev/id/jurnal/agent-pertama-gw",
  )
  await expectOpenGraphLocales(page, "id", false)
  await expectLocalizedMetadataTargets(page)
})

test("localized route tree theme and language controls navigate and update content", async ({
  page,
}) => {
  await page.goto("/en")
  await page.getByLabel("Switch to Bahasa Indonesia").click()
  await expect(page).toHaveURL(/\/id$/)
  await expect(page.locator("html")).toHaveAttribute("lang", "id")
  await expect(
    page.getByText("belajar AI, out loud.", { exact: true }),
  ).toBeVisible()
  await page.getByLabel("Dark theme").click()
  await expect(page.locator("html")).toHaveClass(/dark/)
})

test("localized route tree article TOC points to unique rendered headings", async ({
  page,
}) => {
  await page.goto("/en/jurnal/my-first-llm-call")
  const ids = await page
    .locator("article h2[id], article h3[id]")
    .evaluateAll((headings) => headings.map((heading) => heading.id))
  expect(ids.length).toBeGreaterThan(0)
  expect(new Set(ids).size).toBe(ids.length)
  const anchors = page.locator('nav[aria-label="Table of contents"] a')
  for (let index = 0; index < (await anchors.count()); index += 1) {
    const href = await anchors.nth(index).getAttribute("href")
    expect(href).toMatch(/^#article-en-/)
    await expect(page.locator(href!)).toHaveCount(1)
  }
})

test("localized route tree Indonesian share links preserve the localized slug", async ({
  page,
}) => {
  await page.goto("/id/jurnal/pertama-kali-manggil-llm")
  const href = await page.getByLabel("Share on Twitter/X").getAttribute("href")
  expect(decodeURIComponent(href!)).toContain(
    "/id/jurnal/pertama-kali-manggil-llm",
  )
})

for (const journal of [
  {
    locale: "en",
    error: "Articles are temporarily unavailable. Try again.",
    retry: "Try again",
  },
  {
    locale: "id",
    error: "Artikel sementara tidak tersedia. Coba lagi.",
    retry: "Coba lagi",
  },
] as const) {
  test(`localized route tree /${journal.locale}/jurnal sends its locale query and retries after a 503`, async ({
    page,
  }) => {
    const requestedLocales: Array<string | null> = []
    await page.route("**/api/articles?*", (route) => {
      requestedLocales.push(
        new URL(route.request().url()).searchParams.get("locale"),
      )
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: "{}",
      })
    })

    await page.goto(`/${journal.locale}/jurnal`)
    await expect(page.getByText(journal.error)).toBeVisible()
    expect(requestedLocales).toEqual([journal.locale])

    await page.unroute("**/api/articles?*")
    await page.getByRole("button", { name: journal.retry }).click()
    await expect(
      page.locator(`a[href^="/${journal.locale}/jurnal/"]`).first(),
    ).toBeVisible()

    const errors = recordedErrors(page)
    expect(errors).toEqual([
      "Failed to load resource: the server responded with a status of 503 (Service Unavailable)",
    ])
    errors.splice(0)
  })
}

for (const path of [
  "/en/jurnal/unknown-localized-article",
  "/id/portfolio/unknown-localized-project",
]) {
  test(`localized route tree ${path} returns the custom 404`, async ({
    page,
  }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole("heading", { name: "Page not found." }),
    ).toBeVisible()

    const errors = recordedErrors(page)
    expect(errors).toEqual([
      "Failed to load resource: the server responded with a status of 404 (Not Found)",
    ])
    errors.splice(0)
  })
}

test("production responses include the security policy", async ({ page }) => {
  const response = await page.goto("/en")
  const headers = response!.headers()
  expect(headers["content-security-policy"]).toContain(
    "script-src 'self' 'unsafe-inline' https://giscus.app",
  )
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'")
  expect(headers["x-frame-options"]).toBe("DENY")
  expect(headers["x-content-type-options"]).toBe("nosniff")
})
