"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CalendarRange,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Settings,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/customers", label: "客户信息", icon: Building2 },
  { href: "/opportunities", label: "客户机会", icon: Users },
  { href: "/follow-ups", label: "智能跟进", icon: MessageSquare },
  { href: "/content", label: "内容推送", icon: Newspaper },
  { href: "/meetings", label: "会议纪要", icon: FileText },
  { href: "/risks", label: "风险预警", icon: AlertTriangle },
  { href: "/weekly-war-room", label: "周作战包", icon: CalendarRange },
  { href: "/tasks", label: "任务中心", icon: Target },
  { href: "/admin", label: "后台配置", icon: Shield, adminOnly: true },
  { href: "/settings", label: "设置", icon: Settings },
];

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const items = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="hidden w-20 shrink-0 flex-col items-center gap-3 border-r border-white/10 bg-navy-900/80 py-6 backdrop-blur-xl lg:flex">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink text-sm font-bold">
        管
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={cn(
              "group flex h-11 w-11 items-center justify-center rounded-2xl transition",
              active
                ? "bg-white/15 text-white shadow-[0_0_20px_-5px_rgba(124,92,255,0.8)]"
                : "text-white/50 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </aside>
  );
}

export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const items = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex gap-1 overflow-x-auto border-t border-white/10 bg-navy-900/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      {items.slice(0, 7).map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-xl px-3 py-2 text-xs",
              active ? "bg-white/15 text-white" : "text-white/60"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
