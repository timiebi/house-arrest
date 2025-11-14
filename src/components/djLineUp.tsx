"use client"

import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function DJLineup() {
  const [profile, setProfile] = useState<any>(null);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", "kosutimiebinicholas@gmail.com") // fetch by email, not id
        .single();

      if (error) {
        console.warn("Failed to fetch profile:", error.message);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    }
  };

  fetchProfile();
}, []);


  if (!profile) return <p className="text-center text-gray-400 mt-20">Loading...</p>;

  return (
    <section className="relative py-16 md:py-28 px-6 bg-gradient-to-b from-black via-gray-950 to-black text-white overflow-hidden">
      {/* Glow / Aura */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] bg-pink-600/20 blur-3xl rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden shadow-xl border border-white/10"
        >
          <img
            src={profile.profile_image_url || "/assets/dj1.jpg"}
            alt={profile.name || "DJ"}
            className="w-full h-[450px] md:h-[550px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </motion.div>

        {/* Text Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center md:text-left"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6">
            {profile.name || "Sigag Lauren"}
          </h2>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
            {profile.about ||
              "DJ & producer redefining EDM with Afropop and House influences. From Lagos to the world, blending pulsating beats and soulful melodies."}
          </p>

          {/* Socials */}
          <div className="flex gap-6 justify-center md:justify-start">
            {profile.instagram_url && (
              <a href={profile.instagram_url} target="_blank" className="text-gray-400 hover:text-pink-400 transition">
                <InstagramIcon />
              </a>
            )}
            {profile.spotify_url && (
              <a href={profile.spotify_url} target="_blank" className="text-gray-400 hover:text-green-400 transition">
                <SpotifyIcon />
              </a>
            )}
            {profile.apple_music_url && (
              <a href={profile.apple_music_url} target="_blank" className="text-gray-400 hover:text-red-400 transition">
                <AppleMusicIcon />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}




// "use client";

// import { motion } from "framer-motion";

// export function DJLineup() {
//    return (
//       <section className="relative py-16 md:py-28 px-6 bg-gradient-to-b from-black via-gray-950 to-black text-white overflow-hidden">
//          {/* Glow / Aura */}
//          <div className="absolute inset-0 -z-10">
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] bg-pink-600/20 blur-3xl rounded-full" />
//          </div>

//          {/* Content */}
//          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
//             {/* Image */}
//             <motion.div
//                initial={{ opacity: 0, scale: 0.9 }}
//                whileInView={{ opacity: 1, scale: 1 }}
//                transition={{ duration: 0.8 }}
//                viewport={{ once: true }}
//                className="relative rounded-3xl overflow-hidden shadow-xl border border-white/10"
//             >
//                <img
//                   src="/assets/dj1.jpg" // Replace with his press image
//                   alt="Sigag Lauren"
//                   className="w-full h-[450px] md:h-[550px] object-cover"
//                />
//                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
//             </motion.div>

//             {/* Text Info */}
//             <motion.div
//                initial={{ opacity: 0, y: 40 }}
//                whileInView={{ opacity: 1, y: 0 }}
//                transition={{ duration: 0.7 }}
//                viewport={{ once: true }}
//                className="text-center md:text-left"
//             >
//                <h2 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6">
//                   Sigag Lauren
//                </h2>
//                <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
//                   Nigerian-born DJ & producer redefining EDM with Afropop and House influences. 
//                   From Lagos to the world, Sigag blends pulsating beats and soulful melodies, 
//                   creating electrifying moments on every stage.
//                </p>

//                {/* Socials */}
//                <div className="flex gap-6 justify-center md:justify-start">
//                   <a
//                      href="https://instagram.com/sigaglauren"
//                      target="_blank"
//                      className="text-gray-400 hover:text-pink-400 transition"
//                   >
//                      <InstagramIcon />
//                   </a>
//                   <a
//                      href="https://open.spotify.com/artist/3t7U5HMiY2C6AnQ7BBTkdn"
//                      target="_blank"
//                      className="text-gray-400 hover:text-green-400 transition"
//                   >
//                      <SpotifyIcon />
//                   </a>
//                   <a
//                      href="https://music.apple.com/ng/artist/sigag-lauren/1437272095"
//                      target="_blank"
//                      className="text-gray-400 hover:text-red-400 transition"
//                   >
//                      <AppleMusicIcon />
//                   </a>
//                </div>
//             </motion.div>
//          </div>
//       </section>
//    );
// }

const InstagramIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="17.2" cy="6.8" r="0.8" />
   </svg>
);

const SpotifyIcon = () => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 496 512"
      className="w-6 h-6 fill-current"
   >
      <path d="M248 8C111 8 0 119 0 256s111 248 
         248 248 248-111 248-248S385 8 
         248 8zm100.7 364.9c-4.2 0-6.8-1-10.7-3.2-62.4-37.6-135.2-39.5-206.6-23.7-3.9 
         1-9 2.6-12.6 2.6-10.3 0-16.1-8.1-16.1-15.9 
         0-10.5 6.3-15.4 13.9-17.2 80.7-18.5 
         166.7-16.5 237.8 26.2 6.8 4.2 10.7 
         8.1 10.7 16.1 0 9.1-7.1 15.1-16.4 
         15.1zm26.6-65.6c-5.2 0-8.7-2.1-12.3-4.2-62.8-37.1-155.5-51.9-238.4-28.8-4.8 
         1.3-7.4 2.6-12.6 2.6-10.3 0-19.1-8.1-19.1-18.2 
         0-10.7 5.8-16.5 14.5-19 92.4-25.2 
         192.2-8.9 263.3 34.9 8.1 4.8 11.3 9.7 
         11.3 18.2-.1 10.9-8.5 14.5-16.7 
         14.5zm28.5-70.7c-5.2 0-8.4-1.3-13.2-3.9-71.5-42.5-191.2-52.6-268.5-29.2-3.6 
         1-8.1 2.6-12.9 2.6-12.6 0-22-10.3-22-22.9 
         0-12.9 7.4-20.3 16.1-22.9 
         85.3-25.5 221.5-20.3 304.9 29.2 
         9 5.2 12.9 11.3 12.9 21 
         0 12.9-10.3 26.1-27.3 26.1z" />
   </svg>
);

const AppleMusicIcon = () => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
      className="w-6 h-6 fill-current"
   >
      <path d="M318.7 268c-26.2 0-47.5 21.3-47.5 
         47.5s21.3 47.5 47.5 47.5 47.5-21.3 
         47.5-47.5-21.3-47.5-47.5-47.5zm-160 
         25c-26.2 0-47.5 21.3-47.5 47.5s21.3 
         47.5 47.5 47.5 47.5-21.3 
         47.5-47.5-21.3-47.5-47.5-47.5zm106.3-277.8c-22.2 
         0-48.4 14.3-64.3 34.1-14.1 17.9-25.5 
         46.4-21.1 73.4h.8c25.2 0 51.1-14.1 
         66.5-33.8 14.4-18.2 25.6-46.6 
         21.1-73.7h-.9zm-37.2 
         108.9c-36.6-2.2-67.8 20.9-85.2 
         20.9-17.6 0-44.5-20.4-73.2-19.8-37.6.6-72.1 
         22.1-91.2 56.1-39.1 67.4-10.3 
         167.5 27.9 222.3 18.4 27.1 40.2 
         57.5 69.2 56.4 27.5-1.1 38-18.1 
         71.3-18.1 33.2 0 42.4 18.1 
         71.6 17.6 29.7-.5 48.4-27.3 
         66.5-54.7 20.6-30.1 29.1-59.2 
         29.6-60.8-.6-.2-56.8-21.9-57.4-86.7-.6-54.3 
         44.4-80.1 46.3-81.3-25.3-37-64.3-41.1-77.4-41.9z" />
   </svg>
);

















// "use client";

// import { motion } from "framer-motion";
// // import { Instagram, Spotify } from "lucide-react"

// export function DJLineup() {
//    const djs = [
//       {
//          name: "DJ Tempo",
//          bio: "Afro-house & Tech specialist.",
//          img: "/assets/dj1.jpg",
//          instagram: "https://instagram.com/djtempo",
//          spotify: "https://open.spotify.com/artist/1",
//       },
//       {
//          name: "Lady Vibe",
//          bio: "Deep grooves and vocal house queen.",
//          img: "/assets/dj2.jpg",
//          instagram: "https://instagram.com/ladyvibe",
//          spotify: "https://open.spotify.com/artist/2",
//       },
//       {
//          name: "Groove Saint",
//          bio: "Soulful sets blending house and funk.",
//          img: "/assets/dj3.jpg",
//          instagram: "https://instagram.com/groovesaint",
//          spotify: "https://open.spotify.com/artist/3",
//       },
//       {
//          name: "Groove Saint",
//          bio: "Soulful sets blending house and funk.",
//          img: "/assets/dj10.jpg",
//          instagram: "https://instagram.com/groovesaint",
//          spotify: "https://open.spotify.com/artist/3",
//       },
//    ];

//    return (
//       <section className="relative py-20 md:px-6 bg-gradient-to-b from-black via-gray-950 to-black text-white overflow-hidden">
//          {/* Background glow effect */}
//          <div className="absolute inset-0 -z-10">
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-pink-600/20 blur-3xl rounded-full" />
//          </div>

//          <motion.h2
//             initial={{ opacity: 0, y: 40 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.7 }}
//             className="text-3xl sm:text-4xl md:text-5xl font-heading text-center mb-16 tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg"
//          >
//             Meet the DJs
//          </motion.h2>

//          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
//             {djs.map((dj, i) => (
//                <motion.div
//                   key={i}
//                   initial={{ opacity: 0, y: 60 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ duration: 0.6, delay: i * 0.15 }}
//                   className="group cursor-pointer w-full relative rounded-2xl overflow-hidden bg-gray-900/60 border border-white/10 shadow-lg hover:shadow-pink-500/30 hover:-translate-y-2 transition-all duration-500"
//                >
//                   {/* DJ Image */}
//                   <div className="relative md:h-72 w-full overflow-hidden h-60">
//                      <img
//                         src={dj.img}
//                         alt={dj.name}
//                         className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
//                      />
//                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
//                   </div>

//                   {/* Info */}
//                   <div className="absolute bottom-0 p-6 w-full">
//                      <h3 className="text-[.875rem] md:text-2xl text-left font-bold text-pink-400 mb-2">{dj.name}</h3>
//                      <p className="text-gray-300 text-left text-[.75rem] md:text-sm mb-4">{dj.bio}</p>

//                      {/* Socials */}
//                      <div className="flex gap-6">
//                         <a
//                            href={dj.instagram}
//                            target="_blank"
//                            className="text-gray-400 hover:text-pink-400 transition"
//                         >
//                            <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               viewBox="0 0 24 24"
//                               className="w-5 h-5"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth={1.6}
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                            >
//                               <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
//                               <circle cx="12" cy="12" r="3.2" />
//                               <circle cx="17.2" cy="6.8" r="0.8" />
//                            </svg>
//                         </a>
//                         <a
//                            href={dj.spotify}
//                            target="_blank"
//                            className="text-gray-400 hover:text-green-400 transition"
//                         >
//                            <Sportify />
//                         </a>
//                      </div>
//                   </div>
//                </motion.div>
//             ))}
//          </div>
//       </section>
//    );
// }

// const Sportify = () => {
//    return (
//       <svg
//          xmlns="http://www.w3.org/2000/svg"
//          viewBox="0 0 496 512"
//          className="w-5 h-5 fill-current"
//       >
//          <path
//             d="M248 8C111 8 0 119 0 256s111 248 248 248 
//                       248-111 248-248S385 8 248 8zm121.7 
//                       365.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135.5-39-207.3-23.4-3.9 
//                       1-9 2.6-12.9 2.6-10.3 0-16.8-8.1-16.8-16.3 
//                       0-10.7 6.5-15.8 14.2-17.7 
//                       81.9-18.4 165.1-16.5 236.6 26.2 
//                       6.8 4.2 10.7 8.1 10.7 17.1.1 9.7-7.8 15.1-14.8 15.1zm27.3-65.8c-5.2 
//                       0-8.7-2.3-12.6-4.5-62.8-37.1-157.9-52.3-243.7-29.4-4.8 
//                       1.3-7.4 2.6-12.6 2.6-11.6 0-21-9-21-20.6 
//                       0-11.3 5.5-19.4 16.1-22.6 
//                       30-8.1 61.3-12.9 100.7-12.9 
//                       64.8 0 127.6 16.1 180.5 46.5 
//                       9 5.2 13.9 10.3 13.9 21.9 
//                       0 11.6-9 19-21.3 19zm29-76.7c-5.2 
//                       0-8.4-1.3-13.2-3.9-71.7-42.3-198.2-46.5-276.9-26.5-3.6 
//                       1-8.1 2.6-12.9 2.6-13.2 0-23.6-10.3-23.6-23.6 
//                       0-13.2 7.1-21.6 17.7-24.5 
//                       95.9-25.8 240.7-22.9 325.8 28.1 
//                       8.4 5.2 12.9 10.3 12.9 22.3 
//                       0 13.6-11 25.5-29.8 25.5z"
//          />
//       </svg>
//    );
// };
