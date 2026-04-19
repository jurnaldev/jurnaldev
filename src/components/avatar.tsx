export function Avatar() {
  return (
    <div
      style={{
        width: '72px',
        height: '72px',
        flexShrink: 0,
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        overflow: 'hidden',
      }}
    >
      <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
        <circle cx="36" cy="36" r="36" fill="var(--bg-elevated)" />
        <circle
          cx="36"
          cy="30"
          r="12"
          fill="none"
          stroke="var(--text)"
          strokeWidth="1.5"
        />
        <path
          d="M 14 64 Q 14 46 36 46 Q 58 46 58 64"
          fill="none"
          stroke="var(--text)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="30"
          y1="30"
          x2="34"
          y2="30"
          stroke="var(--text)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="38"
          y1="30"
          x2="42"
          y2="30"
          stroke="var(--text)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="36" cy="36" r="1" fill="var(--text)" />
      </svg>
    </div>
  );
}
