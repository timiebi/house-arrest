'use client';

import LogoLoader from '@/components/LogoLoader';
import type { Patch } from '@/types/patches';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(cents / 100);
}

const FEATURED_COUNT = 3;

export function SamplePacksPromo() {
  const [packs, setPacks] = useState<Patch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPacks = async () => {
      const res = await fetch('/api/packs');
      if (res.ok) {
        const data = await res.json();
        setPacks((data as Patch[] || []).slice(0, FEATURED_COUNT));
      }
      setLoading(false);
    };
    fetchPacks();
  }, []);

  return (
    <motion.section
      className="relative py-20 md:py-28 px-4 md:px-6 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeIn}
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[var(--bg-card)] border-y border-[var(--border-subtle)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,var(--accent-solid)_0%,transparent_55%)] opacity-[0.12]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_80%_70%,var(--accent-via)_0%,transparent_50%)] opacity-[0.08]" />

      <div className="max-w-5xl mx-auto text-center">
        <motion.p
          variants={fadeIn}
          custom={0}
          className="text-eyebrow text-[var(--accent-via)] mb-3"
        >
          From the studio
        </motion.p>
        <motion.h2
          variants={fadeIn}
          custom={1}
          className="text-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] mb-4"
        >
          <span className="bg-gradient-to-r from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] bg-clip-text text-transparent">
            Sample packs
          </span>
          <span className="text-[var(--text-primary)]"> that hit</span>
        </motion.h2>
        <motion.p
          variants={fadeIn}
          custom={2}
          className="text-body-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-12"
        >
          Professional loops and one-shots by Sigag Lauren. Drop them in your DAW — buy once, own forever. No subscriptions.
        </motion.p>

        {loading ? (
          <div className="flex justify-center py-16">
            <LogoLoader size="md" />
          </div>
        ) : packs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              {packs.map((pack, i) => (
                <motion.article
                  key={pack.id}
                  variants={fadeIn}
                  custom={3 + i}
                  className="group"
                >
                  <Link
                    href={`/pack/${pack.id}`}
                    className="block rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden hover:border-[var(--accent-solid)]/40 hover:shadow-[var(--shadow-card)] transition-all duration-300"
                  >
                    <div className="aspect-[4/3] bg-[var(--bg-input)] relative overflow-hidden">
                      {pack.image_url ? (
                        <img
                          src={pack.image_url}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl text-[var(--text-muted)]/50" aria-hidden>♪</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4 md:p-5">
                      <h3 className="text-card-title text-[var(--text-primary)] line-clamp-1">
                        {pack.name}
                      </h3>
                      <p className="mt-1 text-price text-[var(--accent-via)]">
                        {formatPrice(pack.price_cents, pack.currency)}
                      </p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
            <motion.div variants={fadeIn} custom={6} className="mt-12">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-body font-semibold bg-[var(--accent-solid)] text-white hover:opacity-95 active:scale-[0.98] transition shadow-lg"
              >
                View all sample packs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </>
        ) : (
          <motion.div variants={fadeIn} custom={3} className="py-8">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-body font-semibold bg-[var(--accent-solid)] text-white hover:opacity-95 active:scale-[0.98] transition shadow-lg"
            >
              Browse sample packs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
