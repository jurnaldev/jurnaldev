import Link from "next/link"

export default function NotFound() {
  return (
    <main className="status-page">
      <p className="status-code">404</p>
      <h1>Page not found.</h1>
      <p>The page may have moved or no longer exists.</p>
      <div className="status-actions">
        <Link href="/">Go home</Link>
        <Link href="/jurnal">Read the journal</Link>
      </div>
    </main>
  )
}
