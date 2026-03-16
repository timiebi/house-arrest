'use client';

import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiCheck, HiPencil, HiTrash } from 'react-icons/hi';
import { useToast } from '@/contexts/ToastContext';

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
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

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
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('events').insert([formData]);

    if (error) toast.error(error.message);
    else {
      toast.success('Event added.');
      setFormData({ date: '', city: '', venue: '', genre: '', ticket_url: '' });
      fetchEvents();
    }
    setLoading(false);
  };

  /** Update event */
  const updateEvent = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from('events').update(editData).eq('id', id);

    if (error) toast.error(error.message);
    else {
      toast.success('Event updated.');
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
    <>
      <div className="mb-6">
        <h1 className="text-page-title text-[var(--text-primary)]">Events</h1>
        <p className="text-body-sm text-[var(--text-muted)] mt-0.5">Shows and tour dates.</p>
      </div>

        {/* Add Event */}
        <motion.div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 mb-8">
          <h2 className="text-section-title text-[var(--text-primary)] mb-6">Add New Event</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
            />
            <input
              type="text"
              placeholder="Venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
            />
            <input
              type="text"
              placeholder="Genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
            />
            <input
              type="text"
              placeholder="Ticket URL (optional)"
              value={formData.ticket_url}
              onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
              className="w-full p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
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
            <h2 className="text-section-title text-[var(--accent-via)] mb-2">Upcoming Event</h2>
            <p className="font-semibold">
              {upcomingEvent.date} — {upcomingEvent.city} ({upcomingEvent.venue})
            </p>
            <p className="text-[var(--text-secondary)] mt-1">{upcomingEvent.genre}</p>
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
            <p className="text-center text-[var(--text-muted)] col-span-full">No other events yet.</p>
          ) : (
            timelineEvents.map((e) => (
              <div
                key={e.id}
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-4 flex flex-col hover:border-[var(--accent-solid)]/30 transition"
              >
                {editingId === e.id ? (
                  <>
                    <input
                      type="date"
                      value={editData.date}
                      onChange={(ev) => setEditData({ ...editData, date: ev.target.value })}
                      className="p-2 mb-2 rounded bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    />
                    <input
                      type="text"
                      value={editData.city}
                      onChange={(ev) => setEditData({ ...editData, city: ev.target.value })}
                      className="p-2 mb-2 rounded bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    />
                    <input
                      type="text"
                      value={editData.venue}
                      onChange={(ev) => setEditData({ ...editData, venue: ev.target.value })}
                      className="p-2 mb-2 rounded bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    />
                    <input
                      type="text"
                      value={editData.genre}
                      onChange={(ev) => setEditData({ ...editData, genre: ev.target.value })}
                      className="p-2 mb-2 rounded bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    />
                    <input
                      type="text"
                      value={editData.ticket_url}
                      onChange={(ev) => setEditData({ ...editData, ticket_url: ev.target.value })}
                      placeholder="Ticket URL (optional)"
                      className="p-2 mb-2 rounded bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
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
                        className="bg-[var(--bg-elevated)] px-3 py-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-card-title text-[var(--accent-via)]">{e.date}</h3>
                    <p className="text-body mt-1">
                      <span className="font-bold">{e.city}</span> — {e.venue}{' '}
                      <span className="text-[var(--text-muted)]">({e.genre})</span>
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
    </>
  );
}
