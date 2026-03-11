import { ArrowRight } from "lucide-react";

const RegisterCTA = () => (
  <section id="register" className="py-20 md:py-24">
    <div className="container mx-auto">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-neon-lime p-10 text-center md:p-16">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/10" />

        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="mb-4 font-display text-4xl font-black uppercase leading-tight text-white md:text-6xl">
            Your Finish Line
            <br />
            Starts Here
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-lg text-white/80 md:text-xl">
            Don't wait. Spots are limited. Secure your place in the most epic
            running event of the year.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border-2 border-white px-10 py-6 font-display text-base font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              Register Now
              <ArrowRight size={18} />
            </a>
          </div>
          {/* <a href="#_" className="relative inline-block text-lg group">
            <span className="relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-gray-800 transition-colors duration-300 ease-out border-2 border-gray-900 rounded-lg group-hover:text-white">
              <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-gray-50"></span>
              <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gray-900 group-hover:-rotate-180 ease"></span>
              <span className="relative">Button Text</span>
            </span>
            <span
              className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-gray-900 rounded-lg group-hover:mb-0 group-hover:mr-0"
              data-rounded="rounded-lg"
            ></span>
          </a> */}

          <p className="mt-6 text-sm text-white/70">
            Early bird pricing ends soon • Limited slots available
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default RegisterCTA;
