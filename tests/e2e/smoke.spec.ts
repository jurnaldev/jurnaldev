import { expect, test, type Page } from "@playwright/test"

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

for (const locale of ["en", "id"] as const) {
  test(`localized route tree /${locale} emits the route language in raw HTML`, async ({
    request,
  }) => {
    const response = await request.get(`/${locale}`)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(`<html lang="${locale}"`)
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
    await expect(page.locator(`article a[href^="/${article.locale}/jurnal/"]`).first()).toBeVisible()

    const shareHref = await page
      .getByLabel("Share on Twitter/X")
      .getAttribute("href")
    expect(decodeURIComponent(shareHref!)).toContain(path)
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
    const response = await page.goto(
      `/${project.locale}/portfolio/${project.slug}`,
    )

    expect(response?.status()).toBe(200)
    await expect(page.locator("html")).toHaveAttribute("lang", project.locale)
    await expect(
      page.getByRole("heading", { level: 1, name: "Jurnal Summarizer" }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: project.alternateName }),
    ).toHaveAttribute("href", project.alternateHref)
    await expect(page.getByRole("link", { name: project.back })).toHaveAttribute(
      "href",
      `/${project.locale}/portfolio`,
    )
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
})

for (const path of [
  "/",
  "/jurnal",
  "/jurnal/my-first-llm-call",
  "/portfolio",
  "/portfolio/jurnal-summarizer",
]) {
  test(`${path} renders successfully`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator("h1").first()).toBeVisible()
  })
}

test("theme and language controls update the document", async ({ page }) => {
  await page.goto("/")
  await page.getByLabel("Switch to Bahasa Indonesia").click()
  await expect(page.locator("html")).toHaveAttribute("lang", "id")
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

test("journal leaves loading state and can retry after a 503", async ({
  page,
}) => {
  await page.route("**/api/articles?*", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  )
  await page.goto("/jurnal")
  await expect(
    page.getByText("Articles are temporarily unavailable. Try again."),
  ).toBeVisible()
  await page.unroute("**/api/articles?*")
  await page.getByRole("button", { name: "Try again" }).click()
  await expect(page.locator('a[href^="/jurnal/"]').first()).toBeVisible()
  recordedErrors(page).length = 0
})

test("missing routes render the custom 404", async ({ page }) => {
  const response = await page.goto("/does-not-exist")
  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole("heading", { name: "Page not found." }),
  ).toBeVisible()
  recordedErrors(page).length = 0
})

test("production responses include the security policy", async ({ page }) => {
  const response = await page.goto("/")
  const headers = response!.headers()
  expect(headers["content-security-policy"]).toContain(
    "script-src 'self' 'unsafe-inline' https://giscus.app",
  )
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'")
  expect(headers["x-frame-options"]).toBe("DENY")
  expect(headers["x-content-type-options"]).toBe("nosniff")
})
