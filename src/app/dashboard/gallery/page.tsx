'use client'

import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface GalleryImage {
  id: string
  path: string
  url: string
}

export default function GalleryPage() {
  const toast = useToast()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')

  useEffect(() => {
    fetchImages()
  }, [])

  // Fetch images
  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setImages(data || [])
    } catch (err: any) {
      console.warn('Failed to fetch images:', err.message)
    }
  }

  // Upload image
  const uploadImage = async () => {
    if (!file) {
      toast.error('No file selected')
      return
    }
    setLoading(true)
    const filePath = `owner/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast.error(uploadError.message)
      setLoading(false)
      return
    }

    const publicData = supabase.storage.from('gallery').getPublicUrl(filePath).data
    const publicUrl = publicData?.publicUrl

    const { error: insertError } = await supabase.from('gallery').insert({
      path: filePath,
      url: publicUrl,
    })
    if (insertError) toast.error(insertError.message)
    else toast.success('Image uploaded.')

    setFile(null)
    setLoading(false)
    fetchImages()
  }

  // Delete image
  const deleteImage = async (id: string, path: string) => {
    await supabase.storage.from('gallery').remove([path])
    await supabase.from('gallery').delete().eq('id', id)
    fetchImages()
  }

  // Add new admin
  const addAdmin = async () => {
    if (!newAdminEmail) {
      toast.error('Please enter an email')
      return
    }
    const { error } = await supabase.from('admins').insert({ email: newAdminEmail })
    if (error) toast.error(error.message)
    else {
      toast.success('Admin added successfully.')
      setNewAdminEmail('')
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-page-title text-[var(--text-primary)]">Gallery</h1>
        <p className="text-body-sm text-[var(--text-muted)] mt-0.5">Photos and images.</p>
      </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 md:p-8"
        >
          {/* Upload Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full md:w-auto rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] p-2 text-[var(--text-primary)]"
            />
            <button
              onClick={uploadImage}
              disabled={!file || loading}
              className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Gallery Grid */}
          {images.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center py-20">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  whileHover={{ scale: 1.03 }}
                  className="relative group overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]"
                >
                  <img
                    src={img.url}
                    alt="Gallery"
                    className="w-full h-48 object-cover transition-transform duration-200"
                  />
                  <button
                    onClick={() => deleteImage(img.id, img.path)}
                    className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    Delete
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add new admin */}
          <div className="mt-10 border-t border-white/10 pt-6">
            <h3 className="text-section-title text-[var(--text-primary)] mb-3">Add New Admin</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Enter admin email"
                className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] flex-1 text-[var(--text-primary)]"
              />
              <button
                onClick={addAdmin}
                className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 transition"
              >
                Add
              </button>
            </div>
          </div>
        </motion.div>
    </>
  )
}
