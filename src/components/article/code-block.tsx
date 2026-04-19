import { Copy } from 'lucide-react';
import { CopyButton } from './copy-button';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  html?: string; // Pre-highlighted HTML from Shiki
}

export function CodeBlock({ code, language = 'text', filename, html }: CodeBlockProps) {
  return (
    <div
      style={{
        borderRadius: '10px',
        border: '1px solid var(--code-border)',
        background: 'var(--code-bg)',
        overflow: 'hidden',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          padding: '8px 14px',
          borderBottom: '1px solid var(--code-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '11px',
          color: 'var(--text-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: 'var(--border-hover)',
              }}
            />
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: 'var(--border-hover)',
              }}
            />
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: 'var(--border-hover)',
              }}
            />
          </div>
          {filename && <span>{filename}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {language}
          </span>
          <CopyButton text={code} />
        </div>
      </div>

      {html ? (
        <div
          style={{
            padding: '14px 18px',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '13px',
            lineHeight: 1.65,
            overflowX: 'auto',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          style={{
            margin: 0,
            padding: '14px 18px',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '13px',
            lineHeight: 1.65,
            color: 'var(--text)',
            overflowX: 'auto',
          }}
        >
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
