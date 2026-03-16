'use client';

import Link from 'next/link';

const sections = [
  { title: 'Marketplace', href: '/dashboard/patches', description: 'Sample packs and loops for the store.' },
  { title: 'About', href: '/dashboard/about', description: 'Artist profile and social links.' },
  { title: 'Gallery', href: '/dashboard/gallery', description: 'Photos and images.' },
  { title: 'Releases', href: '/dashboard/releases', description: 'Music releases and Spotify links.' },
  { title: 'Events', href: '/dashboard/events', description: 'Shows and tour dates.' },
];

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-page-title text-[var(--text-primary)] mb-1">Dashboard</h1>
      <p className="text-body-sm text-[var(--text-muted)] mb-8">
        Manage your content. Changes appear on the live site.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-solid)]/30 hover:bg-[var(--bg-elevated)] transition"
          >
            <h2 className="text-card-title text-[var(--text-primary)]">{s.title}</h2>
            <p className="mt-1 text-body-sm text-[var(--text-secondary)]">{s.description}</p>
            <span className="mt-3 inline-block text-caption text-[var(--accent-via)] font-medium">Manage →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
