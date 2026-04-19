import type { LucideIcon } from 'lucide-react';

export function SectionLabel({
  number,
  label,
  icon: Icon,
}: {
  number: string;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: '11px',
        color: 'var(--text-subtle)',
        letterSpacing: '0.1em',
        marginBottom: '1.5rem',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span>{number} /</span>
      <span>{label}</span>
      {Icon && <Icon size={11} strokeWidth={2} />}
    </div>
  );
}

export function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '10px',
          color: 'var(--text-subtle)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.5' }}>{value}</div>
    </div>
  );
}
