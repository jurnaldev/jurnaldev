import type { ProjectStatus } from "@/lib/strapi/types"

// Status badges stay English in both locales (per spec)
export const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "Live",
  wip: "WIP",
  archived: "Archived",
}
