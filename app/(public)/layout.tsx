import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingActions } from "@/components/layout/floating-actions";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getSession } from "@/lib/auth";
import { homePathForRole } from "@/lib/permissions";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const authHref = session ? homePathForRole(session.role) : "/login";
  const authLabel = session ? "Dashboard" : "Login";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar authHref={authHref} authLabel={authLabel} />
      <main id="main-content" className="pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
      </main>
      <Footer />
      <FloatingActions />
      <MobileBottomNav authHref={authHref} authLabel={authLabel} />
    </div>
  );
}
