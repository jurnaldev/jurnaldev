import type { StrapiArticle } from '@/lib/strapi/types';
import { ArticleBody } from '@/components/article/article-body';
import { ArticleHeader } from '@/components/article/article-header';
import { AuthorCard } from '@/components/article/author-card';
import { RelatedArticles } from '@/components/article/related-articles';
import { TableOfContents } from '@/components/article/toc';
import { ShareButtons } from '@/components/article/share-buttons';
import { PageHeader } from '@/components/page-header';
import { LocaleGate } from './locale-gate';

interface ArticleMeta {
  readingTime: { minutes: number; text: string };
  headings: Array<{ text: string; slug: string; level: number }>;
}

interface Props {
  articleEn: StrapiArticle | null;
  articleId: StrapiArticle | null;
  metaEn: ArticleMeta | null;
  metaId: ArticleMeta | null;
  relatedEn: StrapiArticle[];
  relatedId: StrapiArticle[];
}

export async function ArticleView({
  articleEn,
  articleId,
  metaEn,
  metaId,
  relatedEn,
  relatedId,
}: Props) {
  // Pre-render both bodies on the server for SEO + static code highlighting
  const bodyEn = articleEn ? await ArticleBody({ body: articleEn.body }) : null;
  const bodyId = articleId ? await ArticleBody({ body: articleId.body }) : null;

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://jurnal.dev/jurnal/${(articleEn || articleId)?.slug}`;

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="grid-overlay" />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '960px',
          margin: '0 auto',
          padding: '2rem 1.5rem 4rem',
        }}
      >
        <PageHeader />

        <div className="article-layout">
          {/* Main column */}
          <article style={{ minWidth: 0 }}>
            {/* EN content */}
            {articleEn && metaEn && (
              <LocaleGate locale="en">
                <ArticleHeader article={articleEn} readingTime={metaEn.readingTime.text} />
                {bodyEn}
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    marginTop: '3rem',
                    paddingTop: '2rem',
                  }}
                >
                  <ShareButtons title={articleEn.title} url={shareUrl} />
                </div>
                {articleEn.author && <AuthorCard author={articleEn.author} />}
                {relatedEn.length > 0 && (
                  <RelatedArticles articles={relatedEn} label="More entries" />
                )}
              </LocaleGate>
            )}

            {/* ID content */}
            {articleId && metaId && (
              <LocaleGate locale="id">
                <ArticleHeader article={articleId} readingTime={metaId.readingTime.text} />
                {bodyId}
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    marginTop: '3rem',
                    paddingTop: '2rem',
                  }}
                >
                  <ShareButtons title={articleId.title} url={shareUrl} />
                </div>
                {articleId.author && <AuthorCard author={articleId.author} />}
                {relatedId.length > 0 && (
                  <RelatedArticles articles={relatedId} label="Jurnal lainnya" />
                )}
              </LocaleGate>
            )}

            {/* Fallback if only one locale exists */}
            {articleEn && !articleId && (
              <LocaleGate locale="id">
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    border: '1px dashed var(--border)',
                    borderRadius: '10px',
                    margin: '2rem 0',
                  }}
                >
                  Versi Bahasa Indonesia belum tersedia.{' '}
                  <br />
                  <em style={{ color: 'var(--text-subtle)' }}>
                    This article is only available in English.
                  </em>
                </div>
              </LocaleGate>
            )}
            {!articleEn && articleId && (
              <LocaleGate locale="en">
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    border: '1px dashed var(--border)',
                    borderRadius: '10px',
                    margin: '2rem 0',
                  }}
                >
                  English version not available yet.
                  <br />
                  <em style={{ color: 'var(--text-subtle)' }}>
                    Artikel ini hanya tersedia dalam Bahasa Indonesia.
                  </em>
                </div>
              </LocaleGate>
            )}
          </article>

          {/* TOC sidebar (desktop only) */}
          <aside className="toc-sidebar">
            {metaEn && (
              <LocaleGate locale="en">
                <TableOfContents headings={metaEn.headings} />
              </LocaleGate>
            )}
            {metaId && (
              <LocaleGate locale="id">
                <TableOfContents headings={metaId.headings} />
              </LocaleGate>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
