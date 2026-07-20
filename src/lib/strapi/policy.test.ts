import { describe, expect, it } from "vitest"
import { getStrapiMode } from "./policy"

describe("getStrapiMode", () => {
  it("uses mocks only when Strapi is not configured", () => {
    expect(getStrapiMode({})).toBe("mock")
    expect(getStrapiMode({ NEXT_PUBLIC_STRAPI_URL: "" })).toBe("mock")
  })

  it("propagates configured Strapi failures by default", () => {
    expect(
      getStrapiMode({ NEXT_PUBLIC_STRAPI_URL: "https://cms.example.com" }),
    ).toBe("strapi")
  })

  it("enables fallback only through the explicit flag", () => {
    expect(
      getStrapiMode({
        NEXT_PUBLIC_STRAPI_URL: "https://cms.example.com",
        STRAPI_MOCK_FALLBACK: "true",
      }),
    ).toBe("strapi-with-fallback")
  })
})
