export type StrapiMode = "mock" | "strapi" | "strapi-with-fallback"

export function getStrapiMode(env: {
  NEXT_PUBLIC_STRAPI_URL?: string
  STRAPI_MOCK_FALLBACK?: string
}): StrapiMode {
  if (!env.NEXT_PUBLIC_STRAPI_URL) return "mock"
  return env.STRAPI_MOCK_FALLBACK === "true" ? "strapi-with-fallback" : "strapi"
}
