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

test("article TOC points to unique rendered headings", async ({ page }) => {
  await page.goto("/jurnal/my-first-llm-call")
  const ids = await page.locator("article h2[id], article h3[id]").evaluateAll(
    (headings) => headings.map((heading) => heading.id),
  )
  expect(ids.length).toBeGreaterThan(0)
  expect(new Set(ids).size).toBe(ids.length)
  const anchors = page.locator('nav[aria-label="Table of contents"] a')
  for (let index = 0; index < (await anchors.count()); index += 1) {
    const href = await anchors.nth(index).getAttribute("href")
    expect(href).toMatch(/^#article-en-/)
    await expect(page.locator(href!)).toHaveCount(1)
  }
})

test("Indonesian share links preserve the Indonesian slug", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("jurnal-dev-lang", "id"),
  )
  await page.goto("/jurnal/pertama-kali-manggil-llm")
  const href = await page
    .getByLabel("Share on Twitter/X")
    .getAttribute("href")
  expect(decodeURIComponent(href!)).toContain(
    "/jurnal/pertama-kali-manggil-llm",
  )
})

test("journal leaves loading state and can retry after a 503", async ({ page }) => {
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
  await expect(page.getByRole("heading", { name: "Page not found." })).toBeVisible()
  recordedErrors(page).length = 0
})

test("production responses include the security policy", async ({ page }) => {
  const response = await page.goto("/")
  const headers = response!.headers()
  expect(headers["content-security-policy"]).toContain(
    "script-src 'self' 'unsafe-inline' https://giscus.app",
  )
  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  )
  expect(headers["x-frame-options"]).toBe("DENY")
  expect(headers["x-content-type-options"]).toBe("nosniff")
})
