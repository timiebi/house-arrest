import { FadeInOnScroll } from "@/helper/observcer";
import { motion, Variants } from "framer-motion";

const fadeIn:Variants = {
   hidden: { opacity: 0, y: 0 },
   show: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.6,
         ease: "easeOut",
      },
   },
};
const fadeInUp:Variants = {
   hidden: { opacity: 0, y: 20 },
   show: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.6,
         ease: "easeOut",
      },
   },
};
export function EventTimeline() {
   //  const fadeIn = {
   //     hidden: { opacity: 0, y: 30 },
   //     visible: { opacity: 1, y: 0 },
   //  };

   const events = [
      { date: "July 12, 2025", city: "Lagos", venue: "Warehouse 23", genre: "Afro House" },
      { date: "August 9, 2025", city: "Abuja", venue: "Underground Vibes", genre: "Deep House" },
   ];

   return (
      <section className="py-16 px-6 bg-gray-900 text-white">
         <FadeInOnScroll>
            <motion.h2
               variants={fadeIn}
            
               className="text-3xl text-center font-heading mb-8"
            >
               Upcoming Events
            </motion.h2>
            <div className="space-y-6 max-w-xl mx-auto">
               {events.map((e, i) => (
                  <motion.div
                     variants={fadeInUp}
                     key={i}
                     className="p-4 border-l-4 border-pink-500 bg-black/50"
                  >
                     <h3 className="text-xl font-bold">{e.date}</h3>
                     <p>
                        {e.city} — {e.venue} ({e.genre})
                     </p>
                  </motion.div>
               ))}
            </div>
         </FadeInOnScroll>
      </section>
   );
}
