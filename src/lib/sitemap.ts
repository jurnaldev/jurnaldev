import type { MetadataRoute } from "next"
import type { Locale } from "@/lib/strapi/types"
import { SITE_URL } from "./site"

type Slug = { slug: string; locale: Locale }
type SlugLoader = () => Promise<Slug[]>

export async function buildSitemapEntries(
  articleLoader: SlugLoader,
  projectLoader: SlugLoader,
): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, MetadataRoute.Sitemap[number]>()
  const add = (path: string, priority: number) => {
    const url = `${SITE_URL}${path}`
    entries.set(url, { url, lastModified: new Date(), priority })
  }
  add("/", 1)
  add("/jurnal", 0.8)
  add("/portfolio", 0.8)

  try {
    const articles = await articleLoader()
    articles.forEach(({ slug }) => add(`/jurnal/${slug}`, 0.7))
  } catch (error) {
    console.error("[sitemap] article slugs unavailable", error)
  }
  try {
    const projects = await projectLoader()
    projects.forEach(({ slug }) => add(`/portfolio/${slug}`, 0.7))
  } catch (error) {
    console.error("[sitemap] project slugs unavailable", error)
  }
  return [...entries.values()]
}
