import { FadeInOnScroll } from "@/helper/observcer"
import { motion, Variants } from "framer-motion"

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 0 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
}

export function EventTimeline() {
  const events = [
    { date: "July 12, 2025", city: "Lagos", venue: "Warehouse 23", genre: "Afro House" },
    { date: "August 9, 2025", city: "Abuja", venue: "Underground Vibes", genre: "Deep House" },
    { date: "September 20, 2025", city: "Accra", venue: "Pulse Arena", genre: "Tech House" },
     { date: "September 26, 2025", city: "Accra", venue: "Pulse Arena", genre: "Tech House" },
  ]

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      <FadeInOnScroll>
       <motion.h2
  variants={fadeIn}
  className="text-4xl sm:text-5xl md:text-6xl font-heading text-center mb-14 tracking-tight 
             bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 
             bg-clip-text text-transparent drop-shadow-lg"
>
  Upcoming Events
</motion.h2>


        <div className="relative max-w-2xl mx-auto">
          {/* Timeline line */}
          <div className="absolute top-0 left-4 md:left-6 h-full w-1 bg-gradient-to-b from-pink-500/80 via-pink-400/40 to-transparent rounded-full" />

          <div className="space-y-10">
            {events.map((e, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="relative pl-12 md:pl-16"
              >
                {/* Marker */}
                <span className="absolute top-2 left-0 md:left-2 h-4 w-4 rounded-full border-2 border-pink-500 bg-black shadow-[0_0_15px_rgba(236,72,153,0.7)]" />

                <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:bg-black/70 transition">
                  <h3 className="text-lg md:text-xl font-semibold text-pink-400">{e.date}</h3>
                  <p className="mt-1 text-base md:text-lg">
                    <span className="font-bold">{e.city}</span> — {e.venue}{" "}
                    <span className="text-gray-400">({e.genre})</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeInOnScroll>
    </section>
  )
}
