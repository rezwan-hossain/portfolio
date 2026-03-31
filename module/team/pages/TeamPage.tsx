// module/team/pages/TeamPage.tsx (or app/team/page.tsx)
import { HeroText } from "@/components/ui/HeroText";
import TeamGrid from "../components/TeamGrid";
import TeamStats from "../components/TeamStats";
import JoinTeamCTA from "../components/JoinTeamCTA";
import type { TeamMember } from "@/types/team";

const leadership: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Rahman",
    role: "Founder & CEO",
    bio: "Former marathon champion turned entrepreneur. Sarah founded the platform to make running events accessible to everyone across Bangladesh.",
    image: "/team/sarah.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/sarah",
      twitter: "https://twitter.com/sarah",
    },
  },
  {
    id: "2",
    name: "Kamal Hossain",
    role: "Co-Founder & CTO",
    bio: "Full-stack engineer with 10+ years of experience building scalable platforms. Passionate about using tech to connect communities.",
    image: "/team/kamal.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/kamal",
      github: "https://github.com/kamal",
    },
  },
  {
    id: "3",
    name: "Nadia Islam",
    role: "Head of Operations",
    bio: "Expert in event logistics and operations. Nadia ensures every race runs smoothly from registration to finish line.",
    image: "/team/nadia.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/nadia",
      instagram: "https://instagram.com/nadia",
    },
  },
  {
    id: "4",
    name: "Arif Khan",
    role: "Creative Director",
    bio: "Award-winning designer who brings every event to life through stunning visuals and unforgettable brand experiences.",
    image: "/team/arif.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/arif",
      twitter: "https://twitter.com/arif",
      instagram: "https://instagram.com/arif",
    },
  },
];

const team: TeamMember[] = [
  {
    id: "5",
    name: "Tamim Iqbal",
    role: "Lead Developer",
    bio: "Builds the core platform features. React enthusiast and open-source contributor.",
    image: "/team/tamim.jpg",
    socials: {
      github: "https://github.com/tamim",
      linkedin: "https://linkedin.com/in/tamim",
    },
  },
  {
    id: "6",
    name: "Fatima Begum",
    role: "Marketing Lead",
    bio: "Drives growth and community engagement through creative campaigns and partnerships.",
    image: "/team/fatima.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/fatima",
      instagram: "https://instagram.com/fatima",
    },
  },
  {
    id: "7",
    name: "Rezwan Ahmed",
    role: "Event Coordinator",
    bio: "On-ground operations specialist who has coordinated 50+ running events nationwide.",
    image: "/team/rezwan.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/rezwan",
    },
  },
  {
    id: "8",
    name: "Priya Das",
    role: "Community Manager",
    bio: "Connects with runners, builds partnerships, and grows the community one race at a time.",
    image: "/team/priya.jpg",
    socials: {
      twitter: "https://twitter.com/priya",
      instagram: "https://instagram.com/priya",
    },
  },
  {
    id: "9",
    name: "Sohel Rana",
    role: "Backend Engineer",
    bio: "Database architect and API specialist. Keeps the platform fast and reliable at scale.",
    image: "/team/sohel.jpg",
    socials: {
      github: "https://github.com/sohel",
    },
  },
  {
    id: "10",
    name: "Mithila Chowdhury",
    role: "UI/UX Designer",
    bio: "Creates intuitive, beautiful interfaces that make event discovery and registration a breeze.",
    image: "/team/mithila.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/mithila",
      instagram: "https://instagram.com/mithila",
    },
  },
  {
    id: "11",
    name: "Rafiq Uddin",
    role: "Finance & Admin",
    bio: "Manages budgets, sponsorships, and ensures financial sustainability across all operations.",
    image: "/team/rafiq.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/rafiq",
    },
  },
  {
    id: "12",
    name: "Anika Sultana",
    role: "Content Writer",
    bio: "Tells the stories behind every race. From blog posts to social media, Anika captures the spirit of running.",
    image: "/team/anika.jpg",
    socials: {
      twitter: "https://twitter.com/anika",
      instagram: "https://instagram.com/anika",
    },
  },
];

const TeamPage = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Hero */}
      <div className="mt-42">
        <HeroText title="Our Team" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-4xl sm:text-5xl lg:text-6xl tracking-tight font-extrabold text-zinc-800 font-heading leading-tight">
            The people behind
            <br />
            every finish line
          </p>
          <p className="font-body text-base sm:text-lg text-muted-foreground mt-6 leading-relaxed">
            We&apos;re a team of runners, builders, and dreamers on a mission to
            make every race an unforgettable experience. Meet the crew that
            makes it all happen.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-20">
          <TeamStats />
        </div>

        {/* Leadership */}
        <div className="mb-20">
          <TeamGrid
            members={leadership}
            title="LEADERSHIP"
            subtitle="The visionaries steering our mission forward"
          />
        </div>

        {/* Full Team */}
        <div className="mb-20">
          <TeamGrid
            members={team}
            title="THE CREW"
            subtitle="The talented individuals who bring everything together"
          />
        </div>

        {/* Join CTA */}
        <JoinTeamCTA />
      </div>
    </div>
  );
};

export default TeamPage;
