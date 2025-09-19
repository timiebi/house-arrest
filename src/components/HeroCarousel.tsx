'use client';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type Slide = { src: string; heading: string; sub?: string }

const slides: Slide[] = [
   { src: '/assets/dj4.jpeg', heading: 'Where House Music Lives', sub: 'Beats. Lights. Family.' },
  { src: '/assets/dj6.jpg', heading: 'Welcome to House Arrest', sub: 'Underground energy, pure house.' },
  { src: '/assets/dj24.png', heading: 'Feel the Vibe, Own the Night', sub: 'Lose yourself. Find your people.' },
  { src: '/assets/dj7.jpg', heading: 'Rave Hard, Live Free', sub: 'No rules. Just rhythm.' },
  { src: '/assets/dj9.JPG', heading: 'Back-to-back Anthems', sub: 'Feel the flow all night.' },
]
 
export default function HeroCarousel() {
  const autoplay = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: false, skipSnaps: false },
    [autoplay.current]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', () => {
      setScrollSnaps(emblaApi.scrollSnapList())
      onSelect()
    })
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((idx: number) => emblaApi?.scrollTo(idx), [emblaApi])

  return (
    <section className="relative overflow-hidden w-full h-[60vh] sm:h-[70vh] md:h-[85vh]" aria-roledescription="carousel">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map(({ src, heading, sub }, i) => (
            <div key={i} className="embla__slide relative h-full min-w-0 flex-[0_0_100%] select-none">
              <Image src={src} alt={heading} fill className="object-cover" sizes="100vw" priority={i === 0} />

              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end md:justify-center items-center text-center px-4 sm:px-6 md:px-10 pb-12 md:pb-0">
                <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-heading drop-shadow-xl leading-tight">
                  {heading}
                </h1>
                {sub && (
                  <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-xl text-white/90 font-body drop-shadow">
                    {sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-6">
        <button
          onClick={scrollPrev}
          className="pointer-events-auto bg-white/10 backdrop-blur-md hover:bg-white/20 transition rounded-full p-2 sm:p-3 md:p-4"
          aria-label="Previous slide"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white">
            <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button
          onClick={scrollNext}
          className="pointer-events-auto bg-white/10 backdrop-blur-md hover:bg-white/20 transition rounded-full p-2 sm:p-3 md:p-4"
          aria-label="Next slide"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white">
            <path fill="currentColor" d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L12.17 12z"/>
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {scrollSnaps.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-2 w-2 rounded-full transition ${i === selectedIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
