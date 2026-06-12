import { strapiMediaUrl } from "@/lib/strapi"
import type { StrapiImage } from "@/lib/strapi/types"

export function ProjectGallery({ images = [] }: { images?: StrapiImage[] }) {
  if (!images.length) return null

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginTop: "3rem",
      }}
    >
      {images.map((image) => {
        const url = strapiMediaUrl(image.url)
        if (!url) return null
        return (
          <figure key={image.id} style={{ margin: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={image.alternativeText || ""}
              style={{
                width: "100%",
                display: "block",
                background: "var(--hairline)",
              }}
            />
            {image.alternativeText && (
              <figcaption
                style={{
                  fontSize: "12px",
                  color: "var(--stone)",
                  marginTop: "8px",
                }}
              >
                {image.alternativeText}
              </figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
