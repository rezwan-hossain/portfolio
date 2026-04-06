import { Suspense } from "react";
import Navbar from "./Navbar";
import SiteHeader2 from "./Navbar2";
import SiteHeader4 from "./Navbar4";
// import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import dynamic from "next/dynamic";

const SiteFooter = dynamic(() => import("./SiteFooter"), {
  ssr: true,
});

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <div className="">
        {/* Site Header */}
        {/* <SiteHeader /> */}
        {/* <Navbar /> */}
        {/* <SiteHeader2 /> */}
        <Suspense fallback={<div className="h-16 bg-black" />}>
          <SiteHeader4 />
        </Suspense>

        <main className="min-h-screen">
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>

        {/* Site Footer */}
        <Suspense fallback={<div className="h-48 bg-black" />}>
          <SiteFooter />
        </Suspense>
      </div>
    </>
  );
}
