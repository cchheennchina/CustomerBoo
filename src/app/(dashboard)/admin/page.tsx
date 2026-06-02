import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { AdminConfigPanel } from "@/components/admin/AdminConfigPanel";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <>
      <TopBar title="后台系统配置" />
      <p className="mb-4 text-sm text-white/60">
        管理员 {user.displayName} — 配置仪表盘布局、组件展示与下钻行为
      </p>
      <AdminConfigPanel />
    </>
  );
}
