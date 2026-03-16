'use client';

import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'About', href: '/about' },
];

const SCROLL_THRESHOLD = 56;

export default function SiteNav({ transparentAtTop = false }: { transparentAtTop?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparentAtTop) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY >= SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentAtTop]);

  const showBackground = !transparentAtTop || scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        showBackground
          ? 'border-b border-[var(--border-subtle)] bg-[var(--bg-page)]/98 backdrop-blur-sm'
          : 'border-b border-transparent bg-transparent'
      }`}
      style={showBackground ? { boxShadow: 'var(--shadow-nav)' } : undefined}
      role="navigation"
      aria-label="Main"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link
          href="/"
          className="flex items-center transition hover:opacity-90"
          aria-label="Sigag Lauren — Home"
        >
          <Image
            src="/assets/sigaglogo.svg"
            alt="Sigag Lauren"
            width={130}
            height={30}
            className={`sigag-logo ${showBackground ? 'sigag-logo-on-solid' : ''}`}
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          <ul className="flex items-center gap-0.5">
            {navItems.map(({ label, href }) => {
              const isActive = pathname === href;
              const linkClass = showBackground
                ? (isActive ? 'text-[var(--accent-via)] bg-[var(--accent-solid)]/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]')
                : (isActive ? 'text-white bg-white/20' : 'text-white/90 hover:text-white hover:bg-white/10');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${linkClass}`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ThemeToggle inverted={transparentAtTop && !showBackground} />
        </div>
      </div>
    </nav>
  );
}
