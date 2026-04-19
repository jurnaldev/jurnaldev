'use client';

import { useLang, type Lang } from '@/contexts/lang-context';
import { type ReactNode } from 'react';

export function LocaleGate({
  locale,
  children,
}: {
  locale: Lang;
  children: ReactNode;
}) {
  const { lang } = useLang();
  return (
    <div style={{ display: lang === locale ? 'block' : 'none' }}>{children}</div>
  );
}
