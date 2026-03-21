'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SiteNav from '@/components/SiteNav';
import LogoLoader from '@/components/LogoLoader';

type OrderItem = {
  id: string;
  patch_id: string;
  quantity: number;
  price_cents: number;
  patch_name?: string | null;
};

function ThankYouContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [loading, setLoading] = useState(!!reference);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const res = await fetch(`/api/paystack/status?reference=${encodeURIComponent(reference)}`);
        const data = await res.json();
        if (stop) return;
        if (data.status === 'paid' || data.status === 'fulfilled') {
          setStatus('paid');
          setItems((data.items || []) as OrderItem[]);
          setToken((data.token as string | null) || null);
          setLoading(false);
          return;
        }
        if (data.status === 'failed') {
          setStatus('failed');
          setLoading(false);
          return;
        }
        setStatus('pending');
        setLoading(false);
        timer = setTimeout(poll, 2500);
      } catch {
        if (stop) return;
        timer = setTimeout(poll, 3000);
      }
    };

    poll();
    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };
  }, [reference]);

  const downloadUrl = () => {
    return `/api/download?token=${encodeURIComponent(token || '')}`;
  };

  if (!reference) {
    return (
      <main className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
        <SiteNav />
        <div className="pt-14 md:pt-16" />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h1 className="text-page-title text-[var(--text-primary)]">Missing payment reference</h1>
          <p className="mt-2 text-body-sm text-[var(--text-muted)]">No payment reference was provided.</p>
          <Link href="/marketplace" className="mt-6 inline-block text-link-accent hover:underline">Back to store</Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
        <SiteNav />
        <div className="pt-14 md:pt-16" />
        <div className="max-w-lg mx-auto px-4 py-16 flex justify-center">
          <LogoLoader size="md" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      <SiteNav />
      <div className="pt-14 md:pt-16" />

      <section className="max-w-lg mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-14 h-14 rounded-full bg-[var(--accent-solid)]/20 flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-7 h-7 text-[var(--accent-solid)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </motion.div>
          <h1 className="text-page-title text-[var(--text-primary)] text-center">
            {status === 'pending' ? 'Processing payment' : 'Thanks for your purchase'}
          </h1>
          <p className="mt-2 text-body-sm text-[var(--text-secondary)] text-center">
            {status === 'pending'
              ? 'We are confirming your payment. This usually takes a few seconds.'
              : 'Your order is confirmed. Download your sample packs below.'}
          </p>

          {status === 'pending' && (
            <p className="mt-4 text-xs text-[var(--text-muted)] text-center">
              This page refreshes automatically once Paystack confirms payment.
            </p>
          )}

          {status === 'failed' && (
            <p className="mt-4 text-sm text-red-400 text-center">
              Payment was not successful. Please try again.
            </p>
          )}

          <ul className="mt-8 space-y-4">
            {items.map((item) => {
              const name = item.patch_name ?? `Pack ${item.patch_id}`;
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-[var(--border-subtle)] last:border-0"
                >
                  <span className="text-body-sm font-semibold text-[var(--text-primary)]">{name}</span>
                  {token ? (
                    <a
                      href={downloadUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-4 py-2 rounded-lg text-body-sm font-semibold bg-[var(--accent-solid)] text-white hover:opacity-90 transition active:scale-[0.98]"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-body-sm text-[var(--text-muted)]">
                      {status === 'pending' ? 'Preparing download…' : 'Download link not ready yet'}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          {items.length === 0 && !loading && (
            <p className="mt-6 text-[var(--text-muted)]">No items in this order.</p>
          )}

          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
            <Link href="/marketplace" className="text-link-accent hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent-solid)] focus:ring-offset-2 rounded">
              ← Back to sample packs
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
        <SiteNav />
        <div className="pt-14 md:pt-16" />
        <div className="max-w-lg mx-auto px-4 py-16 flex justify-center">
          <LogoLoader size="md" />
        </div>
      </main>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
