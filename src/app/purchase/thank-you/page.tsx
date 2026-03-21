'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import SiteNav from '@/components/SiteNav';
import LogoLoader from '@/components/LogoLoader';

type OrderItemRow = {
  id: string;
  order_id: string;
  patch_id: string;
  quantity: number;
  price_cents: number;
  patches?: { id: string; name: string } | { id: string; name: string }[] | null;
};

type OrderItem = OrderItemRow & {
  patches?: { id: string; name: string } | null;
};

type Order = {
  id: string;
  email: string;
  total_cents: number;
  currency: string;
  status: string;
};

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const token = searchParams.get('token');
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: orderData } = await supabase
        .from('orders')
        .select('id, email, total_cents, currency, status')
        .eq('id', orderId)
        .single();
      if (orderData) setOrder(orderData as Order);

      const { data: itemsData } = await supabase
        .from('order_items')
        .select(`
          id, order_id, patch_id, quantity, price_cents,
          patches ( id, name )
        `)
        .eq('order_id', orderId);
      const rows = (itemsData as OrderItemRow[] | null) || [];
      setItems(rows.map((row) => ({
        ...row,
        patches: Array.isArray(row.patches) ? row.patches[0] ?? null : row.patches ?? null,
      })));
      setLoading(false);
    };
    load();
  }, [orderId]);

  const downloadUrl = () => {
    return `/api/download?token=${encodeURIComponent(token || '')}`;
  };

  if (!orderId) {
    return (
      <main className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
        <SiteNav />
        <div className="pt-14 md:pt-16" />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h1 className="text-page-title text-[var(--text-primary)]">Missing order</h1>
          <p className="mt-2 text-body-sm text-[var(--text-muted)]">No order ID provided.</p>
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
            Thanks for your purchase
          </h1>
          <p className="mt-2 text-body-sm text-[var(--text-secondary)] text-center">
            Your order is confirmed. Download your sample packs below.
          </p>

          <ul className="mt-8 space-y-4">
            {items.map((item) => {
              const name = item.patches?.name ?? `Pack ${item.patch_id}`;
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
                    <span className="text-body-sm text-[var(--text-muted)]">Download link missing</span>
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
