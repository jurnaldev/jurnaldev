"use client"

import Link from "next/link"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="status-page">
      <p className="status-code">500</p>
      <h1>Something went wrong.</h1>
      <p>The page could not be loaded. Please try again.</p>
      <div className="status-actions">
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/">Go home</Link>
      </div>
    </main>
  )
}
