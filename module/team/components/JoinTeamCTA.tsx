// module/team/components/JoinTeamCTA.tsx
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const JoinTeamCTA = () => (
  <section className="relative overflow-hidden rounded-2xl bg-neutral-900 p-8 sm:p-12 lg:p-16">
    {/* Background accents */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-neon-lime/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

    <div className="relative text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-neon-lime text-xs font-bold uppercase tracking-wider mb-6">
        <Sparkles size={12} />
        We&apos;re Hiring
      </div>

      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wide text-white mb-4">
        JOIN OUR TEAM
      </h2>

      <p className="font-body text-sm sm:text-base text-white/60 leading-relaxed mb-8">
        We&apos;re always looking for passionate people who love running and
        want to make a difference. If that sounds like you, we&apos;d love to
        hear from you.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/contact"
          className="group inline-flex items-center gap-3 bg-neon-lime text-neutral-900 font-body font-semibold text-sm tracking-wide rounded-full px-8 py-4 transition hover:opacity-90 active:scale-[0.98]"
        >
          GET IN TOUCH
          <span className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center transition-transform group-hover:translate-x-1">
            <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-white/60 font-body text-sm hover:text-white transition-colors"
        >
          View our gallery
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </section>
);

export default JoinTeamCTA;
