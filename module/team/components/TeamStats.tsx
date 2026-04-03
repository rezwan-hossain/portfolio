type Props = {
  totalMembers?: number;
  adminCount?: number;
  teamCount?: number;
};

const TeamStats = ({
  totalMembers = 12,
  adminCount = 4,
  teamCount = 8,
}: Props) => {
  const stats = [
    { value: totalMembers, label: "Team Members" },
    { value: adminCount, label: "Leadership" },
    { value: teamCount, label: "Core Team" },
    { value: "100+", label: "Events Organized" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="text-center p-6 bg-white rounded-2xl border border-gray-200"
        >
          <p className="text-4xl md:text-5xl font-black text-gray-900">
            {stat.value}
          </p>
          <p className="text-sm text-gray-500 mt-2 uppercase tracking-wider font-medium">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TeamStats;
