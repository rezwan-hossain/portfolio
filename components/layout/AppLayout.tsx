import { Suspense } from "react";
import Navbar from "./Navbar";
import SiteHeader2 from "./Navbar2";
import SiteHeader4 from "./Navbar4";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
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

        <main className="min-h-screen">{children}</main>

        {/* Site Footer */}
        <Suspense fallback={<div className="h-48 bg-black" />}>
          <SiteFooter />
        </Suspense>
      </div>
    </>
  );
}
