'use client'

import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiMenu, HiX } from 'react-icons/hi'

const ADMIN_EMAIL = 'kosutimiebinicholas@gmail.com'

export default function AboutPageUI() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [profileId, setProfileId] = useState<number | null>(null)
  const [about, setAbout] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [appleMusicUrl, setAppleMusicUrl] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState('/assets/dj1.jpg') // default
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch session and profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session: supaSession } } = await supabase.auth.getSession()
        if (!supaSession) return router.replace('/dashboard/login')
        if (supaSession.user.email !== ADMIN_EMAIL) return router.replace('/')
        setSession(supaSession)

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', ADMIN_EMAIL)
          .single()

        if (error && error.code !== 'PGRST116') console.warn('Profile fetch warning:', error.message)
        if (data) {
          setProfileId(data.id)
          setAbout(data.about || '')
          setSpotifyUrl(data.spotify_url || '')
          setInstagramUrl(data.instagram_url || '')
          setAppleMusicUrl(data.apple_music_url || '')
          setProfileImageUrl(data.profile_image_url || '/assets/dj1.jpg')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      }
    }
    fetchData()
  }, [router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setProfileImage(e.target.files[0])
  }

  const handleSave = async () => {
    setLoading(true)
    let uploadedUrl = profileImageUrl

    // Upload new image if selected
    if (profileImage) {
      const filePath = `profiles/owner-profile.jpg`
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, profileImage, { upsert: true })

      if (uploadError) {
        alert(uploadError.message)
        setLoading(false)
        return
      }

      const { data: publicData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)
      uploadedUrl = publicData.publicUrl
    }

    // Prepare data to upsert
    const upsertData: any = {
      about,
      spotify_url: spotifyUrl,
      instagram_url: instagramUrl,
      apple_music_url: appleMusicUrl,
      profile_image_url: uploadedUrl,
      email: ADMIN_EMAIL, // must be unique in table
    }

    if (profileId) upsertData.id = profileId // for updates only

    const { error } = await supabase
      .from('profiles')
      .upsert(upsertData, { onConflict: 'email' })

    setLoading(false)
    if (error) alert(error.message)
    else {
      alert('Profile updated successfully!')
      setProfileImageUrl(uploadedUrl)
      setProfileImage(null)
      if (!profileId && upsertData.id) setProfileId(upsertData.id)
    }
  }

  if (!session) return <p className="text-center text-gray-400 mt-20">Loading...</p>

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
          className="text-5xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"
        >
          Update Artist Profile
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8 bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
        >
          {/* Left: Image & About */}
          <div className="flex flex-col items-center">
            <label className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Profile Image
            </label>
            <div className="relative w-48 h-48 mb-4">
              <img
                src={profileImage ? URL.createObjectURL(profileImage) : profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-3xl border border-white/20"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <label className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
              About
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Write a few sentences about yourself..."
              className="w-full h-48 rounded-2xl bg-gray-900/70 text-gray-100 border border-white/20 p-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400/60 transition"
            />
          </div>

          {/* Right: Social Links */}
          <div className="flex flex-col">
            <label className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Spotify URL
            </label>
            <input
              type="url"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/artist/..."
              className="mb-4 w-full rounded-2xl bg-gray-900/70 text-gray-100 border border-white/20 p-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/60 transition"
            />

            <label className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Instagram URL
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="mb-4 w-full rounded-2xl bg-gray-900/70 text-gray-100 border border-white/20 p-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400/60 transition"
            />

            <label className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Apple Music URL
            </label>
            <input
              type="url"
              value={appleMusicUrl}
              onChange={(e) => setAppleMusicUrl(e.target.value)}
              placeholder="https://music.apple.com/..."
              className="mb-4 w-full rounded-2xl bg-gray-900/70 text-gray-100 border border-white/20 p-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400/60 transition"
            />
          </div>

          {/* Save Button */}
          <motion.button
            onClick={handleSave}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            whileHover={{ boxShadow: '0 0 25px rgba(248,113,113,0.5)' }}
            className={`md:col-span-2 w-full py-3 mt-4 rounded-xl font-semibold tracking-wide text-lg bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </motion.div>
      </section>
    </main>
  )
}
