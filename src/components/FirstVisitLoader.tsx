'use client';

import { useEffect, useState } from 'react';
import LogoLoader from '@/components/LogoLoader';

const STORAGE_KEY = 'sigag-first-visit-done';
const SHOW_MS = 1200;
const FADE_MS = 250;

/**
 * Full-screen loader shown only on first visit (per session).
 * After that, users never see it — only API-call loaders (LogoLoader) elsewhere.
 */
export default function FirstVisitLoader() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    setVisible(true);
    const t1 = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setFading(true);
    }, SHOW_MS);
    const t2 = setTimeout(() => setVisible(false), SHOW_MS + FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-page)] transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}
      aria-hidden
    >
      <LogoLoader size="md" />
    </div>
  );
}
