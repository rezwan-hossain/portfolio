"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmContent() {
  const params = useSearchParams();
  const email = params.get("email") || "";

  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // ⏱ cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // 🔁 resend handler
  const handleResend = async () => {
    if (!email) {
      setMessage("Email not found");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Confirmation email sent!");
      setCooldown(30); // 30 sec cooldown
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <h2 className="text-3xl font-semibold text-gray-800 tracking-wide">
          Check your email
        </h2>

        <p className="text-gray-500 mt-2">
          We sent a confirmation link to{" "}
          <span className="font-medium text-gray-700">{email}</span>.
        </p>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={loading || cooldown > 0}
          className="mt-6 w-full h-11 rounded-md bg-indigo-500 text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading
            ? "Sending..."
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend Confirmation Email"}
        </button>

        {/* Message */}
        {message && (
          <p className="mt-4 text-sm text-gray-600">{message}</p>
        )}

        {/* Back to login */}
        <p className="mt-6 text-sm text-gray-500">
          Already confirmed?{" "}
          <a href="/login" className="text-indigo-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}