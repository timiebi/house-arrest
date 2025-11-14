'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email) return alert('Please enter your email.')

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    setLoading(false)

    if (error) alert(error.message)
    else alert('✅ Check your email for a login link.')
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#0f1115] text-gray-100 px-4 relative">
      
      {/* BACK BUTTON — added only this */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-gray-300 hover:text-white text-sm underline"
      >
        ← Back
      </button>

      <div className="bg-[#1a1d23] border border-[#2a2d33] shadow-xl rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-2 text-white">
          Admin Login
        </h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          Sign in securely to manage the website
        </p>

        <div className="flex flex-col gap-4">
          <label htmlFor="email" className="text-sm text-gray-300">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full p-3 rounded-md bg-[#121418] border border-[#2a2d33] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-3 py-3 rounded-md bg-yellow-950 hover:bg-yellow-900 transition-colors font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Sending link...' : 'Send Login Link'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-8">
          Only authorized users can access this dashboard.
        </p>
      </div>
    </main>
  )
}
