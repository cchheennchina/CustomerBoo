"use client";

import { useState } from "react";
import { GlassButton } from "@/components/glass/GlassCard";

export function WarRoomActions() {
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    await fetch("/api/weekly-war-room", { method: "POST" });
    setLoading(false);
    window.location.reload();
  }

  async function exportMarkdown() {
    const res = await fetch("/api/weekly-war-room/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weekly-war-map.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf() {
    const res = await fetch("/api/weekly-war-room/export?format=pdf");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weekly-war-map.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <GlassButton onClick={generate} disabled={loading}>
        生成本周作战包
      </GlassButton>
      <GlassButton variant="ghost" onClick={exportMarkdown}>
        导出 Markdown
      </GlassButton>
      <GlassButton variant="ghost" onClick={exportPdf}>
        导出 PDF（文本版）
      </GlassButton>
    </div>
  );
}
