import { createClient } from "@/lib/supabase/server";
import RegisterPage from "@/module/register/pages/RegisterPage";
import { redirect } from "next/navigation";

export default async function page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already logged in, redirect to dashboard/home
  if (user) {
    redirect("/dashboard");
  }

  return <RegisterPage />;
}
