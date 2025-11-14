"use client";

import { EventTimeline } from "@/components/calender";
import { DJLineup } from "@/components/djLineUp";
import { VibesGallery } from "@/components/galary";
import HeroCarousel from "@/components/HeroCarousel";
import NextEvent from "@/components/nextevent";
import QRScanner from "@/components/QRCode";
import { ScrollUpButton } from "@/components/scrollUpButton";
import SongCarousel from "@/components/songCarousel";
import { motion } from "framer-motion";
import Link from "next/link";
// import Image from "next/image";

const fadeIn = {
   hidden: { opacity: 0, y: 30 },
   visible: { opacity: 1, y: 0 },
};

export default function Home() {
   return (
      <main className="bg-black text-white font-sans overflow-x-hidden">
         <HeroCarousel />

         {/* Event Section */}
         <NextEvent />

         <EventTimeline />

         {/* DJ Lineup */}
         <motion.section
            className="md:py-20 py-10 px-4 md:px-6 max-w-6xl mx-auto text-center"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
         >
            <DJLineup />
         </motion.section>

         <motion.section
            className="relative py-15 md:py-24 px-4 md:px-6 bg-gradient-to-b from-black via-gray-900 to-black"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
         >
            {/* soft radial accent */}
            <div className="absolute inset-0 -z-10">
               <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)]" />
            </div>

            {/* heading */}
            <h2 className="text-4xl md:text-5xl text-center font-heading mb-8 tracking-tight">
               <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  New Releases
               </span>
            </h2>

            {/* carousel */}
            <SongCarousel />
         </motion.section>

         {/* 
<motion.section
  className="relative py-16 md:py-28 px-4 md:px-6 max-w-5xl mx-auto text-center"
  variants={fadeIn}
  initial="hidden"
  whileInView="visible"
  transition={{ duration: 0.8, ease: "easeOut" }}
  viewport={{ once: true }}
>
  
  <div className="absolute inset-0 -z-10">
    <div className="w-full h-full bg-gradient-to-b from-pink-800/10 via-purple-900/5 to-transparent blur-2xl opacity-60" />
  </div>

  
  <h2 className="text-4xl md:text-5xl font-heading mb-6 tracking-tight text-white">
    About{" "}
    <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
      Sigag Lauren
    </span>
  </h2>


  <div className="w-16 h-1 mx-auto mb-10 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full" />

 
  <p className="text-lg md:text-xl font-body text-gray-300 leading-relaxed max-w-3xl mx-auto">
    <span className="text-pink-400 font-semibold">Sigag Lauren</span> is one of Nigeria’s most
    exciting electronic music producers and DJs. Known for blending
    <span className="text-white font-medium"> Afro-inspired rhythms</span> with
    <span className="text-purple-300 font-medium"> futuristic house sounds</span>, his sets are a
    journey through energy, melody, and raw emotion. From underground raves to global playlists,
    Sigag continues to push boundaries, uniting crowds with music that transcends borders.
  </p>
</motion.section> */}

         {/* QR Scanner Section */}
         <QRScanner />

         <VibesGallery />

         {/* Footer */}
         <footer className="bg-gray-900 text-center py-10 text-gray-500 font-body">
            <p>&copy; {new Date().getFullYear()} Sigag Lauren. All rights reserved.</p> |
            <Link href="/login">Admin</Link>
         </footer>
         <ScrollUpButton scrollHeight={200} />
      </main>
   );
}
