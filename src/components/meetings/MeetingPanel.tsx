"use client";

import { useState } from "react";
import { GlassButton } from "@/components/glass/GlassCard";

export function MeetingPanel({
  opportunities,
}: {
  opportunities: Array<{ id: string; label: string }>;
}) {
  const [opportunityId, setOpportunityId] = useState(opportunities[0]?.id ?? "");
  const [title, setTitle] = useState("项目沟通会");
  const [rawInput, setRawInput] = useState("");
  const [result, setResult] = useState<{
    summary?: {
      needs: string[];
      concerns: string[];
      hiddenExpectation: string;
      changes: string[];
      actionItems: Array<{ title: string; assignee: string; dueDays: number }>;
      structuredMinutes: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, title, rawInput }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  async function createTasks() {
    if (!result?.summary?.actionItems) return;
    await fetch("/api/meetings/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunityId,
        actionItems: result.summary.actionItems,
      }),
    });
    alert("行动项已同步到任务中心");
  }

  return (
    <div className="space-y-3">
      <select
        value={opportunityId}
        onChange={(e) => setOpportunityId(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
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
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
      />
      <textarea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder="粘贴会议转写文本..."
        className="min-h-40 w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none"
      />
      <GlassButton onClick={analyze} disabled={loading || !rawInput}>
        生成结构化纪要
      </GlassButton>
      {result?.summary ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm">
          <p className="font-medium">隐性期待：{result.summary.hiddenExpectation}</p>
          <p className="mt-2 text-white/70">
            需求变化：{result.summary.changes.join("；")}
          </p>
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-white/60">
            {result.summary.structuredMinutes}
          </pre>
          <GlassButton className="mt-3" variant="ghost" onClick={createTasks}>
            一键创建行动项任务
          </GlassButton>
        </div>
      ) : null}
    </div>
  );
}
