'use client'

import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiMenu, HiX } from 'react-icons/hi'

interface GalleryImage {
  id: string
  path: string
  url: string
}

export default function GalleryPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')

  // Check session & verify admin
  useEffect(() => {
    const fetchSessionAndImages = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) return router.replace('/login')

      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .single()

      if (adminError || !adminData) {
        console.warn('Access denied: not an admin')
        return router.replace('/')
      }

      setSession(sessionData.session)
      fetchImages()
    }
    fetchSessionAndImages()
  }, [router])

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
    if (!file) return alert('No file selected')
    setLoading(true)
    const filePath = `owner/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      alert(uploadError.message)
      setLoading(false)
      return
    }

    const publicData = supabase.storage.from('gallery').getPublicUrl(filePath).data
    const publicUrl = publicData?.publicUrl

    const { error: insertError } = await supabase.from('gallery').insert({
      path: filePath,
      url: publicUrl,
    })
    if (insertError) alert(insertError.message)

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
    if (!newAdminEmail) return alert('Please enter an email')
    const { error } = await supabase.from('admins').insert({ email: newAdminEmail })
    if (error) alert(error.message)
    else {
      alert('Admin added successfully')
      setNewAdminEmail('')
    }
  }

  if (!session)
    return (
      <p className="text-center text-gray-400 mt-20 text-lg">
        Loading...
      </p>
    )

  return (
    <main className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 p-6 flex flex-col transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}
      >
        <div className="md:hidden mb-4 flex justify-end">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
          >
            <HiX size={24} />
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-8 text-center">Dashboard</h2>
        <ul className="space-y-3 flex-1">
          <li>
            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:text-blue-400 transition"
              onClick={() => setSidebarOpen(false)}
            >
              ← Back to Dashboard
            </Link>
          </li>
        </ul>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.replace('/login')
          }}
          className="mt-auto px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <section className="flex-1 p-6 md:p-10 md:ml-64 overflow-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"
        >
          Manage Gallery
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8"
        >
          {/* Upload Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full md:w-auto rounded bg-gray-800 border border-gray-700 p-2"
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
            <p className="text-gray-400 text-center py-20">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  whileHover={{ scale: 1.03 }}
                  className="relative group overflow-hidden rounded-lg shadow-lg bg-gray-800"
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
            <h3 className="text-lg font-semibold mb-3">Add New Admin</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Enter admin email"
                className="p-2 rounded bg-gray-800 border border-gray-700 flex-1"
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
      </section>
    </main>
  )
}
