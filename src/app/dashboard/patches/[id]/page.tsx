'use client';

import { supabase } from '@/lib/supabaseClient';
import type { Patch } from '@/types/patches';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import LogoLoader from '@/components/LogoLoader';

const BUCKET = 'patches';

export default function EditPatchPage() {
  const params = useParams();
  const id = params?.id as string;
  const [patch, setPatch] = useState<Patch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price_cents: 990,
    currency: 'USD',
    status: 'draft' as 'draft' | 'published',
    soundcloud_url: '',
    youtube_url: '',
  });
  const [packFile, setPackFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const fetchPatch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error: e } = await supabase.from('patches').select('*').eq('id', id).single();
    if (e) {
      setError(e.message);
      setPatch(null);
    } else {
      const p = data as Patch;
      setPatch(p);
      setForm({
        name: p.name,
        description: p.description ?? '',
        price_cents: p.price_cents,
        currency: p.currency,
        status: p.status,
        soundcloud_url: p.soundcloud_url ?? '',
        youtube_url: p.youtube_url ?? '',
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchPatch();
  }, [fetchPatch]);

  const uploadFile = async (file: File, prefix: string): Promise<string | null> => {
    const ext = file.name.split('.').pop() || 'bin';
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (uploadError) {
      if (uploadError.message?.toLowerCase().includes('payload') || uploadError.message?.toLowerCase().includes('large') || uploadError.message?.toLowerCase().includes('size')) {
        setError('File is too large. Try a smaller ZIP or split the pack. Recommended: under 100MB.');
      } else {
        setError(uploadError.message);
      }
      return null;
    }
    return path;
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patch || !form.name.trim()) return;
    setSaving(true);
    setError(null);

    let file_path: string | undefined;
    if (packFile) {
      const path = await uploadFile(packFile, 'audio');
      if (!path) {
        setSaving(false);
        return;
      }
      file_path = path;
    }

    let image_path: string | null | undefined;
    let image_url: string | null | undefined;
    if (imageFile) {
      const imgPath = await uploadFile(imageFile, 'covers');
      if (!imgPath) {
        setSaving(false);
        return;
      }
      image_path = imgPath;
      image_url = getPublicUrl(imgPath);
    }

    let preview_path: string | null | undefined;
    let preview_url: string | null | undefined;
    if (previewFile) {
      const prevPath = await uploadFile(previewFile, 'previews');
      if (!prevPath) {
        setSaving(false);
        return;
      }
      preview_path = prevPath;
      preview_url = getPublicUrl(prevPath);
    }

    const updatePayload: Record<string, unknown> = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price_cents: Number(form.price_cents) || 0,
      currency: form.currency,
      status: form.status,
      soundcloud_url: form.soundcloud_url.trim() || null,
      youtube_url: form.youtube_url.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (file_path !== undefined) updatePayload.file_path = file_path;
    if (image_path !== undefined) updatePayload.image_path = image_path;
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (preview_path !== undefined) updatePayload.preview_path = preview_path;
    if (preview_url !== undefined) updatePayload.preview_url = preview_url;

    const { error: updateError } = await supabase.from('patches').update(updatePayload).eq('id', id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    setSuccessMessage('Sample pack updated');
    setTimeout(() => setSuccessMessage(null), 3000);
    setPackFile(null);
    setImageFile(null);
    setPreviewFile(null);
    fetchPatch();
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-16">
        <LogoLoader size="md" />
      </div>
    );
  }

  if (!patch) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-muted)]">Pack not found.</p>
        <Link href="/dashboard/patches" className="mt-4 inline-block text-link-accent hover:underline">
          ← Back to sample packs
        </Link>
      </div>
    );
  }

  const hasCurrentFile = patch.file_path && patch.file_path !== 'placeholder/pending';

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/dashboard/patches" className="text-link-muted hover:text-[var(--accent-via)]">
        ← Back to sample packs
      </Link>
      <h1 className="text-page-title text-[var(--text-primary)] mt-4 mb-6">Edit sample pack</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. House Essentials Vol. 1"
              className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Price (USD)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.price_cents / 100}
              onChange={(e) => setForm((f) => ({ ...f, price_cents: Math.round((parseFloat(e.target.value) || 0) * 100) }))}
              className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description for the store"
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Replace pack file (full pack ZIP)</label>
          <p className="text-xs text-[var(--text-muted)] mb-1.5">
            {hasCurrentFile ? 'Current: file uploaded. Upload a new ZIP to replace it.' : 'Current: no file. Upload a ZIP to make this pack downloadable.'}
          </p>
          <input
            type="file"
            accept=".zip,audio/*,.wav,.mp3"
            onChange={(e) => setPackFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[var(--accent-solid)] file:text-white file:text-xs"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">Recommended under 100MB. One ZIP with all WAV/MP3 loops.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Replace cover image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[var(--bg-elevated)] file:text-[var(--text-primary)] file:text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Replace preview audio (short MP3)</label>
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,.mp3"
            onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[var(--bg-elevated)] file:text-[var(--text-primary)] file:text-xs"
          />
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-1.5">Preview — YouTube or SoundCloud</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">YouTube</label>
              <input
                type="url"
                value={form.youtube_url}
                onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">SoundCloud</label>
              <input
                type="url"
                value={form.soundcloud_url}
                onChange={(e) => setForm((f) => ({ ...f, soundcloud_url: e.target.value }))}
                placeholder="https://soundcloud.com/artist/track"
                className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
            className="px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--accent-solid)] text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
