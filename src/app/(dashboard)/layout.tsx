import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { getSessionUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} />
      <main className="flex-1 px-4 pb-24 pt-6 lg:px-8">{children}</main>
      <MobileNav isAdmin={isAdmin} />
    </div>
  );
}
