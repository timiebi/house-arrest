"use client";

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

  const imageUrls = [
    "/assets/dj1.jpg",
    "/assets/dj16.jpg",
    "/assets/dj18.jpg",
    "/assets/dj24.png",
    "/assets/dj25.png",
    "/assets/dj26.png",
    "/assets/dj12.jpg",
    "/assets/dj14.jpg",
    "/assets/dj15.jpg",
    "/assets/dj2.jpg",
    "/assets/dj17.jpg",
    "/assets/dj19.jpg",
    "/assets/dj23.jpg",
    "/assets/dj3.jpg",
    "/assets/dj10.jpg",
    "/assets/dj22.jpg",
  ];

  useEffect(() => {
    const loadImages = async () => {
      const loadedPhotos = await Promise.all(
        imageUrls.map(
          (url) =>
            new Promise<{ src: string; width: number; height: number }>((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = () => {
                resolve({ src: url, width: img.naturalWidth, height: img.naturalHeight });
              };
              img.onerror = () => {
                // Skip broken images
                resolve({ src: url, width: 1, height: 1 });
              };
            })
        )
      );
      setPhotos(loadedPhotos);
    };

    loadImages();
  }, []);

  return (
    <motion.section
      className="relative py-28 px-6 text-center bg-gradient-to-b from-black via-gray-950 to-black"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* Ambient glow backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
      </div>

      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-heading mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
        Vibes Gallery
      </h2>

      {/* Subtitle */}
      <p className="text-gray-400 font-body text-lg max-w-2xl mx-auto mb-12">
        A glimpse into the energy, the music, and the people that make{" "}
        <span className="text-pink-400 font-semibold">House Arrest</span> unforgettable.
      </p>

      {/* Photo Album */}
      <div className="max-w-6xl mx-auto">
        <RowsPhotoAlbum photos={photos} spacing={10} targetRowHeight={260} />
      </div>

      {/* Footer Tag */}
      <div className="mt-14 inline-block px-4 py-2 rounded-full bg-gray-800/60 border border-gray-700 text-sm text-gray-300 tracking-wide">
        📸 Capturing the vibe
      </div>
    </motion.section>
  );
}
