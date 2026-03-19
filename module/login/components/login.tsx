"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loginUser } from "@/app/(auth)/login/actions";
import { signInWithGoogle } from "@/app/(auth)/register/actions";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await loginUser(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const result = await signInWithGoogle();
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-xl shadow-md bg-white">
        {/* Left Image */}
        <div className="hidden md:block relative">
          <Image
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/leftSideImage.png"
            alt="leftSideImage"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Login Form */}
        <div className="flex flex-col items-center justify-center py-12 px-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <h2 className="text-4xl text-gray-900 font-medium">Login</h2>
            <p className="text-sm text-gray-500/90 mt-3 text-center">
              Welcome back! Please sign in to continue
            </p>

            {/* Google Login */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="cursor-pointer w-full mt-8 bg-gray-500/10 flex items-center justify-center h-16 rounded-full"
            >
              <Image
                src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg"
                alt="googleLogo"
                width={90}
                height={90}
                className="object-contain" // Ensures it keeps its aspect ratio
              />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 w-full my-5">
              <div className="w-full h-px bg-gray-300/90"></div>
              <p className="text-nowrap text-sm text-gray-500/90">
                or login with email
              </p>
              <div className="w-full h-px bg-gray-300/90"></div>
            </div>

            {/* Email */}
            <div className="flex items-center w-full border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6">
              <input
                type="email"
                placeholder="Email id"
                className="bg-transparent text-gray-500/80 outline-none text-sm w-full h-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="flex items-center mt-6 w-full border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6">
              <input
                type="password"
                placeholder="Password"
                className="bg-transparent text-gray-500/80 outline-none text-sm w-full h-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="w-full text-right mt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-indigo-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm mt-3 w-full text-left">
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="text-gray-500/90 text-sm mt-4">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-400 hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
