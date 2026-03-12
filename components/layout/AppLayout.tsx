import Navbar from "./Navbar";
import SiteHeader2 from "./Navbar2";
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
        <SiteHeader2 />

        <main className="min-h-screen">{children}</main>

        {/* Site Footer */}
        <SiteFooter />
      </div>
    </>
  );
}
