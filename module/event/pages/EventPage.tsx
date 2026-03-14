import { HeroText } from "@/components/ui/HeroText";
import EventCard from "../components/EventCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background  px-4 md:px-8">
      <div className="mt-42 ">
        <HeroText title="Events" />
      </div>
      <div className="max-w-7xl mx-auto space-y-10 mt-12">
        <EventCard
          title="Innovation Summit 2027"
          description="A full-day summit featuring keynote speakers, interactive workshops, and networking."
          time="9:31 PM - 12:31 AM"
          date="JUL 25, 2026"
          location="ADELAIDE, SOUTH AUSTRALIA"
          pricing="General $99 / Student $159 / VIP $299"
          image="https://plus.unsplash.com/premium_photo-1664537975122-9c598d85816e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          highlighted
        />

        <EventCard
          title="Upcoming Event Lineup"
          description="Find events that align with your professional goals. Get insider access to sessions."
          time="9:31 PM - 12:31 AM"
          date="MAR 06, 2026"
          location="SAN FRANCISCO, CA"
          pricing="General $99 / Student $159 / VIP $299"
          image="https://images.unsplash.com/photo-1638132704795-6bb223151bf7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        />
      </div>
    </div>
  );
};

export default Index;
