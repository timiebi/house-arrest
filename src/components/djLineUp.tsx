export function DJLineup() {
  const djs = [
    {
      name: 'DJ Tempo',
      bio: 'Afro-house & Tech specialist.',
      img: '/assets/dj1.jpg',
      instagram: 'https://instagram.com/djtempo',
      spotify: 'https://open.spotify.com/artist/1'
    },
    {
      name: 'Lady Vibe',
      bio: 'Deep grooves and vocal house queen.',
      img: '/assets/dj2.jpg',
      instagram: 'https://instagram.com/ladyvibe',
      spotify: 'https://open.spotify.com/artist/2'
    },
     {
      name: 'DJ Tempo',
      bio: 'Afro-house & Tech specialist.',
      img: '/assets/dj1.jpg',
      instagram: 'https://instagram.com/djtempo',
      spotify: 'https://open.spotify.com/artist/1'
    },
    {
      name: 'Lady Vibe',
      bio: 'Deep grooves and vocal house queen.',
      img: '/assets/dj2.jpg',
      instagram: 'https://instagram.com/ladyvibe',
      spotify: 'https://open.spotify.com/artist/2'
    },
     {
      name: 'DJ Tempo',
      bio: 'Afro-house & Tech specialist.',
      img: '/assets/dj1.jpg',
      instagram: 'https://instagram.com/djtempo',
      spotify: 'https://open.spotify.com/artist/1'
    },
    {
      name: 'Lady Vibe',
      bio: 'Deep grooves and vocal house queen.',
      img: '/assets/dj2.jpg',
      instagram: 'https://instagram.com/ladyvibe',
      spotify: 'https://open.spotify.com/artist/2'
    }
  ];

  return (
    <section className="py-16  md:px-6 bg-black text-white text-center">
      <h2 className="text-3xl font-heading mb-10">Meet the DJ's</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {djs.map((dj, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-lg hover:scale-105 transition">
            <img src={dj.img} alt={dj.name} className="rounded-2xl h-60 w-full object-cover mb-4" />
            <h3 className="text-xl font-bold mb-2">{dj.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{dj.bio}</p>
            <div className="flex justify-center gap-4">
              <a href={dj.instagram} target="_blank">Instagram</a>
              <a href={dj.spotify} target="_blank">Spotify</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}