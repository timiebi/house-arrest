'use client'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'

const songs = [
  {
    title: 'Sunset Groove',
    image: "/assets/dj3.jpg",
    link: 'https://open.spotify.com/track/1'
  },
  {
    title: 'Deep Vibe',
    image: "/assets/dj2.jpg",

    link: 'https://open.spotify.com/track/2'
  },
  {
    title: 'Night Pulse',
    image: "/assets/dj1.jpg",
    link: 'https://open.spotify.com/track/3'
  }
]

export default function SongCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' })

  return (
    <div className="embla overflow-hidden" ref={emblaRef}>
      <div className="embla__container flex gap-6 px-6">
        {songs.map((song, i) => (
          <a
            key={i}
            href={song.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none w-64 transform hover:scale-105 transition-transform duration-300"
          >
            <div className="relative w-full h-64">
              <Image
                src={song.image}
                alt={song.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <h3 className="text-center mt-2 text-white font-semibold">{song.title}</h3>
          </a>
        ))}
      </div>
    </div>
  )
}