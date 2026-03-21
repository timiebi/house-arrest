'use client';

function getYouTubeVideoId(url: string): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    const host = u.hostname.toLowerCase();
    const allowed = host === 'youtu.be' || host.endsWith('youtube.com');
    if (!allowed) return null;
    if (host === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    const shorts = u.pathname.match(/^\/shorts\/([^/?#]+)/);
    if (shorts?.[1]) return shorts[1];
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

/**
 * Embeds a YouTube video. Only allows youtube.com / youtu.be URLs.
 * Pass the watch URL or short URL; we extract the video ID and render a responsive 16:9 iframe.
 * compact: use smaller height for cards (e.g. 140px).
 */
export default function YouTubeEmbed({
  videoUrl,
  compact = false,
  className = '',
  title = 'YouTube preview',
}: {
  videoUrl: string;
  compact?: boolean;
  className?: string;
  title?: string;
}) {
  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) return null;
  const embedSrc = `https://www.youtube.com/embed/${videoId}?rel=0`;
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-black ${className}`}
      style={compact ? { aspectRatio: '16/9', maxHeight: '140px' } : { aspectRatio: '16/9' }}
    >
      <iframe
        title={title}
        src={embedSrc}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

export { getYouTubeVideoId };
