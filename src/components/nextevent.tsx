'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function NextEvent() {
  return (
    <motion.section
      className="relative text-center py-20 px-6 sm:px-10 md:px-20 bg-gradient-to-b from-black via-gray-900 to-black"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: 0.8, ease: 'easeOut' }}
      viewport={{ once: true }}
    >
      {/* subtle glowing backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Heading */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
        Next Event
      </h2>

      {/* Event details */}
      <p className="text-lg sm:text-xl md:text-2xl mb-1 font-body font-semibold text-white">
        Friday, July 12, 2025
      </p>
      <p className="text-md sm:text-lg md:text-xl mb-4 font-body text-gray-300">
        Warehouse 23, Lagos
      </p>
      <p className="mb-8 max-w-xl mx-auto text-gray-400 font-body leading-relaxed text-sm sm:text-base md:text-lg">
        Headlined by the founders of <span className="text-pink-400 font-semibold">House Arrest</span> + Guest DJs
      </p>

      {/* CTA button */}
      <Link
        href="https://tix.com"
        target="_blank"
        className="inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg"
      >
        Buy Tickets
      </Link>
    </motion.section>
  );
}
