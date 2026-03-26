// app/dashboard/page.tsx
import DashboardPage from "@/module/dashboard/pages/DashboardPage";
import { getDashboardData } from "@/app/actions/dashboard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getDashboardData();

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{data.error}</p>
      </div>
    );
  }

  return (
    <DashboardPage
      user={data.user}
      stats={data.stats}
      orders={data.orders}
      activeEvents={data.activeEvents}
    />
  );
}
