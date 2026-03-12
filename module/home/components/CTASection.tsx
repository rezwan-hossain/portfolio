import { Facebook } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[hsl(224,76%,33%)] text-white">
      {/* Abstract marathon-themed shapes */}

      {/* Running track curve - top left */}
      <svg
        className="absolute -top-20 -left-20 w-72 h-72 opacity-10 md:w-96 md:h-96"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle
          cx="200"
          cy="200"
          r="180"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray="30 20"
        />
        <circle
          cx="200"
          cy="200"
          r="140"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="20 15"
        />
        <circle
          cx="200"
          cy="200"
          r="100"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="15 10"
        />
      </svg>

      {/* Finish line pattern - right side */}
      <svg
        className="absolute -right-10 top-1/2 -translate-y-1/2 w-32 h-64 opacity-[0.07] md:w-48 md:h-80"
        viewBox="0 0 100 200"
        fill="currentColor"
      >
        {[...Array(10)].map((_, row) =>
          [...Array(5)].map((_, col) =>
            (row + col) % 2 === 0 ? (
              <rect
                key={`${row}-${col}`}
                x={col * 20}
                y={row * 20}
                width="20"
                height="20"
              />
            ) : null,
          ),
        )}
      </svg>

      {/* Dynamic motion lines - bottom left */}
      <svg
        className="absolute bottom-8 left-8 w-40 h-24 opacity-10 md:w-56 md:h-32"
        viewBox="0 0 200 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M10 80 Q60 20 120 50 T190 30" />
        <path d="M10 90 Q70 40 130 60 T190 45" />
        <path d="M10 70 Q50 10 110 40 T190 15" />
      </svg>

      {/* Road/path shape - top right */}
      <svg
        className="absolute -top-6 right-1/4 w-48 h-48 opacity-[0.06] md:w-64 md:h-64"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M20 180 Q60 100 100 120 T180 20"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M20 180 Q60 100 100 120 T180 20"
          strokeWidth="2"
          strokeDasharray="8 8"
          className="opacity-50"
        />
      </svg>

      {/* Small dots scattered like runners */}
      <div className="absolute top-12 left-1/3 w-2 h-2 rounded-full bg-current opacity-15" />
      <div className="absolute top-20 left-[38%] w-1.5 h-1.5 rounded-full bg-current opacity-10" />
      <div className="absolute bottom-16 right-1/3 w-2.5 h-2.5 rounded-full bg-current opacity-10" />
      <div className="absolute top-1/3 right-[15%] w-1.5 h-1.5 rounded-full bg-current opacity-15" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
        <h2 className="text-3xl font-bold tracking-wide uppercase md:text-4xl lg:text-5xl">
          Join Our Community
        </h2>
        <p className="mt-4 text-lg opacity-90 md:text-xl">
          Connect with fellow members, share experiences, and stay updated with
          the latest events and news.
        </p>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-neon-lime px-8 py-4 text-base font-medium text-cta transition-all hover:bg-cta-button-hover hover:-translate-y-0.5 hover:shadow-lg md:w-auto md:text-lg"
        >
          <Facebook className="h-5 w-5" />
          Join us on Facebook
        </a>
      </div>
    </section>
  );
};

export default CTASection;
