type ScheduleItem = {
  time: string;
  title: string;
  location?: string;
};

import TeamMemberCard from "@/module/team/components/TeamMemberCard";
import type { TeamMember } from "@/types/team";

export const ambassador: TeamMember[] = [
  {
    id: "1",
    name: "Syed Abid Hussain Sami",
    role: "Cricketer, Cricket Analyst,Commentator",
    // bio: "Passionate about building scalable web applications with Next.js, NestJS, and modern cloud infrastructure.",
    image:
      "https://assets.merchcommunication.com/ambassador/ambassador-sami.jpeg",
    sortOrder: 1,
    category: "ADMIN",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    linkedinUrl: "https://linkedin.com/in/rezwan",
    githubUrl: "https://github.com/rezwan",
    twitterUrl: "https://twitter.com/rezwan",

    socials: {
      facebook: "https://www.facebook.com/syed.a.sami.77",
    },
  },

  {
    id: "2",
    name: "Salma Khatun",
    role: "Former Captain bangladesh national women’s cricket team",
    // bio: "Designing clean and modern user experiences focused on accessibility, usability, and conversion.",
    image:
      "https://assets.merchcommunication.com/ambassador/ambassador-salma.jpeg",
    sortOrder: 2,
    category: "ADVISOR",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    linkedinUrl: "https://linkedin.com/in/sarahjohnson",
    instagramUrl: "https://instagram.com/sarahdesigns",
    facebookUrl: "https://facebook.com/sarahjohnson",

    socials: {
      facebook: "https://www.facebook.com/share/1E4LHwfnwT/",
    },
  },

  {
    id: "3",
    name: "Fahim Rahman",
    role: "Famous Sports Journalist",
    // bio: "Focused on API architecture, database optimization, and secure backend systems.",
    image:
      "https://assets.merchcommunication.com/ambassador/ambassador-fahim.jpeg",
    sortOrder: 3,
    category: "ORGANIZER",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    githubUrl: "https://github.com/michaelchen",
    linkedinUrl: "https://linkedin.com/in/michaelchen",

    socials: {
      facebook: "https://www.facebook.com/share/1Bmd573nNn/",
    },
  },

  {
    id: "4",
    name: "Fahad Hossain",
    role: "Teacher , Fahad's Tutorial",
    // bio: "Helping brands grow through data-driven digital marketing and strategic storytelling.",
    image:
      "https://assets.merchcommunication.com/ambassador/ambassador-fahad.jpeg",
    sortOrder: 4,
    category: "ADMIN",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    twitterUrl: "https://twitter.com/emilydavis",
    instagramUrl: "https://instagram.com/emilydavis",

    socials: {
      facebook: "https://www.facebook.com/share/1LEKiQt5v1/",
    },
  },

  {
    id: "5",
    name: "RJ Auhona",
    role: "Famous Television Anchor, Radio Jockey",
    // bio: "Automating deployments, scaling infrastructure, and improving CI/CD pipelines.",
    image:
      "https://assets.merchcommunication.com/ambassador/ambassador-auhona.jpeg",
    sortOrder: 5,
    category: "ADVISOR",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    linkedinUrl: "https://linkedin.com/in/davidwilson",
    githubUrl: "https://github.com/davidwilson",

    socials: {
      facebook: "https://www.facebook.com/share/#/",
    },
  },

  {
    id: "6",
    name: "Mohammad Mohasin",
    role: "Captain Bangladesh Wheelchair Cricket Team",
    // bio: "Leading agile teams and delivering high-quality digital products on time.",
    image:
      "https://assets.merchcommunication.com/ambassador/ambassador-mohasin.jpeg",
    sortOrder: 6,
    category: "ORGANIZER",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    linkedinUrl: "https://linkedin.com/in/sophiamartinez",
    facebookUrl: "https://facebook.com/sophiamartinez",

    socials: {
      facebook: "https://www.facebook.com/share/#/",
    },
  },
];

export default function Ambassador() {
  return (
    <section id="schedule" className=" px-[5%] py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-lg uppercase tracking-widest text-gray-500">
            Face of
          </div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            oddomo bangladesh <br />
            <span className="text-neon-lime">2026</span>
          </h2>
        </div>

        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-4xl font-bold uppercase leading-relaxed text-gray-800 ">
              ambassador
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {ambassador.map((member, index) => (
              <TeamMemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>

        {/* <div className="space-y-4 mt-16">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-4xl font-bold uppercase leading-relaxed text-gray-800 ">
              infulancer
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {ambassador.map((member, index) => (
              <TeamMemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}
