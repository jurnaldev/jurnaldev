import { Instagram } from "lucide-react"

export function InstagramEmbed({ url }: { url: string }) {
  // Extract reel ID from URL for display
  const match = url.match(/\/reel\/([^/?]+)/) || url.match(/\/p\/([^/?]+)/)
  const id = match ? match[1] : ""

  return (
    <div
      style={{
        margin: "1.5rem 0",
        borderRadius: "10px",
        border: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <Instagram size={22} strokeWidth={2} />
      </div>
      <div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--text)",
            marginBottom: "4px",
          }}
        >
          Instagram Reel
        </div>
        <div
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "11px",
            color: "var(--text-subtle)",
          }}
        >
          {id || url}
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--text)",
          padding: "6px 14px",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          textDecoration: "none",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--text)"
          e.currentTarget.style.color = "var(--bg)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent"
          e.currentTarget.style.color = "var(--text)"
        }}
      >
        Watch on Instagram →
      </a>
    </div>
  )
}
