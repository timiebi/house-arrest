'use client'

import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiMenu, HiX } from 'react-icons/hi'

const ADMIN_EMAIL = 'kosutimiebinicholas@gmail.com'

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null)
  const router = useRouter()
  const [active, setActive] = useState<string>('') // track active link
  const [sidebarOpen, setSidebarOpen] = useState(false) // for mobile

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login')
      } else if (data.session.user.email !== ADMIN_EMAIL) {
        router.replace('/') // non-admin blocked
      } else {
        setSession(data.session)

        // Remove #access_token from URL
        if (window.location.hash.includes('access_token')) {
          router.replace('/dashboard')
        }
      }
    })

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/dashboard/login')
      else if (session.user.email !== ADMIN_EMAIL) router.replace('/')
      else setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  if (!session) return <p className="text-center text-gray-400 mt-20">Loading...</p>

  const navItems = [
    { label: 'About', href: '/dashboard/about' },
    { label: 'Gallery', href: '/dashboard/gallery' },
    { label: 'Releases', href: '/dashboard/releases' },
    { label: 'Events', href: '/dashboard/events' },
  ]

  return (
    <main className="flex min-h-screen bg-gray-900 text-white">
      {/* Mobile Sidebar toggle */}
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
        {/* Close button on mobile */}
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
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition ${
                  active === item.href
                    ? 'bg-gray-700 text-white font-semibold'
                    : 'hover:bg-gray-700 hover:text-blue-400'
                }`}
                onClick={() => {
                  setActive(item.href)
                  setSidebarOpen(false) // close sidebar on mobile
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout */}
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
      <section className="flex-1 p-6 md:p-10 md:ml-64 transition-all duration-300">
        <h1 className="text-3xl font-semibold mb-6">Welcome, Admin!</h1>
        <p className="text-gray-300">
          Select a section from the left to manage your content.
        </p>
      </section>
    </main>
  )
}
