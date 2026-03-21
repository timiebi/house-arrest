import type { Patch } from '@/types/patches';

export type PackPreviewSource =
  | { kind: 'audio'; src: string }
  | { kind: 'soundcloud'; url: string }
  | { kind: 'youtube'; url: string };

/**
 * Single preview shown on the store: hosted MP3 first, then SoundCloud, then YouTube.
 * Admin can set all three; only the first available wins.
 */
export function getPackPreview(pack: Pick<Patch, 'preview_url' | 'soundcloud_url' | 'youtube_url'>): PackPreviewSource | null {
  const preview = pack.preview_url?.trim();
  if (preview) return { kind: 'audio', src: preview };

  const sc = pack.soundcloud_url?.trim();
  if (sc) return { kind: 'soundcloud', url: sc };

  const yt = pack.youtube_url?.trim();
  if (yt) return { kind: 'youtube', url: yt };

  return null;
}

export function packHasAnyPreviewField(pack: Pick<Patch, 'preview_url' | 'soundcloud_url' | 'youtube_url'>): boolean {
  return Boolean(pack.preview_url?.trim() || pack.soundcloud_url?.trim() || pack.youtube_url?.trim());
}
