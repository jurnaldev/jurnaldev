"use client"

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from "react"

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
const STORAGE_KEY = "jurnal-dev-theme"
const CHANGE_EVENT = "jurnal-dev-theme-change"
const MEDIA_QUERY = "(prefers-color-scheme: dark)"

function getThemeSnapshot(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system"
  } catch {
    return "system"
  }
}

function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(CHANGE_EVENT, onStoreChange)
  }
}

function getSystemDarkSnapshot() {
  return window.matchMedia(MEDIA_QUERY).matches
}

function subscribeSystemTheme(onStoreChange: () => void) {
  const media = window.matchMedia(MEDIA_QUERY)
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    getThemeSnapshot,
    () => "system",
  )
  const systemDark = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemDarkSnapshot,
    () => false,
  )
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (systemDark ? "dark" : "light") : theme

  useEffect(() => {
    const root = document.documentElement
    root.classList.add("no-transitions")
    root.classList.toggle("dark", resolvedTheme === "dark")
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.remove("no-transitions"))
    })
    return () => cancelAnimationFrame(frame)
  }, [resolvedTheme])

  const setTheme = (nextTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, nextTheme)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
