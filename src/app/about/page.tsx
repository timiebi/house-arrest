import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      <SiteNav />
      <div className="pt-14 md:pt-16" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <h1 className="text-display text-[var(--text-primary)] text-3xl sm:text-4xl md:text-5xl mb-6">
          About <span className="bg-gradient-to-r from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] bg-clip-text text-transparent">Sigag Lauren</span>
        </h1>
        <p className="text-body-lg text-[var(--text-secondary)] mb-8">
          Sigag Lauren is one of Nigeria&apos;s most exciting electronic music producers and DJs. Known for blending
          Afro-inspired rhythms with futuristic house sounds, his sets are a journey through energy, melody, and raw emotion.
          From underground raves to global playlists, Sigag continues to push boundaries, uniting crowds with music that transcends borders.
        </p>
        <p className="text-body-lg text-[var(--text-secondary)] mb-10">
          House Arrest is not just an event — it&apos;s a movement. Every show is an immersive rave experience with top talent,
          unforgettable sets, and a crowd that lives for the beat.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex px-5 py-2.5 rounded-xl bg-[var(--accent-solid)] text-white text-body-sm font-semibold hover:opacity-90 transition"
        >
          Shop sample packs
        </Link>
      </div>
    </main>
  );
}
