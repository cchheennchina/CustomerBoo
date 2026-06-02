"use client";

import { useState } from "react";
import { GlassButton, GlassCard, SectionTitle } from "@/components/glass/GlassCard";

export function CsvImportPanel() {
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<{
    validCount: number;
    errorCount: number;
    errors: Array<{ rowNumber: number; message: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handlePreview() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/csv/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setPreview(data);
    setLoading(false);
  }

  async function handleImport() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/csv/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setMessage(data.message ?? "导入完成");
    setLoading(false);
    if (data.success) window.location.reload();
  }

  async function downloadTemplate() {
    const res = await fetch("/api/csv/template");
    const text = await res.text();
    const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "opportunities-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <GlassCard glow="cyan">
      <SectionTitle
        title="CSV 导入"
        subtitle="预览校验后写入数据库"
        action={
          <GlassButton variant="ghost" onClick={downloadTemplate}>
            下载模板
          </GlassButton>
        }
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="粘贴 CSV 内容，或先下载模板填写..."
        className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-accent-cyan/50"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <GlassButton onClick={handlePreview} disabled={loading || !content}>
          预览校验
        </GlassButton>
        <GlassButton
          variant="ghost"
          onClick={handleImport}
          disabled={loading || !content}
        >
          确认导入
        </GlassButton>
      </div>
      {preview ? (
        <p className="mt-3 text-sm text-white/70">
          有效 {preview.validCount} 行，错误 {preview.errorCount} 行
          {preview.errors?.slice(0, 3).map((e) => (
            <span key={e.rowNumber} className="block text-rose-300">
              第 {e.rowNumber} 行：{e.message}
            </span>
          ))}
        </p>
      ) : null}
      {message ? <p className="mt-2 text-sm text-accent-cyan">{message}</p> : null}
    </GlassCard>
  );
}
