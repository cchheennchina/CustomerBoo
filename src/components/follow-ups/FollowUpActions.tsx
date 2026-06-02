"use client";

import { useState } from "react";
import { GlassButton, GlassCard } from "@/components/glass/GlassCard";

export function FollowUpActions({
  opportunities,
}: {
  opportunities: Array<{
    id: string;
    name: string;
    industry: string | null;
    contactName: string;
  }>;
}) {
  const [selected, setSelected] = useState(opportunities[0]?.id ?? "");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!selected) return;
    setLoading(true);
    const res = await fetch("/api/follow-ups/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: selected }),
    });
    const data = await res.json();
    setScript(data.script ?? "");
    setLoading(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
        >
          {opportunities.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <GlassButton onClick={generate} disabled={loading}>
          生成话术
        </GlassButton>
      </div>
      {script ? (
        <textarea
          readOnly
          value={script}
          className="mt-3 min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm"
        />
      ) : null}
    </div>
  );
}
