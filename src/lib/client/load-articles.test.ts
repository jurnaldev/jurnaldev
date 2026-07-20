import { describe, expect, it, vi } from "vitest"
import { ArticlesLoadError, loadArticles } from "./load-articles"

describe("loadArticles", () => {
  it("returns article summaries", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ articles: [{ id: 1, slug: "one" }] })),
        ),
    )
    await expect(
      loadArticles("/api/articles", new AbortController().signal),
    ).resolves.toEqual([{ id: 1, slug: "one" }])
  })

  it("throws a stable error for non-success responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    )
    await expect(
      loadArticles("/api/articles", new AbortController().signal),
    ).rejects.toBeInstanceOf(ArticlesLoadError)
  })

  it("propagates abort errors", async () => {
    const controller = new AbortController()
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            )
          }),
      ),
    )
    const pending = loadArticles("/api/articles", controller.signal)
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: "AbortError" })
  })
})
