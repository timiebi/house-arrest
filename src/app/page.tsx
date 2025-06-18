'use client'

import { EventTimeline } from '@/components/calender'
import { DJLineup } from '@/components/djLineUp'
import { VibesGallery } from '@/components/galary'
import HeroCarousel from '@/components/HeroCarousel'
import SongCarousel from '@/components/songCarousel'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

// const djs = [
//   {
//     name: 'DJ Tempo',
//     image: '/assets/dj1.jpg',
//     instagram: 'https://instagram.com/djtempo',
//     spotify: 'https://spotify.com/djtempo'
//   },
//   {
//     name: 'Luna Bass',
//     image: '/assets/dj2.jpg',
//     instagram: 'https://instagram.com/lunabass',
//     spotify: 'https://spotify.com/lunabass'
//   },
//   {
//     name: 'Groove Saint',
//     image: '/assets/dj3.jpg',
//     instagram: 'https://instagram.com/groovesaint',
//     spotify: 'https://spotify.com/groovesaint'
//   }
// ]

export default function Home() {
  return (
    <main className="bg-black text-white font-sans">
      <HeroCarousel />

      {/* Event Section */}
      <motion.section
        className="text-center py-16 px-4"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl mb-4 font-heading">Next Event</h2>
        <p className="text-xl mb-2 font-body">Friday, July 12, 2025</p>
        <p className="mb-2 font-body">Warehouse 23, Lagos</p>
        <p className="mb-6 font-body">Headlined by the founders of House Arrest + Guest DJs</p>
        <Link
          href="https://tix.com"
          target="_blank"
          className="bg-white text-black px-6 py-3 font-semibold rounded hover:bg-gray-300 font-body"
        >
          Buy Tickets
        </Link>
      </motion.section>
<EventTimeline />
   {/* DJ Lineup Section */}
      <motion.section
        className="py-16 px-6 max-w-5xl mx-auto text-center"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
       <DJLineup/>
      
      </motion.section>
      {/* Song Carousel Section */}
      <motion.section
        className="py-16 px-4"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl text-center font-heading mb-6">New Releases</h2>
        <SongCarousel />
      </motion.section>

   

      {/* About Section */}
      <motion.section
        className="py-16 px-6 max-w-4xl mx-auto text-center"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-heading mb-4">About House Arrest</h2>
        <p className="text-lg font-body text-gray-300">
          House Arrest is more than a rave — it’s a movement. Founded by DJs who live and breathe house music,
          our events bring together underground sounds, electric vibes, and the freedom to lose yourself on the dance floor.
        </p>
      </motion.section>

      {/* QR Code Scanner Section */}
      <motion.section
        className="py-16 px-6 text-center"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-heading mb-4">Scan Entry QR Code</h2>
        <p className="text-lg font-body mb-6 text-gray-300">Coming soon: scan your ticket for quick access</p>
        <div className="flex justify-center">
          <Image
            src="/assets/qrimg2.jpg"
            alt="QR Scanner Placeholder"
            width={250}
            height={250}
            className="rounded-lg border border-white"
          />
        </div>
      </motion.section>
      <VibesGallery/>

      {/* Footer */}
      <footer className="bg-gray-900 text-center py-8 text-gray-400 font-body">
        <p>&copy; {new Date().getFullYear()} House Arrest. All rights reserved.</p>
      </footer>
    </main>
  )
}
