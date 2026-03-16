'use client';

import { FadeInOnScroll } from '@/helper/observcer';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import LogoLoader from '@/components/LogoLoader';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

type Event = {
  id: string;
  date: string;
  city: string;
  venue: string;
  genre: string;
  ticket_url?: string;
};

export function EventTimeline() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) console.error('Error fetching events:', error.message);
      else setEvents(data || []);

      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <section className="relative py-15 md:py-20 px-6 bg-[var(--bg-card)] border-y border-[var(--border-subtle)] overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent-solid)]/20 rounded-full blur-3xl" />
      </div>

      <FadeInOnScroll>
        <motion.h2
          variants={fadeIn}
          className="text-display text-2xl sm:text-3xl md:text-4xl text-center mb-14 tracking-tight 
            bg-gradient-to-r from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] 
            bg-clip-text text-transparent"
        >
          Upcoming Events
        </motion.h2>

        <div className="relative max-w-2xl mx-auto">
          {/* Timeline line */}
          <div className="absolute top-0 left-4 md:left-6 h-full w-1 bg-gradient-to-b from-pink-500/80 via-pink-400/40 to-transparent rounded-full" />

          {loading ? (
            <motion.div variants={fadeInUp} className="flex justify-center py-12">
              <LogoLoader size="sm" />
            </motion.div>
          ) : events.length > 0 ? (
            <div className="space-y-10">
              {events.map((e, i) => (
                <motion.div key={e.id || i} variants={fadeInUp} className="relative pl-12 md:pl-16">
                  {/* Marker */}
                  <span className="absolute top-2 left-0 md:left-2 h-4 w-4 rounded-full border-2 border-[var(--accent-solid)] bg-[var(--bg-page)] shadow-[0_0_15px_rgba(139,92,246,0.5)]" />

                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 hover:bg-[var(--bg-input)] transition">
                    <h3 className="text-card-title text-[var(--accent-via)]">
                      {new Date(e.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <p className="mt-1 text-body md:text-body-lg">
                      <span className="font-semibold text-[var(--text-primary)]">{e.city}</span> — {e.venue}{' '}
                      <span className="text-[var(--text-muted)]">({e.genre})</span>
                    </p>

                    {e.ticket_url ? (
                      <a
                        href={e.ticket_url}
                        target="_blank"
                        className="mt-3 inline-block bg-[var(--accent-solid)] text-white px-5 py-2 rounded-lg text-body-sm font-semibold hover:opacity-90 transition"
                      >
                        Buy Tickets
                      </a>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={fadeInUp}
              className="text-center text-body-lg text-[var(--text-muted)] px-6 py-10 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl"
            >
              <p>No dates right now — but the vibe never stops. Stay tuned for the next wave. 🌌</p>
            </motion.div>
          )}
        </div>
      </FadeInOnScroll>
    </section>
  );
}




// import { FadeInOnScroll } from "@/helper/observcer";
// import { motion, Variants } from "framer-motion";

// const fadeIn: Variants = {
//    hidden: { opacity: 0, y: 0 },
//    show: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, ease: "easeOut" },
//    },
// };

// const fadeInUp: Variants = {
//    hidden: { opacity: 0, y: 30 },
//    show: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.7, ease: "easeOut" },
//    },
// };

// export function EventTimeline() {
//    const events = [
//       { date: "July 12, 2025", city: "Lagos", venue: "Warehouse 23", genre: "Afro House" },
//       { date: "August 9, 2025", city: "Abuja", venue: "Underground Vibes", genre: "Deep House" },
//       { date: "September 20, 2025", city: "Accra", venue: "Pulse Arena", genre: "Tech House" },
//       { date: "September 26, 2025", city: "Accra", venue: "Pulse Arena", genre: "Tech House" },
//    ];

//    return (
//       <section className="relative py-15 md:py-20 px-6 bg-[var(--bg-card)] border-y border-[var(--border-subtle)] overflow-hidden">
//          {/* Background glow */}
//          <div className="absolute inset-0 pointer-events-none">
//             <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-3xl" />
//          </div>

//          <FadeInOnScroll>
//             <motion.h2
//                variants={fadeIn}
//                className="text-4xl sm:text-5xl md:text-6xl font-heading text-center mb-14 tracking-tight 
//                bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 
//                bg-clip-text text-transparent drop-shadow-lg"
//             >
//                Upcoming Events
//             </motion.h2>

//             <div className="relative max-w-2xl mx-auto">
//                {/* Timeline line */}
//                <div className="absolute top-0 left-4 md:left-6 h-full w-1 bg-gradient-to-b from-pink-500/80 via-pink-400/40 to-transparent rounded-full" />

//                {events.length > 0 ? (
//                   <div className="space-y-10">
//                      {events.map((e, i) => (
//                         <motion.div key={i} variants={fadeInUp} className="relative pl-12 md:pl-16">
//                            {/* Marker */}
//                            <span className="absolute top-2 left-0 md:left-2 h-4 w-4 rounded-full border-2 border-[var(--accent-solid)] bg-[var(--bg-page)] shadow-[0_0_15px_rgba(139,92,246,0.5)]" />

//                            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 hover:bg-[var(--bg-input)] transition">
//                               <h3 className="text-lg md:text-xl font-semibold text-pink-400">
//                                  {e.date}
//                               </h3>
//                               <p className="mt-1 text-base md:text-lg">
//                                  <span className="font-bold">{e.city}</span> — {e.venue}{" "}
//                                  <span className="text-[var(--text-muted)]">({e.genre})</span>
//                               </p>
//                            </div>
//                         </motion.div>
//                      ))}
//                   </div>
//                ) : (
//                   <motion.div
//                      variants={fadeInUp}
//                      className="text-center text-[var(--text-muted)] font-body px-6 py-10 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl"
//                   >
//                      <p className="text-lg sm:text-xl">
//                         No dates right now — but the vibe never stops. Stay tuned for the next wave. 🌌
//                      </p>
//                   </motion.div>
//                )}
//             </div>
//          </FadeInOnScroll>
//       </section>
//    );
// }
