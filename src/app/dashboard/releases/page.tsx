'use client'

import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

type Release = {
  id: string
  title: string
  artist?: string
  spotify_url: string
  image_url?: string | null
  image_path?: string | null
  created_at?: string
}

export default function ReleasesPageUI() {
  const toast = useToast()
  const [releases, setReleases] = useState<Release[]>([])
  const [newRelease, setNewRelease] = useState({ title: '', artist: '', spotify_url: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch all releases
  const fetchReleases = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('releases')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.log('Error fetching releases:', error)
    else setReleases(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchReleases()
  }, [])

  // Upload image to Supabase bucket
  const uploadImage = async (file: File) => {
    if (!file) return null

    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('releases')
      .upload(fileName, file, { upsert: true })

    if (error) {
      console.error('Upload error:', error)
      toast.error('Image upload failed. Try again.')
      return null
    }

    const { data: publicUrlData } = supabase.storage
      .from('releases')
      .getPublicUrl(fileName)

    return { path: fileName, url: publicUrlData.publicUrl }
  }

  // Add a new release
  const addRelease = async () => {
    if (!newRelease.title || !newRelease.spotify_url || !newRelease.artist) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    const insertData: any = {
      title: newRelease.title,
      artist: newRelease.artist,
      spotify_url: newRelease.spotify_url,
    }

    if (imageFile) {
      const uploadResult = await uploadImage(imageFile)
      if (uploadResult) {
        insertData.image_path = uploadResult.path
        insertData.image_url = uploadResult.url
      }
    }

    const { error } = await supabase.from('releases').insert([insertData])

    if (error) toast.error(error.message)
    else {
      toast.success('Release added.')
      setNewRelease({ title: '', artist: '', spotify_url: '' })
      setImageFile(null)
      setPreview(null)
      fetchReleases()
    }

    setLoading(false)
  }

  // Delete a release
  const deleteRelease = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release?')) return
    const { error } = await supabase.from('releases').delete().eq('id', id)
    if (error) console.error(error)
    fetchReleases()
  }

  // Convert Spotify link to embed format
  const getSpotifyEmbedUrl = (url: string) =>
    url.replace('open.spotify.com/', 'open.spotify.com/embed/')

  return (
    <>
      <div className="mb-6">
        <h1 className="text-page-title text-[var(--text-primary)]">Releases</h1>
        <p className="text-body-sm text-[var(--text-muted)] mt-0.5">Music releases and Spotify links.</p>
      </div>

        {/* Add new release form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 mb-8"
        >
          <h2 className="text-section-title text-[var(--text-primary)] mb-6">Add New Release</h2>

          <div className="space-y-6">
            <input
              type="text"
              placeholder="Title"
              value={newRelease.title}
              onChange={(e) =>
                setNewRelease({ ...newRelease, title: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
            />

            <input
              type="text"
              placeholder="Artist"
              value={newRelease.artist}
              onChange={(e) =>
                setNewRelease({ ...newRelease, artist: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
            />

            <input
              type="text"
              placeholder="Spotify URL"
              value={newRelease.spotify_url}
              onChange={(e) =>
                setNewRelease({ ...newRelease, spotify_url: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
            />

            <div className="flex flex-col items-center gap-3">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-lg border border-[var(--border-subtle)]"
                />
              )}
              <label className="cursor-pointer bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-4 py-2 rounded-lg transition-all text-sm text-[var(--text-primary)]">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImageFile(file)
                      setPreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </label>
            </div>

            <motion.button
              onClick={addRelease}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              whileHover={{ boxShadow: '0 0 25px rgba(96,165,250,0.4)' }}
              className="w-full py-3 mt-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:opacity-95 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Release'}
            </motion.button>
          </div>
        </motion.div>

        {/* List of releases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {releases.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] col-span-full">
              No releases added yet.
            </p>
          ) : (
            releases.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-4 flex flex-col hover:border-[var(--accent-solid)]/30 transition"
              >
                {r.image_url && (
                  <img
                    src={r.image_url}
                    alt={r.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-card-title text-[var(--text-primary)] mb-1">{r.title}</h3>
                {r.artist && (
                  <p className="text-body-sm text-[var(--text-muted)] mb-3">By {r.artist}</p>
                )}
                <iframe
                  src={getSpotifyEmbedUrl(r.spotify_url)}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="encrypted-media"
                  className="rounded mb-4"
                ></iframe>
                <button
                  onClick={() => deleteRelease(r.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm mt-auto transition-all duration-300"
                >
                  Delete
                </button>
              </motion.div>
            ))
          )}
        </div>
    </>
  )
}
