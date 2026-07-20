/**
 * @param {{ production: boolean, strapiUrl?: string }} options
 */
export function buildSecurityHeaders({ production, strapiUrl }) {
  const connect = ["'self'", "https://giscus.app", "https://api.github.com"]
  const images = ["'self'", "data:", "blob:", "https:"]
  try {
    if (strapiUrl) {
      const strapiOrigin = new URL(strapiUrl).origin
      connect.push(strapiOrigin)
      images.push(strapiOrigin)
    }
  } catch {}
  const scripts = ["'self'", "'unsafe-inline'", "https://giscus.app"]
  if (!production) scripts.push("'unsafe-eval'")
  const csp = [
    ["default-src", "'self'"],
    ["script-src", ...scripts],
    ["style-src", "'self'", "'unsafe-inline'"],
    ["img-src", ...new Set(images)],
    ["font-src", "'self'", "data:"],
    ["connect-src", ...new Set(connect)],
    ["frame-src", "https://giscus.app"],
    ["worker-src", "'self'", "blob:"],
    ["object-src", "'none'"],
    ["base-uri", "'self'"],
    ["form-action", "'self'"],
    ["frame-ancestors", "'none'"],
  ]
    .map((parts) => parts.join(" "))
    .join("; ")
  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
  ]
}
