import readingTime from 'reading-time';
import type { Locale } from './strapi/types';

export function calculateReadingTime(body: string): { minutes: number; text: string } {
  const stats = readingTime(body);
  return {
    minutes: Math.ceil(stats.minutes),
    text: `${Math.ceil(stats.minutes)} min read`,
  };
}

export function formatDate(iso: string, locale: Locale = 'en'): string {
  const date = new Date(iso);
  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(iso: string, locale: Locale = 'en'): string {
  const date = new Date(iso);
  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatEntryNumber(num: number | undefined): string {
  if (!num) return '#000';
  return `#${String(num).padStart(3, '0')}`;
}

/**
 * Slugify a heading string for use as an element id (for TOC anchors).
 * Matches the output of rehype-slug.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Extract H2 headings from markdown body for TOC.
 */
export function extractHeadings(
  body: string,
): Array<{ text: string; slug: string; level: number }> {
  const lines = body.split('\n');
  const headings: Array<{ text: string; slug: string; level: number }> = [];

  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      headings.push({ text, slug: slugifyHeading(text), level });
    }
  }

  return headings;
}
