export function Newsletter() {
  return (
    <section className="py-16 px-6 bg-[var(--bg-elevated)] border-y border-[var(--border-subtle)] text-center">
      <h2 className="text-3xl font-heading mb-4 text-[var(--text-primary)]">Stay in the Loop</h2>
      <p className="text-lg text-[var(--text-secondary)] mb-6">Get updates on events, music, and more.</p>
      <form className="flex flex-col sm:flex-row gap-4 justify-center">
        <input
          type="email"
          placeholder="Your email"
          className="px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-[var(--accent-solid)] text-white font-semibold hover:opacity-90 transition"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}