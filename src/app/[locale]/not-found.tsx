"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { homePath, isLocale, journalPath } from "@/lib/i18n/routing"

export default function NotFound() {
  const pathname = usePathname()
  const candidate = pathname?.split("/")[1] ?? ""
  const locale = isLocale(candidate) ? candidate : "en"

  return (
    <main className="status-page">
      <p className="status-code">404</p>
      <h1>Page not found.</h1>
      <p>The page may have moved or no longer exists.</p>
      <div className="status-actions">
        <Link href={homePath(locale)}>Go home</Link>
        <Link href={journalPath(locale)}>Read the journal</Link>
      </div>
    </main>
  )
}
