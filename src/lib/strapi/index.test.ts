import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe("Strapi project source policy", () => {
  it("returns no projects on CMS 404 even when mock fallback is enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRAPI_URL", "https://cms.example.test")
    vi.stubEnv("STRAPI_MOCK_FALLBACK", "true")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, { status: 404, statusText: "Not Found" }),
      ),
    )
    vi.spyOn(console, "warn").mockImplementation(() => undefined)

    const { fetchProjects } = await import("./index")

    await expect(fetchProjects("en")).resolves.toEqual([])
  })

  it("keeps bundled projects in zero-config mock mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRAPI_URL", "")
    vi.stubEnv("STRAPI_MOCK_FALLBACK", "true")

    const { fetchProjects } = await import("./index")

    await expect(fetchProjects("en")).resolves.not.toEqual([])
  })
})
