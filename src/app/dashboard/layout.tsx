'use client';

import ThemeToggle from '@/components/ThemeToggle';
import LogoLoader from '@/components/LogoLoader';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';

const ADMIN_EMAILS = ['kosutimiebinicholas@gmail.com', 'sigaglauren@gmail.com'];

const navItems = [
  { label: 'Marketplace', href: '/dashboard/patches' },
  { label: 'About', href: '/dashboard/about' },
  { label: 'Gallery', href: '/dashboard/gallery' },
  { label: 'Releases', href: '/dashboard/releases' },
  { label: 'Events', href: '/dashboard/events' },
];

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const [session, setSession] = useState<unknown>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [sidebarOpen]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login');
      } else if (!ADMIN_EMAILS.includes((data.session.user as { email?: string }).email ?? '')) {
        router.replace('/');
      } else {
        setSession(data.session);
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          router.replace('/dashboard');
        }
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
      else if (!ADMIN_EMAILS.includes((session.user as { email?: string }).email ?? '')) router.replace('/');
      else setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <LogoLoader size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between px-4 md:pl-6 md:pr-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="md:hidden p-2 rounded-md hover:bg-[var(--bg-elevated)]"
            aria-label="Menu"
          >
            <HiMenu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2" aria-label="Sigag Lauren — Home">
            <Image src="/assets/sigaglogo.svg" alt="Sigag Lauren" width={100} height={24} className="sigag-logo sigag-logo-on-solid" />
            <span className="font-semibold text-sm text-[var(--text-primary)] hidden sm:inline">· Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/marketplace"
            className="text-body-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-md hover:bg-[var(--bg-elevated)] transition"
          >
            View marketplace
          </Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/login');
            }}
            className="text-body-sm font-medium text-red-400 hover:text-red-300 px-3 py-2 rounded-md hover:bg-red-500/10 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 bottom-0 z-20 w-56 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] flex flex-col transform transition-transform duration-200 ease-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3 flex-1 overflow-auto">
          <p className="px-3 py-2 text-label">
            Content
          </p>
          <nav className="mt-1 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-3 py-2 rounded-md text-body-sm font-medium transition ${
                    isActive
                      ? 'bg-[var(--accent-solid)]/15 text-[var(--accent-via)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="md:hidden p-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[var(--text-muted)]"
          >
            <HiX className="w-4 h-4" /> Close
          </button>
        </div>
      </aside>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-10 bg-black/50 md:hidden touch-none"
          style={{ overscrollBehavior: 'contain' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 pt-14 md:pl-56 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}
