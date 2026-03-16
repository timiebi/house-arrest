'use client'

import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import LogoLoader from '@/components/LogoLoader'
import { useToast } from '@/contexts/ToastContext'

const ADMIN_EMAIL = 'kosutimiebinicholas@gmail.com'

export default function AboutPageUI() {
  const toast = useToast()
  const [profileId, setProfileId] = useState<number | null>(null)
  const [about, setAbout] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [appleMusicUrl, setAppleMusicUrl] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState('/assets/dj1.jpg')
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
      setProfileLoading(false)
    }
    fetchProfile()
  }, [])

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
        toast.error(uploadError.message)
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
    if (error) toast.error(error.message)
    else {
      toast.success('Profile updated successfully.')
      setProfileImageUrl(uploadedUrl)
      setProfileImage(null)
      if (!profileId && upsertData.id) setProfileId(upsertData.id)
    }
  }

  if (profileLoading) {
    return (
      <div className="flex justify-center py-12">
        <LogoLoader size="sm" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-page-title text-[var(--text-primary)]">About</h1>
        <p className="text-body-sm text-[var(--text-muted)] mt-0.5">Artist profile and social links.</p>
      </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6"
        >
          {/* Left: Image & About */}
          <div className="flex flex-col items-center">
            <label className="mb-2 text-label">
              Profile Image
            </label>
            <div className="relative w-48 h-48 mb-4">
              <img
                src={profileImage ? URL.createObjectURL(profileImage) : profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-xl border border-[var(--border-subtle)]"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <label className="mb-2 text-label">
              About
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Write a few sentences about yourself..."
              className="w-full h-48 rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-subtle)] p-4 placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)] transition"
            />
          </div>

          {/* Right: Social Links */}
          <div className="flex flex-col">
            <label className="mb-2 text-label">
              Spotify URL
            </label>
            <input
              type="url"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/artist/..."
              className="mb-4 w-full rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-subtle)] p-4 placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)] transition"
            />

            <label className="mb-2 text-label">
              Instagram URL
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="mb-4 w-full rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-subtle)] p-4 placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)] transition"
            />

            <label className="mb-2 text-label">
              Apple Music URL
            </label>
            <input
              type="url"
              value={appleMusicUrl}
              onChange={(e) => setAppleMusicUrl(e.target.value)}
              placeholder="https://music.apple.com/..."
              className="mb-4 w-full rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-subtle)] p-4 placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)] transition"
            />
          </div>

          {/* Save Button */}
          <motion.button
            onClick={handleSave}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            whileHover={{ boxShadow: '0 0 25px rgba(248,113,113,0.5)' }}
            className={`md:col-span-2 w-full py-3 mt-4 rounded-lg text-body font-semibold bg-[var(--accent-solid)] hover:opacity-90 text-white transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </motion.div>
    </>
  )
}
