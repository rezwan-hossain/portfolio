import Image from "next/image";

export default function Login() {
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
          <form className="w-full max-w-sm flex flex-col items-center">
            <h2 className="text-4xl text-gray-900 font-medium">Sign in</h2>

            <p className="text-sm text-gray-500/90 mt-3 text-center">
              Welcome back! Please sign in to continue
            </p>

            {/* Google Login */}
            <button
              type="button"
              className="w-full mt-8 bg-gray-500/10 flex items-center justify-center h-16 rounded-full"
            >
              <Image
                src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg"
                alt="googleLogo"
                width={24}
                height={24}
              />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 w-full my-5">
              <div className="w-full h-px bg-gray-300/90"></div>
              <p className="text-nowrap text-sm text-gray-500/90">
                or sign in with email
              </p>
              <div className="w-full h-px bg-gray-300/90"></div>
            </div>

            {/* Email */}
            <div className="flex items-center w-full border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <input
                type="email"
                placeholder="Email id"
                className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                required
              />
            </div>

            {/* Password */}
            <div className="flex items-center mt-6 w-full border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <input
                type="password"
                placeholder="Password"
                className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                required
              />
            </div>

            {/* Remember */}
            <div className="w-full flex items-center justify-between mt-8 text-gray-500/80">
              <div className="flex items-center gap-2">
                <input className="h-5" type="checkbox" id="checkbox" />
                <label className="text-sm" htmlFor="checkbox">
                  Remember me
                </label>
              </div>

              <a className="text-sm underline" href="#">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="mt-8 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity"
            >
              Login
            </button>

            <p className="text-gray-500/90 text-sm mt-4">
              Don’t have an account?{" "}
              <a className="text-indigo-400 hover:underline" href="#">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
