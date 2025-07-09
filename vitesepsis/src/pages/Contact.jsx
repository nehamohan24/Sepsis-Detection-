export default function Contact() {
    return (
      <div className="max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">Contact Us</h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 border rounded-xl shadow-sm"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-3 border rounded-xl shadow-sm"
          />
          <textarea
            placeholder="Your Message"
            className="w-full p-3 border rounded-xl shadow-sm"
            rows={5}
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    );
  }
  