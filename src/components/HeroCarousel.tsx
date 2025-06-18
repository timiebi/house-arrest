'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'

const slides = [
  {
    src: "/assets/dj1.jpg",
    heading: "Welcome to House Arrest",
  },
  {
    src: "/assets/dj2.jpg",
    heading: "Where House Music Lives",
  },
  {
    src: "/assets/dj3.jpg",
    heading: "Feel the Vibe, Own the Night",
  },
  {
    src: "/assets/dj1.jpg",
    heading: "Rave Hard, Live Free",
  },
   {
    src: "/assets/dj1.jpg",
    heading: "Welcome to House Arrest",
  },
  {
    src: "/assets/dj2.jpg",
    heading: "Where House Music Lives",
  },
   {
    src: "/assets/dj1.jpg",
    heading: "Welcome to House Arrest",
  },
  {
    src: "/assets/dj2.jpg",
    heading: "Where House Music Lives",
  },
]

export default function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()])

  return (
    <div className="embla h-[80vh] overflow-hidden" ref={emblaRef}>
      <div className="embla__container flex">
        {slides.map(({ src, heading }, index) => (
          <div className="embla__slide flex-[0_0_100%] relative" key={index}>
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover brightness-50"
            />
            <div className="absolute inset-0 flex items-center justify-center bottom-[20rem]">
              <h1 className="text-white text-5xl font-heading text-center px-4">
                {heading}
              </h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
