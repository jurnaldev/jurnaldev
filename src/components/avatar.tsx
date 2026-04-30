interface AvatarProps {
  size?: number
  src?: string | null
  alt?: string
}

export function Avatar({ size = 72, src, alt = "" }: AvatarProps) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        borderRadius: "50%",
        border: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        overflow: "hidden",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <svg
          viewBox="0 0 72 72"
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
        >
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
      )}
    </div>
  )
}
