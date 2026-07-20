import { describe, expect, it } from "vitest"
import { buildSecurityHeaders } from "./security-headers.mjs"

function csp(production: boolean, strapiUrl?: string) {
  return buildSecurityHeaders({ production, strapiUrl }).find(
    (header) => header.key === "Content-Security-Policy",
  )?.value
}

describe("buildSecurityHeaders", () => {
  it("uses strict production directives", () => {
    const value = csp(true)
    expect(value).toContain(
      "script-src 'self' 'unsafe-inline' https://giscus.app",
    )
    expect(value).not.toContain("'unsafe-eval'")
    expect(value).toContain("frame-ancestors 'none'")
  })

  it("allows Next development evaluation", () => {
    expect(csp(false)).toContain("'unsafe-eval'")
  })

  it("adds only a valid Strapi origin", () => {
    expect(csp(true, "https://cms.example.com/path")).toContain(
      "https://cms.example.com",
    )
    expect(csp(true, "http://localhost:1337")).toContain(
      "img-src 'self' data: blob: https: http://localhost:1337",
    )
    expect(csp(true, "not a url")).not.toContain("not a url")
  })

  it("returns all baseline headers", () => {
    expect(buildSecurityHeaders({ production: true })).toEqual(
      expect.arrayContaining([
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ]),
    )
  })
})
