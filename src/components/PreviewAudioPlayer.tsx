'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type PreviewAudioPlayerProps = {
  src: string;
  title?: string;
  /** Tighter layout for marketplace cards */
  compact?: boolean;
  className?: string;
};

export default function PreviewAudioPlayer({ src, title, compact, className = '' }: PreviewAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => setLoadError('Could not play audio.'));
    } else {
      el.pause();
    }
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    setReady(false);
    setCurrent(0);
    setDuration(0);
    setLoadError(null);

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrent(el.currentTime);
    const onDuration = () => {
      setDuration(el.duration || 0);
      setReady(true);
      setLoadError(null);
    };
    const onEnded = () => {
      setPlaying(false);
      setCurrent(0);
    };
    const onError = () => {
      setLoadError('Preview could not be loaded.');
      setReady(false);
    };
    const onVolume = () => {
      setVolume(el.volume);
      setMuted(el.muted);
    };

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('durationchange', onDuration);
    el.addEventListener('loadedmetadata', onDuration);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    el.addEventListener('volumechange', onVolume);

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('durationchange', onDuration);
      el.removeEventListener('loadedmetadata', onDuration);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
      el.removeEventListener('volumechange', onVolume);
    };
  }, [src]);

  const seek = (value: number) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    el.currentTime = (value / 1000) * duration;
    setCurrent(el.currentTime);
  };

  const setVol = (value: number) => {
    const el = audioRef.current;
    if (!el) return;
    const v = value / 100;
    el.volume = v;
    el.muted = v === 0;
    setVolume(v);
    setMuted(v === 0);
  };

  const toggleMute = () => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const progressPct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className={[
        'rounded-xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)] shadow-[0_4px_24px_rgba(0,0,0,0.12)] overflow-hidden',
        compact ? 'p-3' : 'p-4 sm:p-5',
        className,
      ].join(' ')}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('button, input')) return;
        if (e.code === 'Space') {
          e.preventDefault();
          togglePlay();
        }
      }}
      role="region"
      aria-label={title ? `Audio preview: ${title}` : 'Audio preview'}
    >
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      {title && !compact && (
        <p className="text-caption text-[var(--text-muted)] mb-3 truncate" title={title}>
          {title}
        </p>
      )}

      {loadError ? (
        <p className="text-sm text-red-400">{loadError}</p>
      ) : (
        <>
          <div className={compact ? 'flex items-center gap-2' : 'flex items-center gap-3'}>
            <button
              type="button"
              onClick={togglePlay}
              className={[
                'shrink-0 rounded-full flex items-center justify-center text-white bg-[var(--accent-solid)] hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-solid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)] transition shadow-lg shadow-[var(--accent-solid)]/25',
                compact ? 'w-10 h-10' : 'w-12 h-12 sm:w-14 sm:h-14',
              ].join(' ')}
              aria-label={playing ? 'Pause preview' : 'Play preview'}
            >
              {playing ? (
                <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className={compact ? 'w-4 h-4 ml-0.5' : 'w-6 h-6 ml-1'} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-medium tabular-nums text-[var(--text-muted)]">
                <span>{formatTime(current)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="relative h-2 rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] overflow-hidden group">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] opacity-90 transition-[width] duration-150 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={duration ? (current / duration) * 1000 : 0}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Seek preview"
                />
              </div>
            </div>

            {!compact && (
              <div className="hidden sm:flex items-center gap-1.5 shrink-0 w-24">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-solid)]"
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted || volume === 0 ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={muted ? 0 : volume * 100}
                  onChange={(e) => setVol(Number(e.target.value))}
                  className="w-full h-1 accent-[var(--accent-solid)] rounded-full"
                  aria-label="Volume"
                />
              </div>
            )}
          </div>

          {!ready && !loadError && (
            <p className="mt-2 text-xs text-[var(--text-muted)]">Loading preview…</p>
          )}
        </>
      )}
    </div>
  );
}
