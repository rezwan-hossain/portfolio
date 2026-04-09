// app/team/page.tsx
import TeamPage from "@/module/team/pages/TeamPage";
import { getActiveTeamMembers } from "../actions/team";

export const metadata = {
  title: "Our Team",
  description: "Meet the passionate team behind every race and finish line.",
};

export default async function Page() {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const { members } = await getActiveTeamMembers();

  const adminMembers = members.filter((m) => m.category === "ADMIN");
  const advisorMembers = members.filter((m) => m.category === "ADVISOR");
  const organizerMembers = members.filter((m) => m.category === "ORGANIZER");

  return (
    <TeamPage
      adminMembers={adminMembers}
      advisorMembers={advisorMembers}
      organizerMembers={organizerMembers}
    />
  );
}
