import Categories from "../components/Category";
import CTASection from "../components/CTASection";
import EventSchedule from "../components/EventSchedule";
import FAQ from "../components/FAQ";
import HeroSection from "../components/HeroSection";
import HeroSlider from "../components/HeroSlider";
import RegisterCTA from "../components/RegisterCTA";
import Sponsors from "../components/Sponsors";
import Testimonials from "../components/Testimonials";
import UpcomingEvents from "../components/UpcomingEvent";
import UpcomingEvent from "../components/UpcomingEvent";
import { heroSlides } from "../data/heroSlides";

/**
 * Homepage - Main landing page component
 *
 * Uses AsyncSection wrapper for all data-fetching sections to provide:
 * - Suspense-based streaming for faster perceived load times
 * - Per-section error boundaries for graceful degradation
 * - Consistent loading skeletons
 *
 * Architecture:
 * - Above-the-fold content (Hero, Quality, TopBrands) loads immediately
 * - Below-the-fold sections stream in as data becomes available
 * - Each async section can fail independently without affecting others
 */
export default async function Homepage() {
  return (
    <main role="main" aria-label="Homepage">
      {/* SEO: Main H1 heading - visually hidden but accessible */}
      {/* <h1 className="sr-only">
				Gloria Elegance - Premium Beauty & Cosmetics from UK & USA in Bangladesh
			</h1> */}

      <section aria-label="Testimonials">
        {/* <HeroSlider
          slides={heroSlides}
          autoPlay={true}
          interval={5000}
          height="h-[85vh]"
        /> */}
        <HeroSection />
      </section>

      <section aria-label="UpComing Event">
        <UpcomingEvents />
      </section>

      <section aria-label=" Event">
        <EventSchedule />
      </section>
      <section>
        <CTASection />
      </section>

      <section aria-label=" Event">
        <Categories />
      </section>

      <section aria-label="Testimonials">
        <Testimonials />
      </section>

      <section aria-label="Sponsors">
        <Sponsors />
      </section>
      <section aria-label="FAQ">
        <FAQ />
      </section>
      <section aria-label="Follow Us on Social Media">
        <RegisterCTA />
      </section>
    </main>
  );
}
