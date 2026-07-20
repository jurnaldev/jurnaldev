"use client"

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from "react"

export type Lang = "en" | "id"

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextValue | undefined>(undefined)
const STORAGE_KEY = "jurnal-dev-lang"
const CHANGE_EVENT = "jurnal-dev-lang-change"

function getLangSnapshot(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "en" || stored === "id") return stored
  } catch {}
  return navigator.language.toLowerCase().startsWith("id") ? "id" : "en"
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(CHANGE_EVENT, onStoreChange)
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore<Lang>(
    subscribe,
    getLangSnapshot,
    () => "en",
  )

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (nextLang: Lang) => {
    localStorage.setItem(STORAGE_KEY, nextLang)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const context = useContext(LangContext)
  if (!context) throw new Error("useLang must be used within LangProvider")
  return context
}
