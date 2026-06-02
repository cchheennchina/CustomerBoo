import { Bell } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "@/components/layout/UserMenu";
import { getSessionUser } from "@/lib/auth/session";

export async function TopBar({ title }: { title: string }) {
  const user = await getSessionUser();

  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          客户关系跟进管家
        </p>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
        >
          <Bell className="h-4 w-4" />
        </Link>
        {user ? (
          <UserMenu user={user} />
        ) : (
          <Link href="/login" className="text-sm text-accent-cyan">
            登录
          </Link>
        )}
      </div>
    </header>
  );
}
