'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Patch } from '@/types/patches';
import { duration, ease, scaleFade } from '@/lib/animations';
import SiteNav from '@/components/SiteNav';
import LogoLoader from '@/components/LogoLoader';
import SoundCloudEmbed from '@/components/SoundCloudEmbed';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import { useToast } from '@/contexts/ToastContext';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(cents / 100);
}

const stagger = 0.06;

export default function PackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const reducedMotion = useReducedMotion();
  const id = params?.id as string;
  const [pack, setPack] = useState<Patch | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
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
    setBuying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: pack.id, pack_name: pack.name, price_cents: pack.price_cents, currency: pack.currency }),
      });
      const data = await res.json();
      if (data.order_id) {
        router.push(`/purchase/thank-you?order_id=${data.order_id}`);
      } else {
        setBuying(false);
        toast.error(data.error || 'Checkout failed.');
      }
    } catch (e) {
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

  const hasPreview = pack.youtube_url || pack.soundcloud_url || pack.preview_url;
  const previewBlock =
    pack.youtube_url ? (
      <YouTubeEmbed videoUrl={pack.youtube_url} title={`Preview: ${pack.name}`} />
    ) : pack.soundcloud_url ? (
      <SoundCloudEmbed trackUrl={pack.soundcloud_url} />
    ) : pack.preview_url ? (
      <audio
        src={pack.preview_url}
        controls
        preload="metadata"
        className="w-full accent-[var(--accent-solid)]"
        title={`Preview: ${pack.name}`}
      />
    ) : null;

  return (
    <main className="pack-detail-page w-full min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden">
      <SiteNav />
      <div className="pt-14 md:pt-16" />

      <article className="max-w-3xl mx-auto w-full px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="mb-6"
        >
          <Link
            href="/marketplace"
            className="text-link-muted hover:text-[var(--accent-via)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-solid)] focus:ring-offset-2 focus:ring-offset-[var(--bg-page)] rounded"
          >
            ← Back to sample packs
          </Link>
        </motion.div>

        {/* Pack image — same as marketplace: aspect-[4/3], object-cover */}
        {pack.image_url ? (
          <motion.div
            initial={scaleFade.hidden}
            animate={scaleFade.visible}
            transition={{ ...transition, duration: reducedMotion ? 0 : duration.medium }}
            className="rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] mb-6 aspect-[4/3]"
          >
            <img
              src={pack.image_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </motion.div>
        ) : (
          <div className="rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] mb-6 aspect-[4/3] flex items-center justify-center">
            <span className="text-6xl text-[var(--text-muted)]/40" aria-hidden>♪</span>
          </div>
        )}

        {/* Buy — under image */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reducedMotion ? 0 : stagger * 1 }}
          className="flex flex-wrap items-center gap-6 py-6 mb-8 border-b border-[var(--border-subtle)]"
        >
          <span className="text-2xl sm:text-3xl font-semibold text-[var(--accent-via)]">
            {formatPrice(pack.price_cents, pack.currency)}
          </span>
          <motion.button
            type="button"
            disabled={buying}
            onClick={handleBuy}
            whileHover={reducedMotion ? undefined : { scale: 1.02 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            className="px-8 py-4 rounded-xl text-body font-semibold bg-[var(--accent-solid)] text-white hover:opacity-90 disabled:opacity-50 transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-solid)] focus:ring-offset-2 focus:ring-offset-[var(--bg-page)]"
          >
            {buying ? 'Processing…' : 'Buy — instant download'}
          </motion.button>
        </motion.section>

        {/* Listen — SoundCloud / YouTube / audio under buy */}
        {hasPreview && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reducedMotion ? 0 : stagger * 2 }}
            className="mb-10"
            aria-label="Preview"
          >
            <h2 className="text-label mb-3">
              Listen
            </h2>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 sm:p-5">
              {previewBlock}
            </div>
          </motion.section>
        )}

        <header className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reducedMotion ? 0 : stagger * 3 }}
            className="text-[var(--text-primary)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          >
            {pack.name}
          </motion.h1>
        </header>

        {pack.description && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reducedMotion ? 0 : stagger * 4 }}
            className="mb-10 max-w-[65ch]"
          >
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
