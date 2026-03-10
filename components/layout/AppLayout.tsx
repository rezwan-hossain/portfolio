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
        <SiteHeader />

        <main className="min-h-screen">{children}</main>

        {/* Site Footer */}
        <SiteFooter />
      </div>
    </>
  );
}
