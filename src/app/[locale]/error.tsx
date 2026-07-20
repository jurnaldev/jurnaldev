"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { homePath, isLocale } from "@/lib/i18n/routing"

export default function ErrorPage({ reset }: { reset: () => void }) {
  const pathname = usePathname()
  const candidate = pathname?.split("/")[1] ?? ""
  const locale = isLocale(candidate) ? candidate : "en"

  return (
    <main className="status-page">
      <p className="status-code">500</p>
      <h1>Something went wrong.</h1>
      <p>The page could not be loaded. Please try again.</p>
      <div className="status-actions">
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
        <Link href={homePath(locale)}>Go home</Link>
      </div>
    </main>
  )
}
