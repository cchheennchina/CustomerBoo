"use client";

import { GlassButton } from "@/components/glass/GlassCard";

export function RiskActions({ riskId }: { riskId: string }) {
  async function createPlan() {
    const res = await fetch("/api/risks/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riskId }),
    });
    const data = await res.json();
    alert(data.message ?? "已创建应对计划");
  }

  return (
    <GlassButton className="mt-4" variant="danger" onClick={createPlan}>
      一键创建应对计划
    </GlassButton>
  );
}
