import { DollarSign, FolderOpen, TrendingUp, Users } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { HeroText } from "@/components/ui/HeroText";

const DashboardPage = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: "$36,600",
      change: "+12.5% from last month",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Active Users",
      value: "2,841",
      change: "+8.2% from last month",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "-0.4% from last month",
      changeType: "negative" as const,
      icon: TrendingUp,
    },
    {
      title: "Active Projects",
      value: "18",
      change: "2 completed this week",
      changeType: "neutral" as const,
      icon: FolderOpen,
    },
  ];

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-32 ">
        <HeroText title="Dashboard" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>

          {/* Charts + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">{/* <RevenueChart /> */}</div>
            <div className="lg:col-span-2">{/* <ActivityFeed /> */}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
