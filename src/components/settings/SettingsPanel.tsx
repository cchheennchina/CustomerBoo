"use client";

import { useState } from "react";
import { GlassButton } from "@/components/glass/GlassCard";

export function SettingsPanel({
  settings,
}: {
  settings: {
    email: string;
    notifyEmail: boolean;
    notifyInApp: boolean;
    dailyBriefEnabled: boolean;
    weeklyWarPackEnabled: boolean;
    availableSlots: string;
  };
}) {
  const [form, setForm] = useState(settings);
  const [message, setMessage] = useState("");

  async function save() {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message ?? "已保存");
  }

  async function triggerDailyBrief() {
    await fetch("/api/notifications/daily-brief", { method: "POST" });
    setMessage("晨间简报已推送（含邮件占位）");
  }

  return (
    <div className="space-y-3 text-sm">
      <label className="block">
        <span className="text-white/60">通知邮箱</span>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
        />
      </label>
      {(
        [
          ["notifyEmail", "邮件通知"],
          ["notifyInApp", "站内通知"],
          ["dailyBriefEnabled", "每日体温图"],
          ["weeklyWarPackEnabled", "周一作战包"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
          />
          {label}
        </label>
      ))}
      <label className="block">
        <span className="text-white/60">可联络时段 JSON</span>
        <textarea
          value={form.availableSlots}
          onChange={(e) =>
            setForm({ ...form, availableSlots: e.target.value })
          }
          className="mt-1 min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 p-3 outline-none"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <GlassButton onClick={save}>保存设置</GlassButton>
        <GlassButton variant="ghost" onClick={triggerDailyBrief}>
          立即推送晨间简报
        </GlassButton>
      </div>
      {message ? <p className="text-accent-cyan">{message}</p> : null}
    </div>
  );
}
