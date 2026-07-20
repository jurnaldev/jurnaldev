"use client"

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react"
import type { Locale } from "@/lib/i18n/routing"

export type Lang = Locale

interface LangContextValue {
  lang: Locale
}

const LangContext = createContext<LangContextValue | undefined>(undefined)
const STORAGE_KEY = "jurnal-dev-lang"

export function LangProvider({
  initialLang,
  children,
}: {
  initialLang: Locale
  children: ReactNode
}): React.ReactNode {
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, initialLang)
  }, [initialLang])

  return (
    <LangContext.Provider value={{ lang: initialLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const context = useContext(LangContext)
  if (!context) throw new Error("useLang must be used within LangProvider")
  return context
}
