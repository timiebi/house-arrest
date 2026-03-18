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

// SoundCloud UI contains a footer/branding area.
// We keep the height small so the controls show, but extra footer text stays hidden.
const EMBED_HEIGHT_COMPACT = 116;
const EMBED_HEIGHT_FULL = 136;
// SoundCloud iframe contains cross-origin footer/branding text that we can only hide visually.
// This overlay covers the bottom area so the text isn't visible (player still plays normally).
const COVER_FOOTER_COMPACT = 28;
const COVER_FOOTER_FULL = 34;
const PLAYER_COLOR = '#17202f';

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
  const coverFooter = compact ? COVER_FOOTER_COMPACT : COVER_FOOTER_FULL;

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
  const color = encodeURIComponent(PLAYER_COLOR);
  // Optional UI inside the iframe is controlled by supported params.
  // This should only affect visibility; playback remains inside SoundCloud.
  const embedSrc =
    `https://w.soundcloud.com/player/?url=${encoded}` +
    `&auto_play=false&hide_related=true&visual=false&color=${color}` +
    `&show_comments=false&show_user=false&show_reposts=false&show_artwork=false&show_playcount=false` +
    `&sharing=false&download=false&buying=false`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[var(--bg-elevated)] ${className}`}
      style={{ minHeight: height, height }}
    >
      {!loadEmbed ? (
        <div
          className="w-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] text-sm"
          style={{ height }}
        >
          <span>Load player</span>
        </div>
      ) : (
        <>
          <iframe
            title="SoundCloud preview"
            src={embedSrc}
            width="100%"
            height={height}
            allow="autoplay"
            className="rounded-none"
            style={{ border: 0 }}
            loading="lazy"
          />

          {/* Hide SoundCloud footer/branding text visually (cross-origin iframe). */}
          <div
            aria-hidden
            style={{
              height: coverFooter,
              backgroundColor: 'var(--bg-elevated)',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </div>
  );
}
