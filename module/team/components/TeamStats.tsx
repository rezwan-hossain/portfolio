// module/team/components/TeamStats.tsx
import { Users, Globe, Trophy, Heart } from "lucide-react";

const stats = [
  { icon: Users, value: "20+", label: "Team Members" },
  { icon: Globe, value: "5+", label: "Countries" },
  { icon: Trophy, value: "100+", label: "Events Hosted" },
  { icon: Heart, value: "50K+", label: "Happy Runners" },
];

const TeamStats = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    {stats.map((stat) => (
      <div
        key={stat.label}
        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 sm:p-6 text-center transition-all hover:border-neon-lime hover:shadow-md"
      >
        {/* Background accent */}
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-neon-lime/5 transition-transform duration-500 group-hover:scale-[3]" />

        <div className="relative">
          <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center transition-colors group-hover:bg-neon-lime/10">
            <stat.icon
              size={20}
              className="text-gray-400 transition-colors group-hover:text-neon-lime"
            />
          </div>
          <p className="font-display text-2xl sm:text-3xl tracking-wide text-foreground">
            {stat.value}
          </p>
          <p className="font-body text-xs sm:text-sm text-muted-foreground mt-1">
            {stat.label}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export default TeamStats;
