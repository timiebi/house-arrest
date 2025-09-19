"use client";

import { motion } from "framer-motion";
// import { Instagram, Spotify } from "lucide-react"

export function DJLineup() {
   const djs = [
      {
         name: "DJ Tempo",
         bio: "Afro-house & Tech specialist.",
         img: "/assets/dj1.jpg",
         instagram: "https://instagram.com/djtempo",
         spotify: "https://open.spotify.com/artist/1",
      },
      {
         name: "Lady Vibe",
         bio: "Deep grooves and vocal house queen.",
         img: "/assets/dj2.jpg",
         instagram: "https://instagram.com/ladyvibe",
         spotify: "https://open.spotify.com/artist/2",
      },
      {
         name: "Groove Saint",
         bio: "Soulful sets blending house and funk.",
         img: "/assets/dj3.jpg",
         instagram: "https://instagram.com/groovesaint",
         spotify: "https://open.spotify.com/artist/3",
      },
      {
         name: "Groove Saint",
         bio: "Soulful sets blending house and funk.",
         img: "/assets/dj10.jpg",
         instagram: "https://instagram.com/groovesaint",
         spotify: "https://open.spotify.com/artist/3",
      },
   ];

   return (
      <section className="relative py-20 md:px-6 bg-gradient-to-b from-black via-gray-950 to-black text-white overflow-hidden">
         {/* Background glow effect */}
         <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-pink-600/20 blur-3xl rounded-full" />
         </div>

         <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl sm:text-4xl md:text-5xl font-heading text-center mb-16 tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg"
         >
            Meet the DJs
         </motion.h2>

         <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {djs.map((dj, i) => (
               <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="group cursor-pointer w-full relative rounded-2xl overflow-hidden bg-gray-900/60 border border-white/10 shadow-lg hover:shadow-pink-500/30 hover:-translate-y-2 transition-all duration-500"
               >
                  {/* DJ Image */}
                  <div className="relative md:h-72 w-full overflow-hidden h-60">
                     <img
                        src={dj.img}
                        alt={dj.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 p-6 w-full">
                     <h3 className="text-[.875rem] md:text-2xl text-left font-bold text-pink-400 mb-2">{dj.name}</h3>
                     <p className="text-gray-300 text-left text-[.75rem] md:text-sm mb-4">{dj.bio}</p>

                     {/* Socials */}
                     <div className="flex gap-6">
                        <a
                           href={dj.instagram}
                           target="_blank"
                           className="text-gray-400 hover:text-pink-400 transition"
                        >
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.6}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           >
                              <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                              <circle cx="12" cy="12" r="3.2" />
                              <circle cx="17.2" cy="6.8" r="0.8" />
                           </svg>
                        </a>
                        <a
                           href={dj.spotify}
                           target="_blank"
                           className="text-gray-400 hover:text-green-400 transition"
                        >
                           <Sportify />
                        </a>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </section>
   );
}

const Sportify = () => {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 496 512"
         className="w-5 h-5 fill-current"
      >
         <path
            d="M248 8C111 8 0 119 0 256s111 248 248 248 
                      248-111 248-248S385 8 248 8zm121.7 
                      365.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135.5-39-207.3-23.4-3.9 
                      1-9 2.6-12.9 2.6-10.3 0-16.8-8.1-16.8-16.3 
                      0-10.7 6.5-15.8 14.2-17.7 
                      81.9-18.4 165.1-16.5 236.6 26.2 
                      6.8 4.2 10.7 8.1 10.7 17.1.1 9.7-7.8 15.1-14.8 15.1zm27.3-65.8c-5.2 
                      0-8.7-2.3-12.6-4.5-62.8-37.1-157.9-52.3-243.7-29.4-4.8 
                      1.3-7.4 2.6-12.6 2.6-11.6 0-21-9-21-20.6 
                      0-11.3 5.5-19.4 16.1-22.6 
                      30-8.1 61.3-12.9 100.7-12.9 
                      64.8 0 127.6 16.1 180.5 46.5 
                      9 5.2 13.9 10.3 13.9 21.9 
                      0 11.6-9 19-21.3 19zm29-76.7c-5.2 
                      0-8.4-1.3-13.2-3.9-71.7-42.3-198.2-46.5-276.9-26.5-3.6 
                      1-8.1 2.6-12.9 2.6-13.2 0-23.6-10.3-23.6-23.6 
                      0-13.2 7.1-21.6 17.7-24.5 
                      95.9-25.8 240.7-22.9 325.8 28.1 
                      8.4 5.2 12.9 10.3 12.9 22.3 
                      0 13.6-11 25.5-29.8 25.5z"
         />
      </svg>
   );
};
