"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 👇 This tells Supabase where to redirect after email click
      //   emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      emailRedirectTo: `http://localhost:3000/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect to a confirmation page or dashboard
  redirect("/register/confirm");
}
