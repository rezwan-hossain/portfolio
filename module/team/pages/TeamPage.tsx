// module/team/pages/TeamPage.tsx
import { HeroText } from "@/components/ui/HeroText";
import TeamGrid from "../components/TeamGrid";
import TeamStats from "../components/TeamStats";
import type { TeamMember } from "@/types/team";

type TeamPageProps = {
  adminMembers: TeamMember[];
  advisorMembers: TeamMember[];
};

const TeamPage = ({ adminMembers, advisorMembers }: TeamPageProps) => {
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
          <TeamStats
            totalMembers={adminMembers.length + advisorMembers.length}
            adminCount={adminMembers.length}
            teamCount={advisorMembers.length}
          />
        </div>

        {/* Admin Team */}
        {adminMembers.length > 0 && (
          <div className="mb-20">
            <TeamGrid
              members={adminMembers}
              title="ADMIN TEAM"
              subtitle="The visionaries steering our mission forward"
            />
          </div>
        )}

        {/* Full Team */}
        {advisorMembers.length > 0 && (
          <div className="mb-20">
            <TeamGrid
              members={advisorMembers}
              title="THE CREW"
              subtitle="The talented individuals who bring everything together"
            />
          </div>
        )}

        {/* Empty State */}
        {adminMembers.length === 0 && advisorMembers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Team members coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
