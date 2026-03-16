'use client';

import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export function VibesGallery() {
  const [photos, setPhotos] = useState<{ src: string; width: number; height: number }[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('url, path')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const loadedPhotos = await Promise.all(
          data.map(async (img) => {
            const tempImg = new Image();
            tempImg.src = img.url;
            await tempImg.decode().catch(() => {}); // fail-safe if image doesn't load
            return {
              src: img.url,
              width: tempImg.naturalWidth || 800,
              height: tempImg.naturalHeight || 600,
            };
          })
        );
        setPhotos(loadedPhotos);
      }
    };

    fetchGallery();

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const displayedPhotos = isMobile && !showAll ? photos.slice(0, 5) : photos;

  return (
    <motion.section
      className="relative w-full py-12 md:py-28 px-4 sm:px-6 md:px-8 text-center bg-[var(--bg-card)] border-y border-[var(--border-subtle)]"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: 0.3, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.06 }}
    >
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,var(--accent-solid)_0%,transparent_70%)] opacity-[0.08]" />
      </div>

      <h2 className="text-display text-2xl sm:text-3xl md:text-4xl mb-6 bg-gradient-to-r from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] bg-clip-text text-transparent">
        Vibes Gallery
      </h2>

      <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-12">
        Step inside the world of{" "}
        <span className="text-[var(--accent-via)] font-semibold">Sigag Lauren</span> — from electrifying DJ sets 
        to the unforgettable energy that defines the nights. These moments capture the beats, the lights, 
        and the people who make it all come alive.
      </p>

      <div className="max-w-6xl mx-auto">
        <RowsPhotoAlbum photos={displayedPhotos} spacing={10} targetRowHeight={260} />
      </div>

      {isMobile && photos.length > 5 && (
        <div className="mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-5 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition"
          >
            {showAll ? "View Less" : "View More"}
          </button>
        </div>
      )}

      <div className="mt-14 inline-block px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] tracking-wide">
        📸 Capturing the vibe
      </div>
    </motion.section>
  );
}





// "use client";

// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";
// import { RowsPhotoAlbum } from "react-photo-album";
// import "react-photo-album/rows.css";

// const fadeIn = {
//   hidden: { opacity: 0, y: 40 },
//   visible: { opacity: 1, y: 0 },
// };

// export function VibesGallery() {
//   const [photos, setPhotos] = useState<{ src: string; width: number; height: number }[]>([]);
//   const [showAll, setShowAll] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   const imageUrls = [
//     "/assets/dj1.jpg",
//     "/assets/dj16.jpg",
//     "/assets/dj18.jpg",
//     "/assets/dj24.png",
//     "/assets/dj25.png",
//     "/assets/dj26.png",
//     "/assets/dj12.jpg",
//     "/assets/dj14.jpg",
//     "/assets/dj15.jpg",
//     "/assets/dj2.jpg",
//     "/assets/dj17.jpg",
//     "/assets/dj19.jpg",
//     "/assets/dj23.jpg",
//     "/assets/dj3.jpg",
//     "/assets/dj10.jpg",
//     "/assets/dj22.jpg",
//   ];

//   useEffect(() => {
//     const loadImages = async () => {
//       const loadedPhotos = await Promise.all(
//         imageUrls.map(
//           (url) =>
//             new Promise<{ src: string; width: number; height: number }>((resolve) => {
//               const img = new Image();
//               img.src = url;
//               img.onload = () => {
//                 resolve({ src: url, width: img.naturalWidth, height: img.naturalHeight });
//               };
//               img.onerror = () => {
//                 resolve({ src: url, width: 1, height: 1 });
//               };
//             })
//         )
//       );
//       setPhotos(loadedPhotos);
//     };

//     loadImages();

//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const displayedPhotos = isMobile && !showAll ? photos.slice(0, 5) : photos;

//   return (
//     <motion.section
//       className="relative py-15 md:py-28 px-6 text-center bg-[var(--bg-card)] border-y border-[var(--border-subtle)]"
//       variants={fadeIn}
//       initial="hidden"
//       whileInView="visible"
//       transition={{ duration: 0.8, ease: "easeOut" }}
//       viewport={{ once: true }}
//     >
//       {/* Ambient glow backdrop */}
//       <div className="absolute inset-0 -z-10">
//         <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
//       </div>

//       {/* Heading */}
//       <h2 className="text-4xl md:text-5xl font-heading mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
//         Vibes Gallery
//       </h2>

//       {/* Subtitle */}
//       <p className="text-[var(--text-secondary)] font-body text-lg max-w-2xl mx-auto mb-12">
//         Step inside the world of{" "}
//         <span className="text-pink-400 font-semibold">Sigag Lauren</span> — from electrifying DJ sets 
//         to the unforgettable energy that defines the nights. These moments capture the beats, the lights, 
//         and the people who make it all come alive.
//       </p>

//       {/* Photo Album */}
//       <div className="max-w-6xl mx-auto">
//         <RowsPhotoAlbum photos={displayedPhotos} spacing={10} targetRowHeight={260} />
//       </div>

//       {/* View More button for mobile */}
//       {isMobile && photos.length > 5 && (
//         <div className="mt-8">
//           <button
//             onClick={() => setShowAll(!showAll)}
//             className="px-5 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition"
//           >
//             {showAll ? "View Less" : "View More"}
//           </button>
//         </div>
//       )}

//       {/* Footer Tag */}
//       <div className="mt-14 inline-block px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] tracking-wide">
//         📸 Capturing the vibe
//       </div>
//     </motion.section>
//   );
// }
