'use client';

import { useEffect, useRef, useState } from 'react';

function isSoundCloudUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.hostname.toLowerCase().endsWith('soundcloud.com');
  } catch {
    return false;
  }
}

const EMBED_HEIGHT_COMPACT = 126; // minimal play bar when show_artwork=false
const EMBED_HEIGHT_FULL = 166;

/**
 * SoundCloud embed: no artwork so custom pack image takes over; users can still play.
 * Lazy-loads when in viewport.
 */
export default function SoundCloudEmbed({
  trackUrl,
  compact = false,
  className = '',
}: {
  trackUrl: string;
  compact?: boolean;
  className?: string;
}) {
  const [loadEmbed, setLoadEmbed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const height = compact ? EMBED_HEIGHT_COMPACT : EMBED_HEIGHT_FULL;

  useEffect(() => {
    if (!trackUrl?.trim() || !isSoundCloudUrl(trackUrl)) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setLoadEmbed(true);
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trackUrl]);

  if (!trackUrl?.trim() || !isSoundCloudUrl(trackUrl)) return null;

  const encoded = encodeURIComponent(trackUrl.trim());
  const embedSrc = `https://w.soundcloud.com/player/?url=${encoded}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_artwork=false&visual=false`;

  return (
    <div ref={containerRef} className={className} style={{ minHeight: height }}>
      {!loadEmbed ? (
        <div
          className="w-full rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] text-sm"
          style={{ height }}
        >
          <span>Load player</span>
        </div>
      ) : (
        <iframe
          title="SoundCloud preview"
          src={embedSrc}
          width="100%"
          height={height}
          allow="autoplay"
          className="rounded-lg"
          style={{ border: 0 }}
          loading="lazy"
        />
      )}
    </div>
  );
}
