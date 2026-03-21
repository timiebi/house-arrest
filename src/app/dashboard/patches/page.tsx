'use client';

import { supabase } from '@/lib/supabaseClient';
import type { Patch, PatchInsert } from '@/types/patches';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import LogoLoader from '@/components/LogoLoader';
import { validatePreviewUrls, isLikelyPreviewAudioFile } from '@/lib/validatePreviewUrls';

const BUCKET = 'patches';

export default function DashboardPatchesPage() {
  const [patches, setPatches] = useState<Patch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price_cents: 990,
    currency: 'USD',
    status: 'draft' as 'draft' | 'published',
    delivery_url: '',
    soundcloud_url: '',
    youtube_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPatches = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('patches')
      .select('*')
      .order('created_at', { ascending: false });
    if (fetchError) setError(fetchError.message);
    else setPatches((data as Patch[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPatches();
  }, [fetchPatches]);

  const uploadFile = async (file: File, prefix: string): Promise<string | null> => {
    const ext = file.name.split('.').pop() || 'bin';
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const extLower = ext.toLowerCase();
    const inferredContentType =
      file.type ||
      (extLower === 'zip' ? 'application/zip' : undefined) ||
      (extLower === 'wav' ? 'audio/wav' : undefined) ||
      (extLower === 'mp3' || extLower === 'mpeg' ? 'audio/mpeg' : undefined) ||
      (extLower === 'm4a' || extLower === 'mp4' ? 'audio/mp4' : undefined) ||
      (extLower === 'ogg' ? 'audio/ogg' : undefined) ||
      (extLower === 'flac' ? 'audio/flac' : undefined);

    const uploadOptions: { upsert: boolean; contentType?: string } = { upsert: true };
    if (inferredContentType) uploadOptions.contentType = inferredContentType;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, uploadOptions);
    if (uploadError) {
      const msg = uploadError.message?.toLowerCase() || '';
      if (msg.includes('payload') || msg.includes('large') || msg.includes('size')) {
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
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);

    const urlErr = validatePreviewUrls(form.youtube_url, form.soundcloud_url);
    if (urlErr) {
      setError(urlErr);
      setSaving(false);
      return;
    }

    if (previewFile && !isLikelyPreviewAudioFile(previewFile)) {
      setError('Preview upload should be an audio file (e.g. MP3, WAV, M4A).');
      setSaving(false);
      return;
    }

    const filePath = 'placeholder/pending';

    let image_path: string | null = null;
    let image_url: string | null = null;
    if (imageFile) {
      const imgPath = await uploadFile(imageFile, 'covers');
      if (!imgPath) {
        setSaving(false);
        return;
      }
      image_path = imgPath;
      image_url = getPublicUrl(imgPath);
    }

    let preview_path: string | null = null;
    let preview_url: string | null = null;
    if (previewFile) {
      const prevPath = await uploadFile(previewFile, 'previews');
      if (!prevPath) {
        setSaving(false);
        return;
      }
      preview_path = prevPath;
      preview_url = getPublicUrl(prevPath);
    }

    const insertData: PatchInsert = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price_cents: Number(form.price_cents) || 0,
      currency: form.currency,
      file_path: filePath,
      delivery_url: form.delivery_url.trim() || null,
      image_path,
      image_url,
      preview_path,
      preview_url,
      soundcloud_url: form.soundcloud_url.trim() || null,
      youtube_url: form.youtube_url.trim() || null,
      status: form.status,
    };

    const { error: insertError } = await supabase.from('patches').insert([insertData]);

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setForm({ name: '', description: '', price_cents: 990, currency: 'USD', status: 'draft', delivery_url: '', soundcloud_url: '', youtube_url: '' });
    setImageFile(null);
    setPreviewFile(null);
    setSuccessMessage('Sample pack added');
    setTimeout(() => setSuccessMessage(null), 4000);
    await fetchPatches();
    setSaving(false);
  };

  const toggleStatus = async (patch: Patch) => {
    const next = patch.status === 'published' ? 'draft' : 'published';
    await supabase
      .from('patches')
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq('id', patch.id);
    fetchPatches();
  };

  const deletePatch = async (patch: Patch) => {
    if (!confirm('Delete this sample pack? This cannot be undone.')) return;
    setError(null);

    const storagePaths = [patch.file_path, patch.image_path, patch.preview_path].filter(
      (path): path is string => Boolean(path) && path !== 'placeholder/pending'
    );

    if (storagePaths.length > 0) {
      const { error: storageDeleteError } = await supabase.storage.from(BUCKET).remove(storagePaths);
      if (storageDeleteError) {
        setError(`Delete failed. Could not remove files from storage: ${storageDeleteError.message}`);
        return;
      }
    }

    const { error: deleteError } = await supabase.from('patches').delete().eq('id', patch.id);
    if (deleteError) {
      setError(`Delete failed. Could not remove pack: ${deleteError.message}`);
      return;
    }

    fetchPatches();
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-page-title text-[var(--text-primary)]">Sample packs</h1>
        <p className="text-body-sm text-[var(--text-muted)] mt-0.5">
          Add and manage sample packs. Published items appear on the <Link href="/marketplace" className="text-link-accent hover:underline">store</Link>.
        </p>
      </div>

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

      {/* New sample pack form */}
      <section className="mb-8 p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <h2 className="text-section-title text-[var(--text-primary)] mb-4">New sample pack</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-label text-[var(--text-secondary)] mb-1.5">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. House Essentials Vol. 1"
                className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
              />
            </div>
            <div>
              <label className="block text-label text-[var(--text-secondary)] mb-1.5">Price (USD)</label>
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
            <label className="block text-label text-[var(--text-secondary)] mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short description for the store"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)] resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-label text-[var(--text-secondary)] mb-1.5">Paid pack link (Google Drive)</label>
              <input
                type="url"
                value={form.delivery_url}
                onChange={(e) => setForm((f) => ({ ...f, delivery_url: e.target.value }))}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
              />
              <p className="mt-1 text-caption">Required to deliver the paid full pack after purchase.</p>
            </div>
            <div>
              <label className="block text-label text-[var(--text-secondary)] mb-1.5">Cover image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[var(--bg-elevated)] file:text-[var(--text-primary)] file:text-xs"
              />
            </div>
            <div>
              <label className="block text-label text-[var(--text-secondary)] mb-1.5">Preview audio (optional)</label>
              <input
                type="file"
                accept="audio/*,.mp3,.mpeg,.wav,.m4a,.aac,.ogg,.flac"
                onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[var(--bg-elevated)] file:text-[var(--text-primary)] file:text-xs"
              />
              <p className="mt-1 text-caption">Hosted on your storage. Shown first if set.</p>
            </div>
          </div>
          <div>
            <p className="text-label text-[var(--text-secondary)] mb-1.5">Preview links (optional) — YouTube or SoundCloud</p>
            <p className="text-caption mb-2">
              You can add a file above <strong>and</strong> links here. The store plays <strong>uploaded audio first</strong>, then SoundCloud, then YouTube.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-label mb-1">YouTube</label>
                <input
                  type="url"
                  value={form.youtube_url}
                  onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
                />
              </div>
              <div>
                <label className="block text-label mb-1">SoundCloud</label>
                <input
                  type="url"
                  value={form.soundcloud_url}
                  onChange={(e) => setForm((f) => ({ ...f, soundcloud_url: e.target.value }))}
                  placeholder="https://soundcloud.com/artist/track"
                  className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
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
              className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--accent-solid)] text-white hover:opacity-90 disabled:opacity-50 transition"
            >
              {saving ? 'Adding…' : 'Add sample pack'}
            </button>
          </div>
        </form>
      </section>

      {/* Sample packs list */}
      <section>
        <h2 className="text-section-title text-[var(--text-primary)] mb-3">All sample packs</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <LogoLoader size="md" />
          </div>
        ) : patches.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-6">No sample packs yet. Add one above.</p>
        ) : (
          <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-card)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patches.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border-subtle)] last:border-0">
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{p.name}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {(p.price_cents / 100).toFixed(2)} {p.currency}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        p.status === 'published'
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard/patches/${p.id}`}
                        className="text-xs font-medium text-[var(--accent-via)] hover:underline mr-3"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleStatus(p)}
                        className="text-xs font-medium text-[var(--accent-via)] hover:underline mr-3"
                      >
                        {p.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePatch(p)}
                        className="text-xs font-medium text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
