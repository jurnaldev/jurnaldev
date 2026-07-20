import { describe, expect, it, vi } from "vitest"
import { getArticles } from "./client"

describe("Strapi article summaries", () => {
  it("uses an eight-second timeout and excludes body from list fields", async () => {
    const signal = new AbortController().signal
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(signal)
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [], meta: { pagination: {} } })),
    )
    vi.stubGlobal("fetch", fetchMock)

    await getArticles("en")

    expect(timeout).toHaveBeenCalledWith(8_000)
    const [url, options] = fetchMock.mock.calls[0]
    expect(String(url)).toContain("fields%5B0%5D=documentId")
    expect(String(url)).not.toContain("body")
    expect(options.signal).toBe(signal)
  })
})
