"use client";

import { EventTimeline } from "@/components/calender";
import { DJLineup } from "@/components/djLineUp";
import { VibesGallery } from "@/components/galary";
import HeroCarousel from "@/components/HeroCarousel";
import NextEvent from "@/components/nextevent";
import QRScanner from "@/components/QRCode";
import SongCarousel from "@/components/songCarousel";
import { motion } from "framer-motion";
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
        <NextEvent/>

         <EventTimeline />

         {/* DJ Lineup */}
         <motion.section
            className="py-20 px-4 md:px-6 max-w-6xl mx-auto text-center"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
         >
            <DJLineup />
         </motion.section>

         <motion.section
            className="relative py-24 px-4 md:px-6 bg-gradient-to-b from-black via-gray-900 to-black"
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

         {/* About Section */}
         <motion.section
            className="relative py-28 px-4 md:px-6 max-w-5xl mx-auto text-center"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
         >
            {/* subtle gradient backdrop */}
            <div className="absolute inset-0 -z-10">
               <div className="w-full h-full bg-gradient-to-b from-pink-800/10 via-purple-900/5 to-transparent blur-2xl opacity-60" />
            </div>

            {/* heading */}
            <h2 className="text-4xl md:text-5xl font-heading mb-6 tracking-tight text-white">
               About{" "}
               <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  House Arrest
               </span>
            </h2>

            {/* divider */}
            <div className="w-16 h-1 mx-auto mb-10 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full" />

            {/* body copy */}
            <p className="text-lg md:text-xl font-body text-gray-300 leading-relaxed max-w-3xl mx-auto">
               <span className="text-pink-400 font-semibold">House Arrest</span> is more than a rave
               — it’s a movement. Born from DJs who live and breathe house music, our nights unite
               <span className="text-white font-medium"> underground beats</span>,
               <span className="text-purple-300 font-medium"> immersive energy</span>, and the
               freedom to move without limits.
            </p>
         </motion.section>

         {/* QR Scanner Section */}
        <QRScanner/>

         <VibesGallery />

         {/* Footer */}
         <footer className="bg-gray-900 text-center py-10 text-gray-500 font-body">
            <p>&copy; {new Date().getFullYear()} House Arrest. All rights reserved.</p>
         </footer>
      </main>
   );
}
