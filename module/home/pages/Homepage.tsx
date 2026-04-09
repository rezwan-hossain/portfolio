import { getActiveHero } from "@/app/actions/homepage";
import HeroSection from "../components/HeroSection";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import StatsCounter from "../components/StatsCounter";
import CourseHighlights from "../components/CourseHighlights";

// ✅ Lazy load everything below the fold
const UpcomingEvents = dynamic(() => import("../components/UpcomingEvent"), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
});

const EventSchedule = dynamic(() => import("../components/EventSchedule"), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
});

const CTASection = dynamic(() => import("../components/CTASection"));
const Categories = dynamic(() => import("../components/Category"));
const Testimonials = dynamic(() => import("../components/Testimonials"));
const Sponsors = dynamic(() => import("../components/Sponsors"));
const FAQ = dynamic(() => import("../components/FAQ"));
const RegisterCTA = dynamic(() => import("../components/RegisterCTA"));

export default async function Homepage() {
  const { hero } = await getActiveHero();

  return (
    <main role="main" aria-label="Homepage">
      {/* ✅ Only hero loads immediately */}
      <section aria-label="Hero">
        <HeroSection hero={hero} />
      </section>

      {/* ✅ Everything else loads after hero is visible */}
      <Suspense fallback={<div className="h-96" />}>
        <section aria-label="UpComing Event">
          <UpcomingEvents />
        </section>
      </Suspense>

      <Suspense fallback={<div className="h-96" />}>
        <section aria-label="Event Schedule">
          <EventSchedule />
        </section>
      </Suspense>

      <StatsCounter />

      <CTASection />
      <Categories />
      <Testimonials />
      <Sponsors />
      <FAQ />
      <RegisterCTA />
    </main>
  );
}
