'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

type Event = {
  id: string;
  date: string;
  city: string;
  venue: string;
  genre: string;
  ticket_url?: string;
  is_upcoming?: boolean;
};

function formatDay(date: Date) {
  return date.getDate();
}
function formatMonthShort(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short' });
}
function formatWeekday(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}
function formatFullDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function NextEvent() {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchUpcomingEvent = async () => {
      const { data: upcoming, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_upcoming', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching upcoming event:', error.message);
        return;
      }

      if (upcoming) {
        setEvent(upcoming);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: allEvents } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (allEvents && allEvents.length > 0) {
        const next = allEvents.find((e) => new Date(e.date).setHours(0, 0, 0, 0) >= today.getTime());
        if (next) setEvent(next);
      }
    };

    fetchUpcomingEvent();
  }, []);

  return (
    <motion.section
      className="relative py-14 md:py-20 px-4 sm:px-6 md:px-8 bg-[var(--bg-card)] border-y border-[var(--border-subtle)]"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: 0.5, ease: 'easeOut' }}
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,var(--accent-solid)_0%,transparent_60%)] opacity-[0.06]" />

      <div className="max-w-3xl mx-auto">
        <p className="text-eyebrow text-[var(--accent-via)] mb-6 text-center">
          Next up
        </p>

        {!event ? (
          <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 md:p-10 text-center">
            <p className="text-body-lg text-[var(--text-muted)]">
              No upcoming event yet. Stay tuned.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden shadow-[var(--shadow-card)]">
            <div className="flex flex-col sm:flex-row">
              {/* Date block */}
              <div className="sm:w-32 shrink-0 flex flex-col items-center justify-center py-6 px-4 bg-[var(--bg-input)]/80 border-b sm:border-b-0 sm:border-r border-[var(--border-subtle)]">
                <span className="text-display text-4xl text-[var(--accent-via)] leading-none">
                  {formatDay(new Date(event.date))}
                </span>
                <span className="text-body-sm font-semibold text-[var(--text-secondary)] mt-1 uppercase tracking-wider">
                  {formatMonthShort(new Date(event.date))}
                </span>
                <span className="text-caption text-[var(--text-muted)] mt-0.5">
                  {new Date(event.date).getFullYear()}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                <p className="text-body-sm text-[var(--text-muted)] mb-1">
                  {formatFullDate(new Date(event.date))}
                </p>
                <h2 className="text-page-title text-[var(--text-primary)] mb-1">
                  {event.venue}
                </h2>
                <p className="text-body text-[var(--text-secondary)] mb-3">
                  {event.city}
                </p>
                <span className="inline-block text-label text-[var(--accent-via)] mb-4">
                  {event.genre}
                </span>
                <p className="text-body-sm text-[var(--text-muted)] mb-6 max-w-md">
                  Join Sigag Lauren live for {event.genre.toLowerCase()} — energy, rhythm, and an unforgettable night.
                </p>

                {event.ticket_url ? (
                  <Link
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl text-body-sm font-semibold bg-[var(--accent-solid)] text-white hover:opacity-95 transition"
                  >
                    Buy tickets
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                ) : (
                  <span className="text-body-sm text-[var(--text-muted)] italic">
                    Ticket link not available
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
