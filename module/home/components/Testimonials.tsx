const testimonials = [
  {
    name: "Rafi Farouk",
    role: "21K Finisher, 2024 Edition",
    avatar: "RF",
    text: "I never believed I could run a half marathon. Last year's Dhaka Ultra proved me wrong. The crowd, the energy, the route — it changed my life. Already registered for the full marathon this year.",
  },
  {
    name: "Sadia Akhter",
    role: "42K Finisher, 2024 Edition",
    avatar: "SA",
    text: "The organization was world-class. From bib collection to the finish line, everything ran like clockwork. The Hatirjheel stretch at sunrise is something I'll never forget. An experience of a lifetime.",
  },
  {
    name: "Mahmud Hossain",
    role: "5K Family Runner, 2024 Edition",
    avatar: "MH",
    text: "Brought my whole family for the 5K! My kids absolutely loved it. The atmosphere was electric and the post-race festival was incredible. This is our annual tradition now — see you in 2025!",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className=" px-[5%] py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-widest text-gray-500">
            Runner Stories
          </div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            WHAT THEY <br />
            <span className="text-neon-lime">SAY</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition"
            >
              {/* Stars */}
              {/* <div className="text-yellow-400 text-lg mb-4">★★★★★</div> */}

              {/* Text */}
              <p className="text-gray-600 leading-relaxed mb-6">{t.text}</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neon-lime text-lime-700 font-semibold">
                  {t.avatar}
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{t.name}</span>
                  <span className="text-sm text-gray-500">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
