'use client';

import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HiCheck, HiPencil, HiTrash, HiX } from 'react-icons/hi';

type Event = {
  id: string;
  date: string;
  city: string;
  venue: string;
  genre: string;
  ticket_url?: string;
  is_upcoming?: boolean;
};

export default function EventsPageUI() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    city: '',
    venue: '',
    genre: '',
    ticket_url: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    date: '',
    city: '',
    venue: '',
    genre: '',
    ticket_url: '',
  });

  /** Fetch all events */
  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) console.error('Error fetching events:', error.message);
    else setEvents(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /** Add new event */
  const addEvent = async () => {
    const { date, city, venue, genre, ticket_url } = formData;
    if (!date || !city || !venue || !genre) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('events').insert([formData]);

    if (error) alert(error.message);
    else {
      setFormData({ date: '', city: '', venue: '', genre: '', ticket_url: '' });
      fetchEvents();
    }
    setLoading(false);
  };

  /** Update event */
  const updateEvent = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from('events').update(editData).eq('id', id);

    if (error) alert(error.message);
    else {
      setEditingId(null);
      fetchEvents();
    }
    setLoading(false);
  };

  /** Delete event */
  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) console.error('Delete error:', error.message);
    else fetchEvents();
  };

  /** Mark as upcoming */
  const setUpcoming = async (id: string) => {
    setLoading(true);
    await supabase.from('events').update({ is_upcoming: false }).eq('is_upcoming', true);
    const { error } = await supabase.from('events').update({ is_upcoming: true }).eq('id', id);
    if (error) console.error('Error setting upcoming:', error.message);
    fetchEvents();
    setLoading(false);
  };

  /** Remove upcoming */
  const removeUpcoming = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from('events').update({ is_upcoming: false }).eq('id', id);
    if (error) console.error('Error removing upcoming:', error.message);
    fetchEvents();
    setLoading(false);
  };

  const upcomingEvent = events.find((e) => e.is_upcoming);
  const timelineEvents = events.filter((e) => !e.is_upcoming);

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
            >
              ← Back to Dashboard
            </Link>
          </li>
        </ul>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace('/login');
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
          Manage Events
        </motion.h1>

        {/* Add Event */}
        <motion.div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-10">
          <h2 className="text-lg font-semibold mb-6">Add New Event</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-3 rounded-xl bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400/70"
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-3 rounded-xl bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400/70"
            />
            <input
              type="text"
              placeholder="Venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full p-3 rounded-xl bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400/70"
            />
            <input
              type="text"
              placeholder="Genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full p-3 rounded-xl bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400/70"
            />
            <input
              type="text"
              placeholder="Ticket URL (optional)"
              value={formData.ticket_url}
              onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
              className="w-full p-3 rounded-xl bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400/70"
            />
          </div>

          <button
            onClick={addEvent}
            disabled={loading}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:opacity-95 transition disabled:opacity-50 font-semibold"
          >
            {loading ? 'Saving...' : 'Add Event'}
          </button>
        </motion.div>

        {/* Upcoming Event */}
        {upcomingEvent && (
          <motion.div className="bg-purple-900/40 border border-purple-500 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-bold text-pink-400 mb-2">Upcoming Event</h2>
            <p className="font-semibold">
              {upcomingEvent.date} — {upcomingEvent.city} ({upcomingEvent.venue})
            </p>
            <p className="text-gray-300 mt-1">{upcomingEvent.genre}</p>
            {upcomingEvent.ticket_url && (
              <Link
                href={upcomingEvent.ticket_url}
                target="_blank"
                className="mt-2 inline-block text-blue-400 underline"
              >
                Buy Tickets
              </Link>
            )}
            <button
              onClick={() => removeUpcoming(upcomingEvent.id)}
              className="mt-3 bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-md transition"
            >
              Remove Upcoming
            </button>
          </motion.div>
        )}

        {/* Event List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timelineEvents.length === 0 ? (
            <p className="text-center text-gray-400 col-span-full">No other events yet.</p>
          ) : (
            timelineEvents.map((e) => (
              <div
                key={e.id}
                className="bg-gray-900/60 border border-white/10 rounded-xl p-5 flex flex-col hover:bg-gray-900/80 transition"
              >
                {editingId === e.id ? (
                  <>
                    <input
                      type="date"
                      value={editData.date}
                      onChange={(ev) => setEditData({ ...editData, date: ev.target.value })}
                      className="p-2 mb-2 rounded bg-gray-800"
                    />
                    <input
                      type="text"
                      value={editData.city}
                      onChange={(ev) => setEditData({ ...editData, city: ev.target.value })}
                      className="p-2 mb-2 rounded bg-gray-800"
                    />
                    <input
                      type="text"
                      value={editData.venue}
                      onChange={(ev) => setEditData({ ...editData, venue: ev.target.value })}
                      className="p-2 mb-2 rounded bg-gray-800"
                    />
                    <input
                      type="text"
                      value={editData.genre}
                      onChange={(ev) => setEditData({ ...editData, genre: ev.target.value })}
                      className="p-2 mb-2 rounded bg-gray-800"
                    />
                    <input
                      type="text"
                      value={editData.ticket_url}
                      onChange={(ev) => setEditData({ ...editData, ticket_url: ev.target.value })}
                      placeholder="Ticket URL (optional)"
                      className="p-2 mb-2 rounded bg-gray-800"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => updateEvent(e.id)}
                        className="bg-green-600 px-3 py-1 rounded hover:bg-green-500 flex items-center gap-1"
                      >
                        <HiCheck /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-pink-400">{e.date}</h3>
                    <p className="text-base mt-1">
                      <span className="font-bold">{e.city}</span> — {e.venue}{' '}
                      <span className="text-gray-400">({e.genre})</span>
                    </p>
                    {e.ticket_url && (
                      <Link
                        href={e.ticket_url}
                        target="_blank"
                        className="text-blue-400 underline mt-1"
                      >
                        Buy Tickets
                      </Link>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingId(e.id);
                          setEditData({
                            date: e.date,
                            city: e.city,
                            venue: e.venue,
                            genre: e.genre,
                            ticket_url: e.ticket_url || '',
                          });
                        }}
                        className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded flex items-center gap-1"
                      >
                        <HiPencil /> Edit
                      </button>
                      <button
                        onClick={() => deleteEvent(e.id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded flex items-center gap-1"
                      >
                        <HiTrash /> Delete
                      </button>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="upcoming"
                          checked={e.is_upcoming}
                          onChange={() => setUpcoming(e.id)}
                        />
                        Upcoming
                      </label>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
