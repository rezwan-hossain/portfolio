import { Lightbulb, Users, Rocket, Globe } from "lucide-react";
import CountdownTimer from "../components/CountdownTimer";
import TicketSelector from "../components/TicketSelector";
import { HeroText } from "@/components/ui/HeroText";

const highlights = [
  {
    icon: Lightbulb,
    title: "Keynote Speakers",
    desc: "Hear from world-renowned innovators and thought leaders shaping the future of technology.",
  },
  {
    icon: Users,
    title: "Networking",
    desc: "Connect with thousands of entrepreneurs, investors, and industry professionals.",
  },
  {
    icon: Rocket,
    title: "Startup Showcase",
    desc: "Discover cutting-edge startups and groundbreaking products ready to disrupt industries.",
  },
  {
    icon: Globe,
    title: "Global Community",
    desc: "Join a diverse community of innovators from over 50 countries worldwide.",
  },
];

// Set event date ~143 days from now
const eventDate = new Date(Date.now() + 143 * 24 * 60 * 60 * 1000);

const EventDetailPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mt-16 ">
        <HeroText
          title="RunRise Nation Noboborsho Run 1433"
          date="July 25, 2026"
          time="9:31 PM - 12:31 AM"
          location="hatirjheel, Dhaka"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Main grid */}
        <div className="relative rounded-xl overflow-hidden mt-4 mb-8">
          <img
            src="https://api.runrisenation.com/media/Cover-01.jpg.jpeg"
            // src="https://images.unsplash.com/photo-1772377764367-9c3e8e2ad560?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Innovation Summit 2025 concert stage with dramatic lighting"
            className="w-full h-[300px] sm:h-[360px] lg:h-[540px] object-contain lg:object-cover overflow-hidden rounded-xl"
            // className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
          {/* Left column */}
          <div>
            {/* Hero Image */}
            <div className="relative rounded-xl overflow-hidden">
              <img
                src="https://api.runrisenation.com/media/Cover-01.jpg.jpeg"
                // src="https://images.unsplash.com/photo-1761486376221-ff939f0a8f56?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Innovation Summit 2025 concert stage with dramatic lighting"
                className="w-full h-[280px] sm:h-[360px] lg:h-[440px] object-cover"
                loading="lazy"
              />
              <span className="absolute top-4 left-4 bg-event-gold text-primary-foreground font-body text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide">
                Upcoming
              </span>
            </div>

            {/* Overview */}
            <section className="mt-10 lg:mt-14">
              <h2 className="font-display text-3xl lg:text-4xl tracking-wide mb-4">
                OVER VIEW
              </h2>
              <p className="font-body text-sm lg:text-base leading-relaxed text-muted-foreground max-w-2xl">
                Innovation Summit 2025 is a premier global event focused on
                technology, entrepreneurship, digital transformation, and the
                future of emerging industries. The summit brings together top
                innovators, researchers, investors, startups, and industry
                leaders to explore groundbreaking ideas, futuristic solutions,
                and transformative technologies shaping tomorrow.
              </p>
            </section>

            {/* Key Highlights */}
            <section className="mt-10 lg:mt-14">
              <h2 className="font-display text-3xl lg:text-4xl tracking-wide mb-6">
                KEY HIGHLIGHTS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((h) => (
                  <div
                    key={h.title}
                    className="border border-border rounded-xl p-5 flex gap-4 items-start hover:border-event-gold transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-event-gold/10 flex items-center justify-center flex-shrink-0">
                      <h.icon size={20} className="text-event-gold" />
                    </div>
                    <div>
                      <h4 className="font-display text-lg tracking-wide mb-1">
                        {h.title}
                      </h4>
                      <p className="font-body text-xs lg:text-sm text-muted-foreground leading-relaxed">
                        {h.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="lg:sticky lg:top-20 h-fit space-y-8">
            <CountdownTimer targetDate={eventDate} />
            <TicketSelector />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
