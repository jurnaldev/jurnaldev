import type { MetadataRoute } from "next"
import { fetchAllProjectSlugs, fetchAllSlugs } from "@/lib/strapi"
import { buildSitemapEntries } from "@/lib/sitemap"

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries(fetchAllSlugs, fetchAllProjectSlugs)
}
