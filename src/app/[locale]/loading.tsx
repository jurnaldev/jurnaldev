export default function Loading() {
  return (
    <main className="status-page" aria-busy="true" aria-label="Loading page">
      <div className="status-loading" />
      <div className="status-loading status-loading-short" />
    </main>
  )
}
