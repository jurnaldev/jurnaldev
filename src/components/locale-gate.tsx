"use client"

import { useLang, type Lang } from "@/contexts/lang-context"
import { type ReactNode } from "react"

export function LocaleGate({
  locale,
  children,
  inline,
}: {
  locale: Lang
  children: ReactNode
  inline?: boolean
}) {
  const { lang } = useLang()
  const display = lang === locale ? (inline ? "inline" : "block") : "none"
  const Tag = inline ? "span" : "div"
  return <Tag style={{ display }}>{children}</Tag>
}
