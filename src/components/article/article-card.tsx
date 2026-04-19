import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { StrapiArticle } from '@/lib/strapi/types';
import {
  formatDateShort,
  formatEntryNumber,
  calculateReadingTime,
} from '@/lib/article-utils';
import { strapiMediaUrl } from '@/lib/strapi';

// Fallback gradients when no cover image is available
const gradientsDark = [
  'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
  'linear-gradient(135deg, #064e3b 0%, #115e59 50%, #1e3a8a 100%)',
  'linear-gradient(135deg, #7c2d12 0%, #9f1239 50%, #831843 100%)',
  'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #155e75 100%)',
];
const gradientsLight = [
  'linear-gradient(135deg, #ddd6fe 0%, #e9d5ff 50%, #fae8ff 100%)',
  'linear-gradient(135deg, #d1fae5 0%, #ccfbf1 50%, #dbeafe 100%)',
  'linear-gradient(135deg, #fed7aa 0%, #fecdd3 50%, #fbcfe8 100%)',
  'linear-gradient(135deg, #cffafe 0%, #a5f3fc 50%, #bfdbfe 100%)',
];

export function ArticleCard({
  article,
  index = 0,
}: {
  article: StrapiArticle;
  index?: number;
}) {
  const coverUrl = strapiMediaUrl(article.cover?.url);
  const readingTime = calculateReadingTime(article.body);
  const gradIdx = index % gradientsDark.length;

  return (
    <Link
      href={`/jurnal/${article.slug}`}
      className="article-card"
      style={{
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Cover */}
      <div
        style={{
          height: '140px',
          background: coverUrl
            ? `url(${coverUrl}) center/cover`
            : `var(--card-gradient-${gradIdx})`,
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}
        data-gradient-idx={gradIdx}
      >
        {/* Entry number overlay */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '12px',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.9)',
            background: 'rgba(0,0,0,0.4)',
            padding: '3px 8px',
            borderRadius: '4px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {formatEntryNumber(article.entryNumber)}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '16px 18px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Meta line */}
        <div
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '10px',
            color: 'var(--text-subtle)',
            letterSpacing: '0.05em',
            marginBottom: '10px',
            textTransform: 'uppercase',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <span>{formatDateShort(article.publishedAt, article.locale)}</span>
          <span style={{ color: 'var(--border-hover)' }}>·</span>
          <span>{readingTime.text}</span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            lineHeight: 1.35,
            margin: '0 0 8px 0',
            color: 'var(--text)',
          }}
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        <p
          style={{
            fontSize: '13px',
            lineHeight: 1.55,
            color: 'var(--text-muted)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.excerpt}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              flexWrap: 'wrap',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border)',
            }}
          >
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                style={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: '10px',
                  letterSpacing: '0.02em',
                  padding: '2px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  color: 'var(--text-subtle)',
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
