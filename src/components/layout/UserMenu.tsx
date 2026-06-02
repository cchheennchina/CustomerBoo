"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { GlassButton } from "@/components/glass/GlassCard";

export function UserMenu({
  user,
}: {
  user: {
    displayName: string;
    username: string;
    role: string;
  };
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple" />
        <div className="hidden sm:block">
          <p className="text-sm font-medium">{user.displayName}</p>
          <p className="text-xs text-white/50">
            @{user.username}
            {user.role === "ADMIN" ? " · 管理员" : ""}
          </p>
        </div>
      </div>
      <GlassButton variant="ghost" onClick={logout} title="退出登录">
        <LogOut className="h-4 w-4" />
      </GlassButton>
    </div>
  );
}
