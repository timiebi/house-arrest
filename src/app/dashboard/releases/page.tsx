'use client'

import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiMenu, HiX } from 'react-icons/hi'

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
  const router = useRouter()
  const [releases, setReleases] = useState<Release[]>([])
  const [newRelease, setNewRelease] = useState({ title: '', artist: '', spotify_url: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      alert('Image upload failed. Try again.')
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
      alert('Please fill in all fields')
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

    if (error) alert(error.message)
    else {
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
    <main className="flex min-h-screen bg-gray-900 text-white">
      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition"
        >
          <HiMenu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 p-6 flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}
      >
        {/* Close mobile sidebar */}
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

      {/* Main Content */}
      <section className="flex-1 p-6 md:p-10 md:ml-64 overflow-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"
        >
          Manage Artist Releases
        </motion.h1>

        {/* Add new release form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-10"
        >
          <h2 className="text-lg font-semibold mb-6">Add New Release</h2>

          <div className="space-y-6">
            <input
              type="text"
              placeholder="Title"
              value={newRelease.title}
              onChange={(e) =>
                setNewRelease({ ...newRelease, title: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/70"
            />

            <input
              type="text"
              placeholder="Artist"
              value={newRelease.artist}
              onChange={(e) =>
                setNewRelease({ ...newRelease, artist: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/70"
            />

            <input
              type="text"
              placeholder="Spotify URL"
              value={newRelease.spotify_url}
              onChange={(e) =>
                setNewRelease({ ...newRelease, spotify_url: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/70"
            />

            <div className="flex flex-col items-center gap-3">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-xl border border-white/20"
                />
              )}
              <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-5 py-2 rounded-xl transition-all">
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
            <p className="text-center text-gray-400 col-span-full">
              No releases added yet.
            </p>
          ) : (
            releases.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/60 border border-white/10 rounded-2xl p-5 shadow-md flex flex-col hover:scale-[1.02] transition-all"
              >
                {r.image_url && (
                  <img
                    src={r.image_url}
                    alt={r.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold mb-1">{r.title}</h3>
                {r.artist && (
                  <p className="text-gray-400 mb-3 text-sm">By {r.artist}</p>
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
      </section>
    </main>
  )
}
