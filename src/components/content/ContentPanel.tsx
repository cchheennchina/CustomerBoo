"use client";

import { useState } from "react";
import { GlassButton } from "@/components/glass/GlassCard";

export function ContentPanel({
  opportunities,
}: {
  opportunities: Array<{ id: string; label: string }>;
}) {
  const [opportunityId, setOpportunityId] = useState(opportunities[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [valuePoint, setValuePoint] = useState("");
  const [message, setMessage] = useState("");

  async function submit() {
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, title, summary, valuePoint }),
    });
    const data = await res.json();
    setMessage(data.message ?? "已保存");
    if (data.success) window.location.reload();
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <select
        value={opportunityId}
        onChange={(e) => setOpportunityId(e.target.value)}
        className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none md:col-span-2"
      >
        {opportunities.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
        className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
      />
      <input
        value={valuePoint}
        onChange={(e) => setValuePoint(e.target.value)}
        placeholder="产品价值点"
        className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
      />
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="内容摘要"
        className="min-h-24 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none md:col-span-2"
      />
      <GlassButton onClick={submit}>生成多渠道文案并保存</GlassButton>
      {message ? <p className="text-sm text-accent-cyan">{message}</p> : null}
    </div>
  );
}
