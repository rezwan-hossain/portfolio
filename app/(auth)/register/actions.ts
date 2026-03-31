"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 👇 This tells Supabase where to redirect after email click
      //   emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      emailRedirectTo: `http://localhost:3000/auth/callback`,
      data: {
        full_name: firstName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect to a confirmation page or dashboard
  // redirect("/register/confirm");
  redirect(`/register/confirm?email=${encodeURIComponent(email)}`);
}

// async function handleGoogleLogin() {
//   const { error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//     options: {
//       redirectTo: `${window.location.origin}/auth/callback`,
//     },
//   });

//   if (error) {
//     console.error("Google login error:", error.message);
//     alert(error.message);
//   }
// }

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/auth/callback",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Something went wrong" };
}
