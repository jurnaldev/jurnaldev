import type { StrapiAuthor } from '@/lib/strapi/types';
import { strapiMediaUrl } from '@/lib/strapi';
import { Avatar } from '@/components/avatar';

export function AuthorCard({ author }: { author: StrapiAuthor }) {
  const avatarUrl = strapiMediaUrl(author.avatar?.url);

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        padding: '1.25rem',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        background: 'var(--bg-elevated)',
        margin: '2.5rem 0',
      }}
    >
      {avatarUrl ? (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid var(--border)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt={author.name}
            width={56}
            height={56}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div style={{ width: '56px', height: '56px', flexShrink: 0 }}>
          <Avatar />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text)',
            marginBottom: '2px',
          }}
        >
          {author.name}
        </div>
        {author.bio && (
          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            {author.bio}
          </div>
        )}
      </div>
    </div>
  );
}
