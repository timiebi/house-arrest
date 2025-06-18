'use client';

import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

export function VibesGallery() {
  const photos = [
    { src: '/assets/dj1.jpg', width: 1, height: 1 },
    { src: '/assets/dj2.jpg', width: 1, height: 1 },
    { src: '/assets/dj3.jpg', width: 1, height: 1 },
     { src: '/assets/dj1.jpg', width: 1, height: 1 },
    { src: '/assets/dj2.jpg', width: 1, height: 1 },
    { src: '/assets/dj3.jpg', width: 1, height: 1 }
  ];

  return (
    <section className="py-16 px-6 bg-black text-white text-center">
      <h2 className="text-3xl font-heading mb-10">Gallery</h2>
      <div className="max-w-5xl mx-auto">
        <RowsPhotoAlbum photos={photos} />
      </div>
    </section>
  );
}
