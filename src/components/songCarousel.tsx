"use client";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const songs = [
   {
      title: "Sunset Groove",
      artist: "DJ Nova",
      image: "/assets/dj3.jpg",
      link: "https://open.spotify.com/track/1",
   },
   {
      title: "Deep Vibe",
      artist: "Lunar Beats",
      image: "/assets/dj2.jpg",
      link: "https://open.spotify.com/track/2",
   },
   {
      title: "Night Pulse",
      artist: "Echo Flow",
      image: "/assets/dj1.jpg",
      link: "https://open.spotify.com/track/3",
   },
   {
      title: "Midnight Sky",
      artist: "Aurora Wave",
      image: "/assets/dj3.jpg",
      link: "https://open.spotify.com/track/4",
   },
   {
      title: "Ocean Lights",
      artist: "Neon Tide",
      image: "/assets/dj2.jpg",
      link: "https://open.spotify.com/track/5",
   },
   {
      title: "Bass Horizon",
      artist: "Pulse Driver",
      image: "/assets/dj1.jpg",
      link: "https://open.spotify.com/track/6",
   },
];

function Tag({ children, color = "gray" }: { children: React.ReactNode; color?: "pink" | "gray" }) {
   const base =
      "px-2 py-1 text-[10px] rounded-full transition-transform duration-200 group-hover:scale-105";
   return (
      <span
         className={`${base} ${
            color === "pink" ? "bg-pink-600/20 text-pink-400" : "bg-gray-800/60 text-gray-300"
         }`}
      >
         {children}
      </span>
   );
}

function SongCard({
   song,
   priority = false,
}: {
   song: (typeof songs)[number];
   priority?: boolean;
}) {
   return (
      <a
         href={song.link}
         target="_blank"
         rel="noopener noreferrer"
         className="block w-80 group transform hover:-translate-y-2 hover:scale-[1.03] transition-all duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded-2xl"
      >
         <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-pink-500/50 transition-shadow duration-500">
            <Image
               src={song.image}
               alt={`${song.title} by ${song.artist}`}
               fill
               priority={priority}
               className="object-cover rounded-2xl"
            />

            {/* gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />

            {/* play + text */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
               <div className="w-14 h-14 rounded-full bg-pink-500 flex items-center justify-center shadow-lg animate-pulse group-hover:scale-110 group-hover:rotate-6 group-hover:brightness-110 transition-transform duration-300">
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     className="w-7 h-7 text-white"
                     viewBox="0 0 24 24"
                     fill="currentColor"
                  >
                     <path d="M8 5v14l11-7z" />
                  </svg>
               </div>
               <div className="text-left truncate">
                  <div className="text-lg font-semibold text-white truncate max-w-[200px]">
                     {song.title}
                  </div>
                  <div className="text-sm text-gray-300">{song.artist}</div>
               </div>
            </div>
         </div>

         <div className="px-2 pt-3 flex gap-2">
            <Tag>Listen</Tag>
            <Tag color="pink">Streaming</Tag>
         </div>
      </a>
   );
}

export default function SongCarousel() {
   const [emblaRef, emblaApi] = useEmblaCarousel(
      { loop: true, align: "center", skipSnaps: false, containScroll: "trimSnaps" },
      [
         Autoplay({
            delay: 6000, // stays longer before sliding
            stopOnInteraction: true,
            stopOnMouseEnter: true,
            playOnInit: true,
         }),
      ],
   );

   const [selectedIndex, setSelectedIndex] = useState(0);
   const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

   const onSelect = useCallback(() => {
      if (!emblaApi) return;
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setScrollSnaps(emblaApi.scrollSnapList());
   }, [emblaApi]);

   useEffect(() => {
      if (!emblaApi) return;
      onSelect();
      emblaApi.on("select", onSelect);
      emblaApi.on("reInit", onSelect);
      return () => {
         emblaApi.off("select", onSelect);
         emblaApi.off("reInit", onSelect);
      };
   }, [emblaApi, onSelect]);

   useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
         if (!emblaApi) return;
         if (e.key === "ArrowLeft") emblaApi.scrollPrev();
         if (e.key === "ArrowRight") emblaApi.scrollNext();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
   }, [emblaApi]);

   const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
   const scrollNext = () => emblaApi && emblaApi.scrollNext();
   const scrollTo = (i: number) => emblaApi && emblaApi.scrollTo(i);

   return (
      <section className="relative pb-6 pt-4  overflow-hidden">
         {/* animated gradient background */}
         <div className="absolute inset-0 -z-10">
            <div className="w-full h-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 bg-[length:200%_200%] animate-[gradientShift_12s_ease_infinite] opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_70%)] animate-pulse" />
         </div>

         <div className="relative max-w-6xl mx-auto">
            <div className="embla overflow-hidden" ref={emblaRef}>
               <div className="embla__container flex px-6 py-12">
                  {songs.map((song, i) => (
                     <div key={i} className="flex-none px-3">
                        <SongCard song={song} priority={i === 0} />
                     </div>
                  ))}
               </div>
            </div>

            {/* navigation buttons */}
            <button
               aria-label="Previous"
               onClick={scrollPrev}
               className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-pink-500/70 transition"
            >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                     d="M15 18L9 12L15 6"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
               </svg>
            </button>
            <button
               aria-label="Next"
               onClick={scrollNext}
               className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-pink-500/70 transition"
            >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                     d="M9 18L15 12L9 6"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
               </svg>
            </button>

            {/* dots */}
            <div className="flex justify-center items-center gap-2 mt-8">
               {scrollSnaps.map((_, i) => (
                  <button
                     key={i}
                     onClick={() => scrollTo(i)}
                     className={`h-2 rounded-full transition-all duration-300 ${
                        i === selectedIndex
                           ? "w-10 bg-pink-500"
                           : "w-2 bg-gray-500/50 hover:bg-gray-400/70"
                     }`}
                  />
               ))}
            </div>
         </div>

         {/* keyframes for animated gradient */}
         <style jsx>{`
            @keyframes gradientShift {
               0% {
                  background-position: 0% 50%;
               }
               50% {
                  background-position: 100% 50%;
               }
               100% {
                  background-position: 0% 50%;
               }
            }
         `}</style>
      </section>
   );
}
