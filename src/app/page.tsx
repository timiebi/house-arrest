'use client';

import { EventTimeline } from '@/components/calender';
import { DJLineup } from '@/components/djLineUp';
import { VibesGallery } from '@/components/galary';
import HeroCarousel from '@/components/HeroCarousel';
import NextEvent from '@/components/nextevent';
import QRScanner from '@/components/QRCode';
import { SamplePacksPromo } from '@/components/SamplePacksPromo';
import { ScrollUpButton } from '@/components/scrollUpButton';
import SiteNav from '@/components/SiteNav';
import SongCarousel from '@/components/songCarousel';
import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden">
      <SiteNav transparentAtTop />
      <p className="sr-only">Sigag Lauren — Artist profile & sample packs</p>
      <HeroCarousel />

      {/* From the studio, Sample packs that hit, copy, featured packs, View all — right after hero, before Next up */}
      <SamplePacksPromo />

      <NextEvent />
      <EventTimeline />

      <motion.section
        className="md:py-20 py-12 px-4 md:px-6 max-w-6xl mx-auto text-center"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <DJLineup />
      </motion.section>

      <motion.section
        className="relative py-16 md:py-24 px-4 md:px-6 bg-[var(--bg-card)] border-y border-[var(--border-subtle)]"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.7, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--accent-solid)_0%,transparent_50%)] opacity-[0.06]" />
        <h2 className="text-section-title text-2xl md:text-3xl font-semibold mb-8 tracking-tight text-center">
          <span className="bg-gradient-to-r from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] bg-clip-text text-transparent">
            New Releases
          </span>
        </h2>
        <SongCarousel />
      </motion.section>

      <QRScanner />
      <VibesGallery />

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-card)] text-center py-12 text-caption text-[var(--text-muted)]">
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
