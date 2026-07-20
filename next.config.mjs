import { buildSecurityHeaders } from "./src/lib/security-headers.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  headers: async () => [
    {
      source: "/(.*)",
      headers: buildSecurityHeaders({
        production: process.env.NODE_ENV === "production",
        strapiUrl: process.env.NEXT_PUBLIC_STRAPI_URL,
      }),
    },
    {
      source: "/giscus-theme-:theme.css",
      headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
    },
  ],
}

export default nextConfig
