'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
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

export default function NextEvent() {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchUpcomingEvent = async () => {
      // 1️⃣ Try to get manually marked upcoming event
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

      // 2️⃣ If none found, fetch the next event
      const today = new Date();
      const { data: allEvents } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (allEvents && allEvents.length > 0) {
        const nextEvent = allEvents.find((e) => new Date(e.date) >= today);
        if (nextEvent) setEvent(nextEvent);
      }
    };

    fetchUpcomingEvent();
  }, []);

  if (!event) {
    return (
      <motion.section
        className="relative text-center py-20 px-6 sm:px-10 md:px-20 bg-gradient-to-b from-black via-gray-900 to-black"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Next Event
        </h2>
        <p className="text-gray-400 text-lg sm:text-xl">No upcoming event yet. Stay tuned 🌌</p>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="relative text-center py-20 px-6 sm:px-10 md:px-20 bg-gradient-to-b from-black via-gray-900 to-black"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: 0.8, ease: 'easeOut' }}
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.05)_0%,transparent_70%)]" />
      </div>

      <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
        Next Event
      </h2>

      <p className="text-lg sm:text-xl md:text-2xl mb-1 font-body font-semibold text-white">
        {new Date(event.date).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      <p className="text-md sm:text-lg md:text-xl mb-4 font-body text-gray-300">
        {event.venue}, {event.city}
      </p>
      <p className="mb-8 max-w-xl mx-auto text-gray-400 font-body leading-relaxed text-sm sm:text-base md:text-lg">
        Join <span className="text-pink-400 font-semibold">Sigag Lauren</span> live with special guest DJs for an
        unforgettable night of {event.genre}, energy, and rhythm.
      </p>

      {event.ticket_url ? (
        <Link
          href={event.ticket_url}
          target="_blank"
          className="cursor-pointer inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg"
        >
          Buy Tickets
        </Link>
      ) : (
        <span className="text-gray-400 italic">Ticket link not available</span>
      )}
    </motion.section>
  );
}




// 'use client';

// import { motion } from 'framer-motion';
// import Link from 'next/link';

// const fadeIn = {
//   hidden: { opacity: 0, y: 40 },
//   visible: { opacity: 1, y: 0 },
// };

// export default function NextEvent() {
//   return (
//     <motion.section
//       className="relative text-center py-20 px-6 sm:px-10 md:px-20 bg-gradient-to-b from-black via-gray-900 to-black"
//       variants={fadeIn}
//       initial="hidden"
//       whileInView="visible"
//       transition={{ duration: 0.8, ease: 'easeOut' }}
//       viewport={{ once: true }}
//     >
//       {/* Subtle glowing backdrop */}
//       <div className="absolute inset-0 -z-10">
//         <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.05)_0%,transparent_70%)]" />
//       </div>

//       {/* Heading */}
//       <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
//         Next Event
//       </h2>

//       {/* Event details */}
//       <p className="text-lg sm:text-xl md:text-2xl mb-1 font-body font-semibold text-white">
//         Friday, July 12, 2025
//       </p>
//       <p className="text-md sm:text-lg md:text-xl mb-4 font-body text-gray-300">
//         Warehouse 23, Lagos
//       </p>
//       <p className="mb-8 max-w-xl mx-auto text-gray-400 font-body leading-relaxed text-sm sm:text-base md:text-lg">
//         Join <span className="text-pink-400 font-semibold">Sigag Lauren</span> live with special guest DJs for an
//         unforgettable night of house, energy, and rhythm.
//       </p>

//       {/* CTA button */}
//       <Link
//         href="https://tix.com"
//         target="_blank"
//         className="cursor-pointer inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg"
//       >
//         Buy Tickets
//       </Link>
//     </motion.section>
//   );
// }
