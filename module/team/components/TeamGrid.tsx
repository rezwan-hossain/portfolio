// module/team/components/TeamGrid.tsx
import type { TeamMember } from "@/types/team";
import TeamMemberCard from "./TeamMemberCard";

type Props = {
  members: TeamMember[];
  title?: string;
  subtitle?: string;
};

const TeamGrid = ({ members, title, subtitle }: Props) => {
  if (members.length === 0) return null;

  return (
    <section>
      {(title || subtitle) && (
        <div className="mb-10 text-center">
          {title && (
            <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="font-body text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {members.map((member, index) => (
          <TeamMemberCard key={member.id} member={member} index={index} />
        ))}
      </div>
    </section>
  );
};

export default TeamGrid;
