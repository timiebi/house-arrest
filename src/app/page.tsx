'use client';

import { EventTimeline } from '@/components/calender';
import { DJLineup } from '@/components/djLineUp';
import { VibesGallery } from '@/components/galary';
import NextEvent from '@/components/nextevent';
import QRScanner from '@/components/QRCode';
import { ScrollUpButton } from '@/components/scrollUpButton';
import SiteNav from '@/components/SiteNav';
import SongCarousel from '@/components/songCarousel';
import { duration, ease, fadeUp, viewportOnce } from '@/lib/animations';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type LatestPack = { id: string; name: string } | null;

export default function HomePage() {
  const [latestPack, setLatestPack] = useState<LatestPack>(null);
  const reducedMotion = useReducedMotion();
  const t = reducedMotion ? { duration: 0, delay: 0 } : { duration: duration.fast, ease: ease.out };

  useEffect(() => {
    const fetchLatest = async () => {
      const res = await fetch('/api/packs');
      if (!res.ok) return;
      const data = await res.json();
      const packs = Array.isArray(data) ? data : [];
      const mostRecent = packs[0] ?? null;
      if (mostRecent?.id) setLatestPack({ id: mostRecent.id, name: mostRecent.name ?? 'Sample pack' });
    };
    fetchLatest();
  }, []);

  return (
    <main className="w-full min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden">
      <SiteNav transparentAtTop />
      <p className="sr-only">Sigag Lauren — Artist profile & sample packs</p>

      {/* HeroCarousel kept for later use */}
      {/* <HeroCarousel /> */}

      {/* New hero — bg image with light blur + scale; staggered entrance */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            background: "url('/assets/sigagvol1.png') center 60% / cover no-repeat",
            filter: "blur(4px)",
            transform: "scale(1.02)",
          }}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: reducedMotion ? 0 : duration.normal, ease: ease.out }}
          aria-hidden
        />
        <div className="absolute inset-0 z-0 bg-black/35" aria-hidden />

        <motion.div
          className="relative z-10 max-w-xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: reducedMotion ? 0 : 0.03,
                delayChildren: reducedMotion ? 0 : 0.04,
              },
            },
          }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: t.duration, ease: ease.out }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/sigaglogo.svg"
              alt="Sigag Lauren"
              className="mx-auto mb-8 h-28 sm:h-36 md:h-44 lg:h-52 w-auto"
            />
          </motion.div>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: t.duration, ease: ease.out }}
            className="text-body text-white/90 tracking-[0.2em] uppercase mb-4 drop-shadow-sm"
          >
            SL_AEE — Afro Electronic Essentials (Vol. 1)
          </motion.p>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: t.duration, ease: ease.out }}
            className="text-display text-3xl sm:text-4xl md:text-5xl text-white mb-4 leading-tight drop-shadow-md"
          >
            The sample pack is here!
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: t.duration, ease: ease.out }}
            className="text-body-lg text-white/90 mb-10 max-w-md mx-auto drop-shadow-sm"
          >
            Grab Afro Electronic Essentials Vol. 1 — drop Sigag Lauren&apos;s sounds into your DAW and start creating.
          </motion.p>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: t.duration, ease: ease.out }}
            className="flex justify-center"
          >
            <motion.span
              animate={
                reducedMotion
                  ? undefined
                  : {
                      scale: [1, 1.04, 1],
                      transition: {
                        duration: 0.5,
                        ease: 'easeInOut',
                        repeat: 4,
                      },
                    }
              }
              whileHover={reducedMotion ? undefined : { scale: 1.02 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            >
              <Link
                href={latestPack ? `/pack/${latestPack.id}` : '/marketplace'}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#111113] text-body-sm font-semibold uppercase tracking-wide hover:bg-white/95 transition shadow-xl hover:shadow-2xl"
              >
                View sample pack
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.span>
          </motion.div>
        </motion.div>
      </section>

      <NextEvent />
      <EventTimeline />

      <motion.section
        className="w-full md:py-20 py-12 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        transition={{ duration: duration.normal, ease: ease.out }}
      >
        <DJLineup />
      </motion.section>

      <motion.section
        className="relative w-full py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-[var(--bg-card)] border-y border-[var(--border-subtle)]"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        transition={{ duration: duration.normal, ease: ease.out }}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--accent-solid)_0%,transparent_50%)] opacity-[0.06]" />
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-section-title text-2xl md:text-3xl font-semibold mb-8 tracking-tight text-center">
            <span className="bg-gradient-to-r from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] bg-clip-text text-transparent">
              New Releases
            </span>
          </h2>
          <SongCarousel />
        </div>
      </motion.section>

      <QRScanner />
      <VibesGallery />

      <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-card)] text-center py-12 px-4 text-caption text-[var(--text-muted)]">
        <p>&copy; {new Date().getFullYear()} Sigag Lauren. All rights reserved.</p>
        <div className="mt-3 flex justify-center gap-4">
          <Link href="/marketplace" className="text-link-accent">
            Marketplace
          </Link>
          <Link href="/about" className="text-link-muted">
            About
          </Link>
          <Link href="/login" className="text-link-muted">
            Admin
          </Link>
        </div>
      </footer>
      <ScrollUpButton scrollHeight={200} />
    </main>
  );
}
