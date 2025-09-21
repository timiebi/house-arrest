"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeIn = {
   hidden: { opacity: 0, y: 40 },
   visible: { opacity: 1, y: 0 },
};

export default function QRScanner() {
   return (
      <motion.section
         className="relative py-15 md:py-24 px-6 text-center bg-gradient-to-b from-black via-gray-950 to-black"
         variants={fadeIn}
         initial="hidden"
         whileInView="visible"
         transition={{ duration: 0.8, ease: "easeOut" }}
         viewport={{ once: true }}
      >
         {/* background glow */}
         <div className="absolute inset-0 -z-10">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.08)_0%,transparent_70%)] animate-pulse" />
         </div>

         {/* heading */}
         <h2 className="text-4xl md:text-5xl font-heading mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Scan. Enter. Dance.
         </h2>

         {/* description */}
       <p className="text-lg md:text-xl font-body text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
   <span className="text-white font-semibold">Sigag Lauren</span>’s shows are about to get even 
   smoother. Powered by the <span className="text-pink-400 font-semibold">House Arrest</span>{" "}
   movement, future events will feature <span className="text-indigo-300 font-medium">
   QR-powered ticket scanning</span> for lightning-fast, hassle-free entry — no waiting, 
   just pure energy from the moment you arrive.
</p>


         {/* QR preview card */}
         <div className="flex justify-center">
            <div className="relative group">
               <Image
                  src="/assets/qrimg2.jpg"
                  alt="House Arrest Event QR Ticket Preview"
                  width={260}
                  height={260}
                  className="rounded-xl border border-gray-800 shadow-xl group-hover:scale-105 transition-transform duration-300"
               />
               {/* hover glow */}
               <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-pink-500/20 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
            </div>
         </div>

         {/* coming soon badge */}
         <div className="mt-10 inline-block px-4 py-2 rounded-full bg-gray-800/60 border border-gray-700 text-sm text-gray-300 tracking-wide">
            🎟️ QR Ticket Scanning Coming Soon
         </div>
      </motion.section>
   );
}
