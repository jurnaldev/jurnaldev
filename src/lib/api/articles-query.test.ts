import { describe, expect, it } from "vitest"
import { ArticlesQueryError, parseArticlesQuery } from "./articles-query"

describe("parseArticlesQuery", () => {
  it("uses safe defaults", () => {
    expect(parseArticlesQuery(new URLSearchParams())).toEqual({
      locale: "en",
      limit: undefined,
      featured: false,
    })
  })

  it("accepts valid values", () => {
    expect(
      parseArticlesQuery(
        new URLSearchParams("locale=id&limit=50&featured=true"),
      ),
    ).toEqual({ locale: "id", limit: 50, featured: true })
    expect(parseArticlesQuery(new URLSearchParams("limit=1")).limit).toBe(1)
  })

  it("rejects invalid locales", () => {
    expect(() =>
      parseArticlesQuery(new URLSearchParams("locale=fr")),
    ).toThrowError(
      expect.objectContaining<Partial<ArticlesQueryError>>({
        code: "INVALID_LOCALE",
      }),
    )
  })

  it.each(["0", "-1", "1.5", "abc", "51", ""])(
    "rejects invalid limit %j",
    (limit) => {
      expect(() =>
        parseArticlesQuery(new URLSearchParams({ limit })),
      ).toThrowError(
        expect.objectContaining<Partial<ArticlesQueryError>>({
          code: "INVALID_LIMIT",
        }),
      )
    },
  )
})
