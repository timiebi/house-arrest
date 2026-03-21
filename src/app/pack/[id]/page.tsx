'use client';

import LogoLoader from '@/components/LogoLoader';
import SiteNav from '@/components/SiteNav';
import PackPreviewBlock from '@/components/PackPreviewBlock';
import { useToast } from '@/contexts/ToastContext';
import { duration, ease, scaleFade } from '@/lib/animations';
import type { Patch } from '@/types/patches';
import { packHasAnyPreviewField } from '@/lib/packPreview';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(cents / 100);
}

const stagger = 0.06;

export default function PackDetailPage() {
  const params = useParams();
  const toast = useToast();
  const reducedMotion = useReducedMotion();
  const id = params?.id as string;
  const [pack, setPack] = useState<Patch | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [email, setEmail] = useState('');
  const transition = reducedMotion ? { duration: 0 } : { duration: duration.normal, ease: ease.out };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const load = async () => {
      const res = await fetch(`/api/packs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPack(data as Patch);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const isRealPack = pack && /^[0-9a-f-]{36}$/i.test(pack.id);

  const handleBuy = async () => {
    if (!pack) return;
    if (!isRealPack) {
      toast.info('This is a demo pack. Add real sample packs in the dashboard to enable purchases.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setBuying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: pack.id, pack_name: pack.name, price_cents: pack.price_cents, currency: pack.currency, email: email.trim() }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setBuying(false);
        toast.error(data.error || 'Checkout failed.');
      }
    } catch {
      setBuying(false);
      toast.error('Checkout failed.');
    }
  };

  if (loading) {
    return (
      <main className="pack-detail-page w-full min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden">
        <SiteNav />
        <div className="pt-14 md:pt-16" />
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 flex justify-center">
          <LogoLoader size="md" />
        </div>
      </main>
    );
  }

  if (!pack) {
    return (
      <main className="pack-detail-page w-full min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden">
        <SiteNav />
        <div className="pt-14 md:pt-16" />
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 text-center">
          <p className="text-body text-[var(--text-muted)]">Sample pack not found.</p>
          <Link href="/marketplace" className="mt-4 inline-block text-link-accent hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent-solid)] focus:ring-offset-2 rounded">
            ← Back to store
          </Link>
        </div>
      </main>
    );
  }

  const hasPreview = packHasAnyPreviewField(pack);
  const previewBlock = <PackPreviewBlock pack={pack} title={pack.name} />;

  return (
    <main className="pack-detail-page w-full min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden">
      <SiteNav />
      <div className="pt-14 md:pt-16" />

      <article className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="mb-6 w-full"
        >
          <Link
            href="/marketplace"
            className="text-link-muted hover:text-[var(--accent-via)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-solid)] focus:ring-offset-2 focus:ring-offset-[var(--bg-page)]"
          >
            ← Back to sample packs
          </Link>
        </motion.div>

        {/* 1. Header / name on top */}
        <header className="mb-10 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reducedMotion ? 0 : stagger * 0 }}
            className="text-[var(--text-primary)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          >
            {pack.name}
          </motion.h1>
        </header>

        {/* 2. Side-by-side: image (left) | buy + player (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            {pack.image_url ? (
              <motion.div
                initial={scaleFade.hidden}
                animate={scaleFade.visible}
                transition={{ ...transition, duration: reducedMotion ? 0 : duration.medium }}
                className="overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] aspect-[5/6]"
              >
                <img
                  src={pack.image_url}
                  alt=""
                  className="w-full h-full object-cover bg-[var(--bg-elevated)]"
                  sizes="(max-width: 1024px) 100vw, 600px"
                />
              </motion.div>
            ) : (
              <div className="overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] aspect-[5/4] flex items-center justify-center">
                <span className="text-6xl text-[var(--text-muted)]/40" aria-hidden>
                  ♪
                </span>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: reducedMotion ? 0 : stagger * 1 }}
              className="p-0"
            >
              <div>
                <p className="text-caption text-[var(--text-muted)] mb-2">Price</p>
                <span className="text-3xl sm:text-4xl font-semibold text-[var(--accent-via)] tracking-tight">
                  {formatPrice(pack.price_cents, pack.currency)}
                </span>
              </div>

              <div className="mt-5">
                <label htmlFor="email" className="text-caption text-[var(--text-muted)] mb-1.5 block">
                  Email for delivery
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-none bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-solid)] focus:border-transparent transition"
                />
              </div>

              <motion.button
                type="button"
                disabled={buying}
                onClick={handleBuy}
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                className="mt-3 w-full px-8 py-4 rounded-none cursor-pointer text-body font-semibold bg-[var(--accent-solid)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-solid)] focus:ring-offset-2 focus:ring-offset-[var(--bg-page)]"
              >
                {buying ? 'Processing…' : 'Buy — instant download'}
              </motion.button>

              {/* Listen */}
              {hasPreview && (
                <div className="mt-7 pt-6 border-t border-[var(--border-subtle)]">
                  <h2 className="text-label mb-3">Listen</h2>
                  {previewBlock}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* 3. Description (full width underneath) */}
        {pack.description && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reducedMotion ? 0 : stagger * 3 }}
            className="mt-12 mb-6 max-w-6xl"
          >
            <h2 className="text-section-title mb-4">Description</h2>
            <p className="text-body-lg text-[var(--text-secondary)] whitespace-pre-wrap">
              {pack.description}
            </p>
          </motion.div>
        )}
      </article>

      <footer className="w-full border-t border-[var(--border-subtle)] py-8 px-4 text-center text-caption mt-12">
        <Link href="/marketplace" className="inline-block mb-3 opacity-70 hover:opacity-100 transition" aria-label="Sigag Lauren">
          <Image src="/assets/sigaglogo.svg" alt="" width={72} height={18} className="sigag-logo sigag-logo-on-solid mx-auto" />
        </Link>
        <p>&copy; {new Date().getFullYear()} Sigag Lauren.</p>
      </footer>
    </main>
  );
}
