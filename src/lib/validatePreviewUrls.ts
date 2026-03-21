/**
 * Empty string is valid (optional field).
 */
export function isValidYoutubePreviewUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return true;
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const h = u.hostname.toLowerCase();
    return (
      h === 'youtube.com' ||
      h === 'www.youtube.com' ||
      h === 'm.youtube.com' ||
      h === 'music.youtube.com' ||
      h === 'youtu.be' ||
      h === 'www.youtu.be'
    );
  } catch {
    return false;
  }
}

export function isValidSoundcloudPreviewUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return true;
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const h = u.hostname.toLowerCase();
    return h === 'soundcloud.com' || h.endsWith('.soundcloud.com');
  } catch {
    return false;
  }
}

export function validatePreviewUrls(youtube_url: string, soundcloud_url: string): string | null {
  if (!isValidYoutubePreviewUrl(youtube_url)) {
    return 'YouTube URL must be a valid youtube.com or youtu.be link.';
  }
  if (!isValidSoundcloudPreviewUrl(soundcloud_url)) {
    return 'SoundCloud URL must be a valid soundcloud.com link.';
  }
  return null;
}

const PREVIEW_AUDIO_EXT = new Set(['mp3', 'mpeg', 'wav', 'm4a', 'aac', 'ogg', 'webm', 'flac']);

export function isLikelyPreviewAudioFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (PREVIEW_AUDIO_EXT.has(ext)) return true;
  if (file.type.startsWith('audio/')) return true;
  return false;
}
