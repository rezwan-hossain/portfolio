"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ConfirmContent() {
  const params = useSearchParams();
  const email = params.get("email") || "";

  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [cooldown, setCooldown] = useState(0);

  // ⏱️ Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // 🔁 Resend handler
  const handleResend = async () => {
    if (!email) {
      setMessage("❌ Email address not found");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Handle specific error types
        if (error.message.toLowerCase().includes("rate limit")) {
          setMessage(
            "⏳ Too many requests. Please wait a moment before trying again.",
          );
          setCooldown(90); // 90 seconds for rate limit
        } else if (error.message.toLowerCase().includes("user not found")) {
          setMessage("❌ Account not found. Please sign up first.");
        } else {
          setMessage(`❌ ${error.message}`);
        }
        setMessageType("error");
      } else {
        setMessage("✅ Confirmation email sent! Check your inbox.");
        setMessageType("success");
        setCooldown(60); // 60 second cooldown on success
      }
    } catch (err) {
      setMessage("❌ Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        {/* <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/MerchSports-small.png"
              alt="MerchSports"
              width={72}
              height={72}
              className="rounded-full object-cover mx-auto"
              priority
            />
          </Link>
        </div> */}

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black uppercase tracking-wider text-gray-900 text-center mb-2">
            Check Your Email
          </h1>

          {/* Email Display */}
          <p className="text-sm text-gray-600 text-center mb-6">
            We sent a confirmation link to{" "}
            <strong className="text-gray-900 break-all">{email}</strong>
          </p>

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 space-y-2">
            <p className="text-xs text-gray-600 flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">1.</span>
              <span>Click the link in the email to confirm your account</span>
            </p>
            <p className="text-xs text-gray-600 flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">2.</span>
              <span>The link expires in 24 hours</span>
            </p>
            <p className="text-xs text-gray-600 flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">3.</span>
              <span>Check your spam folder if you don't see it</span>
            </p>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            className="w-full h-12 flex items-center justify-center gap-2 bg-gray-900 text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              <>
                <Mail size={16} />
                Resend Confirmation Email
              </>
            )}
          </button>

          {/* Message Display */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg border flex items-start gap-2 ${
                messageType === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : messageType === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Help Text */}
          <p className="text-xs text-gray-400 text-center mt-6">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-500">
            Already confirmed?{" "}
            <Link
              href="/login"
              className="font-bold text-gray-900 hover:underline uppercase tracking-wider text-xs"
            >
              Sign In
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            Wrong email?{" "}
            <Link
              href="/register"
              className="font-bold text-gray-900 hover:underline uppercase tracking-wider text-xs"
            >
              Sign Up Again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
