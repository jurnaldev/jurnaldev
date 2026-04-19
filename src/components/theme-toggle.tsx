"use client"

import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme, type Theme } from "@/contexts/theme-context"

const options: { key: Theme; icon: typeof Sun; label: string }[] = [
  { key: "light", icon: Sun, label: "Light" },
  { key: "system", icon: Monitor, label: "System" },
  { key: "dark", icon: Moon, label: "Dark" },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      {options.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key
        return (
          <button
            key={key}
            onClick={() => setTheme(key)}
            aria-label={`${label} theme`}
            aria-pressed={isActive}
            style={{
              padding: "6px 8px",
              background: isActive ? "var(--text)" : "transparent",
              color: isActive ? "var(--bg)" : "var(--text-muted)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
          >
            <Icon size={14} strokeWidth={1.75} />
          </button>
        )
      })}
    </div>
  )
}
