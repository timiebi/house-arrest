export type Patch = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  /** Supabase Storage path (private bucket) */
  file_path: string;
  /** Paid full-pack link destination (e.g., Google Drive), used by backend download flow */
  delivery_url: string | null;
  /** Optional cover/art image path in Storage */
  image_path: string | null;
  /** Public URL for cover image (or null) */
  image_url: string | null;
  /** Optional short preview audio (30–60s); Storage path */
  preview_path: string | null;
  /** Optional; public or signed URL for preview playback on store */
  preview_url: string | null;
  /** Optional SoundCloud track URL for preview; used if no uploaded preview_url */
  soundcloud_url: string | null;
  /** Optional YouTube URL for preview; used if no preview_url and no SoundCloud */
  youtube_url: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
};

export type PatchInsert = Omit<Patch, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PatchUpdate = Partial<Omit<Patch, 'id' | 'created_at'>>;
