"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassButton, GlassCard } from "@/components/glass/GlassCard";
import { DEMO_ACCOUNTS } from "@/lib/auth/constants";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("marketer");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "登录失败");
      return;
    }

    const from = searchParams.get("from") || "/dashboard";
    router.push(from);
    router.refresh();
  }

  return (
    <GlassCard glow="purple" className="w-full max-w-md">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
        客户关系跟进管家
      </p>
      <h1 className="mt-2 text-2xl font-semibold">账号登录</h1>
      <p className="mt-2 text-sm text-white/60">请使用演示账号登录管理端</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="text-white/60">用户名</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-accent-purple/50"
            autoComplete="username"
          />
        </label>
        <label className="block text-sm">
          <span className="text-white/60">密码</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-accent-purple/50"
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <GlassButton type="submit" className="w-full" disabled={loading}>
          {loading ? "登录中..." : "登录"}
        </GlassButton>
      </form>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
        <p className="mb-2 font-medium text-white/80">演示账号</p>
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.username}
            type="button"
            className="mb-1 block w-full rounded-xl px-2 py-1 text-left hover:bg-white/10"
            onClick={() => {
              setUsername(acc.username);
              setPassword(acc.password);
            }}
          >
            {acc.displayName} — 用户名 <code>{acc.username}</code> / 密码{" "}
            <code>{acc.password}</code>
            {acc.role === "ADMIN" ? "（可进后台配置）" : ""}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="text-white/60">加载中...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
