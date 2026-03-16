'use client'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

export default function AdminLogin() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email) {
      toast.error('Please enter your email.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    setLoading(false)

    if (error) toast.error(error.message)
    else toast.success('Check your email for a login link.')
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] px-4 relative">
      
      {/* BACK BUTTON — added only this */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-link-muted hover:text-[var(--text-primary)] underline"
      >
        ← Back
      </button>

      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] rounded-2xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src="/assets/sigaglogo.svg" alt="Sigag Lauren" width={120} height={32} className="sigag-logo sigag-logo-on-solid" />
        </div>
        <h1 className="text-page-title text-center mb-2 text-[var(--text-primary)]">
          Admin Login
        </h1>
        <p className="text-body-sm text-[var(--text-muted)] text-center mb-8">
          Sign in securely to manage the website
        </p>

        <div className="flex flex-col gap-4">
          <label htmlFor="email" className="text-label text-[var(--text-secondary)]">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full p-3 rounded-md bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)] transition"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-3 py-3 rounded-md bg-[var(--accent-solid)] hover:opacity-90 transition text-body-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Sending link...' : 'Send Login Link'}
          </button>
        </div>

        <p className="text-caption text-center mt-8">
          Only authorized users can access this dashboard.
        </p>
      </div>
    </main>
  )
}
