export function Newsletter() {
  return (
    <section className="py-16 px-6 bg-gray-800 text-white text-center">
      <h2 className="text-3xl font-heading mb-4">Stay in the Loop</h2>
      <p className="text-lg text-gray-300 mb-6">Get updates on events, music, and more.</p>
      <form className="flex flex-col sm:flex-row gap-4 justify-center">
        <input
          type="email"
          placeholder="Your email"
          className="px-4 py-2 rounded text-black"
        />
        <button
          type="submit"
          className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-300"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}