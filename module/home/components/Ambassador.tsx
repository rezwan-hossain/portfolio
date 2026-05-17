type ScheduleItem = {
  time: string;
  title: string;
  location?: string;
};

import TeamMemberCard from "@/module/team/components/TeamMemberCard";
import type { TeamMember } from "@/types/team";

export const fakeTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Rezwan Hossain",
    role: "Full Stack Developer",
    bio: "Passionate about building scalable web applications with Next.js, NestJS, and modern cloud infrastructure.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
    sortOrder: 1,
    category: "ADMIN",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    linkedinUrl: "https://linkedin.com/in/rezwan",
    githubUrl: "https://github.com/rezwan",
    twitterUrl: "https://twitter.com/rezwan",

    socials: {
      linkedin: "https://linkedin.com/in/rezwan",
      github: "https://github.com/rezwan",
      twitter: "https://twitter.com/rezwan",
    },
  },

  {
    id: "2",
    name: "Sarah Johnson",
    role: "UI/UX Designer",
    bio: "Designing clean and modern user experiences focused on accessibility, usability, and conversion.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
    sortOrder: 2,
    category: "ADVISOR",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    linkedinUrl: "https://linkedin.com/in/sarahjohnson",
    instagramUrl: "https://instagram.com/sarahdesigns",
    facebookUrl: "https://facebook.com/sarahjohnson",

    socials: {
      linkedin: "https://linkedin.com/in/sarahjohnson",
      instagram: "https://instagram.com/sarahdesigns",
      facebook: "https://facebook.com/sarahjohnson",
    },
  },

  {
    id: "3",
    name: "Michael Chen",
    role: "Backend Engineer",
    bio: "Focused on API architecture, database optimization, and secure backend systems.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop",
    sortOrder: 3,
    category: "ORGANIZER",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    githubUrl: "https://github.com/michaelchen",
    linkedinUrl: "https://linkedin.com/in/michaelchen",

    socials: {
      github: "https://github.com/michaelchen",
      linkedin: "https://linkedin.com/in/michaelchen",
    },
  },

  {
    id: "4",
    name: "Emily Davis",
    role: "Marketing Specialist",
    bio: "Helping brands grow through data-driven digital marketing and strategic storytelling.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop",
    sortOrder: 4,
    category: "ADMIN",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    twitterUrl: "https://twitter.com/emilydavis",
    instagramUrl: "https://instagram.com/emilydavis",

    socials: {
      twitter: "https://twitter.com/emilydavis",
      instagram: "https://instagram.com/emilydavis",
    },
  },

  {
    id: "5",
    name: "David Wilson",
    role: "DevOps Engineer",
    bio: "Automating deployments, scaling infrastructure, and improving CI/CD pipelines.",
    image:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=1200&auto=format&fit=crop",
    sortOrder: 5,
    category: "ADVISOR",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    linkedinUrl: "https://linkedin.com/in/davidwilson",
    githubUrl: "https://github.com/davidwilson",

    socials: {
      linkedin: "https://linkedin.com/in/davidwilson",
      github: "https://github.com/davidwilson",
    },
  },

  {
    id: "6",
    name: "Sophia Martinez",
    role: "Project Manager",
    bio: "Leading agile teams and delivering high-quality digital products on time.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop",
    sortOrder: 6,
    category: "ORGANIZER",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    linkedinUrl: "https://linkedin.com/in/sophiamartinez",
    facebookUrl: "https://facebook.com/sophiamartinez",

    socials: {
      linkedin: "https://linkedin.com/in/sophiamartinez",
      facebook: "https://facebook.com/sophiamartinez",
    },
  },
];

export default function Ambassador() {
  return (
    <section id="schedule" className=" px-[5%] py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-widest text-gray-500">
            Face of
          </div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            oddomo bangladesh <br />
            <span className="text-neon-lime">2026</span>
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {fakeTeamMembers.map((member, index) => (
              <TeamMemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
