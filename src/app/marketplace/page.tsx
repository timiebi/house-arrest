'use client';

import LogoLoader from '@/components/LogoLoader';
import SiteNav from '@/components/SiteNav';
import SoundCloudEmbed from '@/components/SoundCloudEmbed';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import { ScrollUpButton } from '@/components/scrollUpButton';
import { duration, ease, fadeUp, staggerDelay, viewportOnce } from '@/lib/animations';
import type { Patch } from '@/types/patches';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(cents / 100);
}

export default function MarketplacePage() {
  const [patches, setPatches] = useState<Patch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchPatches = async () => {
      const res = await fetch('/api/packs');
      if (!res.ok) {
        setError(await res.json().then((b) => b.error).catch(() => res.statusText));
        setPatches([]);
      } else {
        const data = await res.json();
        setPatches((data as Patch[]) || []);
      }
      setLoading(false);
    };
    fetchPatches();
  }, []);

  return (
    <main className="w-full min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden">
      <SiteNav />
      <div className="pt-14 md:pt-16" />

      {/* Hero — sample packs headline */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 py-16 md:py-24 lg:py-28 max-w-5xl mx-auto overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--accent-solid)_0%,transparent_50%)] opacity-[0.15]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_80%_20%,var(--accent-via)_0%,transparent_45%)] opacity-[0.08]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : duration.medium, ease: ease.outSoft }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reducedMotion ? 0 : 0.12, duration: reducedMotion ? 0 : duration.normal, ease: ease.out }}
            className="text-eyebrow text-[var(--accent-via)] mb-4"
          >
            Producer sounds
          </motion.p>
          <h1 className="text-display text-[var(--text-primary)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] bg-clip-text text-transparent">
              Sample packs
            </span>
          </h1>
          <p className="mt-6 text-body-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            Sound snippets by Sigag Lauren. Use in your DAW — buy once, own forever.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.25, duration: reducedMotion ? 0 : duration.normal, ease: ease.out }}
          >
            <Link
              href="/"
              className="mt-8 inline-flex items-center px-6 py-3 rounded-xl text-body-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-solid)]/40 hover:shadow-[0_0_0_1px_var(--accent-solid)]/20 transition-all duration-200 active:scale-[0.98]"
            >
              Meet the artist
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Pack grid */}
      <section className="w-full px-4 sm:px-6 md:px-8 pb-20 max-w-6xl mx-auto">
        {loading && (
          <div className="flex justify-center py-20 min-h-[200px]">
            <LogoLoader size="md" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-6">
            <p className="text-body-sm text-[var(--text-muted)]">
              Unable to load sample packs. Add the <code className="bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">patches</code> table in Supabase.
            </p>
          </div>
        )}

        {!loading && !error && (() => {
          return (
            <>
              {patches.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 px-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]"
                >
                  <div className="text-6xl text-[var(--text-muted)]/30 mb-4" aria-hidden>♪</div>
                  <h2 className="text-section-title text-[var(--text-primary)]">
                    No sample packs yet
                  </h2>
                  <p className="mt-2 text-body-sm text-[var(--text-muted)] max-w-sm mx-auto">
                    Check back soon — new sounds are on the way.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  {patches.map((pack, i) => (
                    <motion.article
                      key={pack.id}
                      initial={fadeUp.hidden}
                      whileInView={fadeUp.visible}
                      viewport={viewportOnce}
                      transition={{ duration: reducedMotion ? 0 : duration.normal, ease: ease.out, delay: reducedMotion ? 0 : i * staggerDelay }}
                      className="group bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden hover:border-[var(--accent-solid)]/30 hover:shadow-[var(--shadow-card)] transition-all duration-300"
                    >
                      <Link href={`/pack/${pack.id}`} className="block">
                        <div className="aspect-[4/3] bg-[var(--bg-elevated)] relative overflow-hidden">
                          {pack.image_url ? (
                            <img
                              src={pack.image_url}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                              loading="lazy"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)]">
                              <span className="text-5xl text-[var(--text-muted)]/60" aria-hidden>♪</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h2 className="text-card-title text-[var(--text-primary)]">
                            {pack.name}
                          </h2>
                          {pack.description && (
                            <p className="mt-2 text-body-sm text-[var(--text-secondary)] line-clamp-2">
                              {pack.description}
                            </p>
                          )}
                          {(pack.youtube_url || pack.soundcloud_url || pack.preview_url) && (
                            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]/80">
                              <p className="text-label mb-2">Preview</p>
                              {pack.youtube_url ? (
                                <div className="overflow-hidden" onClick={(e) => e.preventDefault()}>
                                  <YouTubeEmbed videoUrl={pack.youtube_url} compact title={pack.name} />
                                </div>
                              ) : pack.soundcloud_url ? (
                                <div className="overflow-hidden" onClick={(e) => e.preventDefault()}>
                                  <SoundCloudEmbed trackUrl={pack.soundcloud_url} compact className="w-full" />
                                </div>
                              ) : pack.preview_url ? (
                                <audio
                                  src={pack.preview_url}
                                  controls
                                  preload="metadata"
                                  className="w-full h-9 accent-[var(--accent-solid)]"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : null}
                            </div>
                          )}
                          <div className="mt-5 flex items-center justify-between gap-3">
                            <span className="text-price text-[var(--accent-via)]">
                              {formatPrice(pack.price_cents, pack.currency)}
                            </span>
                            <span className="shrink-0 px-5 py-2.5 rounded-xl text-body-sm font-semibold bg-[var(--accent-solid)] text-white group-hover:opacity-95 transition active:scale-[0.98]">
                              View pack
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </section>

      {/* CTA — artist */}
      <section className="w-full px-4 sm:px-6 md:px-8 pb-16 max-w-5xl mx-auto">
        <motion.div
          initial={fadeUp.hidden}
          whileInView={fadeUp.visible}
          viewport={viewportOnce}
          transition={{ duration: reducedMotion ? 0 : duration.medium, ease: ease.out }}
          className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-8 md:p-10 text-center"
        >
          <h2 className="text-page-title text-[var(--text-primary)]">
            Who makes these?
          </h2>
          <p className="mt-2 text-body text-[var(--text-secondary)] max-w-md mx-auto">
            Sigag Lauren — DJ, producer, House Music. Get to know the artist.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center px-5 py-2.5 rounded-xl text-body-sm font-semibold bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-solid)]/25 transition active:scale-[0.98]"
          >
            View artist profile
          </Link>
        </motion.div>
      </section>

      <footer className="w-full border-t border-[var(--border-subtle)] py-8 px-4 text-center text-caption">
        <Link href="/" className="inline-block mb-4 opacity-70 hover:opacity-100 transition" aria-label="Sigag Lauren">
          <Image src="/assets/sigaglogo.svg" alt="" width={80} height={20} className="sigag-logo sigag-logo-on-solid mx-auto" />
        </Link>
        <p>&copy; {new Date().getFullYear()} Sigag Lauren.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/" className="text-link-muted hover:underline">Home</Link>
          <Link href="/about" className="text-link-muted hover:underline">About</Link>
          <Link href="/login" className="text-link-muted hover:underline">Admin</Link>
        </div>
      </footer>

      <ScrollUpButton scrollHeight={200} />
    </main>
  );
}
