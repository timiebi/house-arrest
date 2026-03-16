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
         className="relative w-full py-12 md:py-24 px-4 sm:px-6 md:px-8 text-center bg-[var(--bg-card)] border-y border-[var(--border-subtle)]"
         variants={fadeIn}
         initial="hidden"
         whileInView="visible"
         transition={{ duration: 0.3, ease: "easeOut" }}
         viewport={{ once: true, amount: 0.06 }}
      >
         {/* background glow */}
         <div className="absolute inset-0 -z-10">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent-solid)_0%,transparent_70%)] opacity-[0.08] animate-pulse" />
         </div>

         {/* heading */}
         <h2 className="text-display text-2xl sm:text-3xl md:text-4xl mb-6 bg-gradient-to-r from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] bg-clip-text text-transparent">
            Scan. Enter. Dance.
         </h2>

         {/* description */}
       <p className="text-body md:text-body-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed">
   <span className="text-[var(--text-primary)] font-semibold">Sigag Lauren</span>’s shows are about to get even 
   smoother. Powered by the <span className="text-[var(--accent-via)] font-semibold">House Arrest</span>{" "}
   movement, future events will feature <span className="text-[var(--accent-to)] font-medium">QR-powered ticket scanning</span> for lightning-fast, hassle-free entry — no waiting, 
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
                  className="rounded-xl border border-[var(--border-subtle)] shadow-lg group-hover:scale-105 transition-transform duration-300"
               />
               {/* hover glow */}
               <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[var(--accent-solid)]/20 via-[var(--accent-via)]/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
            </div>
         </div>

         {/* coming soon badge */}
         <div className="mt-10 inline-block px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-body-sm text-[var(--text-secondary)] tracking-wide">
            🎟️ QR Ticket Scanning Coming Soon
         </div>
      </motion.section>
   );
}
