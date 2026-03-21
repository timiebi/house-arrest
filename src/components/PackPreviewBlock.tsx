'use client';

import type { Patch } from '@/types/patches';
import { getPackPreview } from '@/lib/packPreview';
import PreviewAudioPlayer from '@/components/PreviewAudioPlayer';
import SoundCloudEmbed from '@/components/SoundCloudEmbed';
import YouTubeEmbed from '@/components/YouTubeEmbed';

type PackPreviewBlockProps = {
  pack: Pick<Patch, 'preview_url' | 'soundcloud_url' | 'youtube_url' | 'name'>;
  /** YouTube / SoundCloud title */
  title?: string;
  compact?: boolean;
  className?: string;
};

export default function PackPreviewBlock({ pack, title, compact, className }: PackPreviewBlockProps) {
  const source = getPackPreview(pack);
  if (!source) return null;

  const label = title ?? pack.name;

  if (source.kind === 'audio') {
    return (
      <PreviewAudioPlayer
        src={source.src}
        title={compact ? undefined : `Preview — ${label}`}
        compact={compact}
        className={className}
      />
    );
  }

  if (source.kind === 'soundcloud') {
    return (
      <div className={className} onClick={(e) => e.stopPropagation()}>
        <SoundCloudEmbed trackUrl={source.url} compact={compact} className="w-full" />
      </div>
    );
  }

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <YouTubeEmbed videoUrl={source.url} compact={compact} title={`Preview: ${label}`} />
    </div>
  );
}
