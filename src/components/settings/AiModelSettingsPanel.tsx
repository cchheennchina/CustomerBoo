"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AI_MODEL_PRESETS,
  DEFAULT_AI_CONFIG,
  type AiConfig,
} from "@/lib/config/ai";
import { GlassButton, GlassCard, SectionTitle } from "@/components/glass/GlassCard";

interface AiConfigResponse {
  config: AiConfig;
  effective: {
    model: string;
    baseUrl: string;
    enabled: boolean;
    hasApiKey: boolean;
    source: string;
  };
  canEdit: boolean;
}

export function AiModelSettingsPanel() {
  const [form, setForm] = useState<AiConfig>(DEFAULT_AI_CONFIG);
  const [presetId, setPresetId] = useState("gpt-4o-mini");
  const [canEdit, setCanEdit] = useState(false);
  const [effective, setEffective] = useState<AiConfigResponse["effective"] | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const selectedPreset = useMemo(
    () => AI_MODEL_PRESETS.find((p) => p.id === presetId),
    [presetId]
  );

  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then((r) => r.json())
      .then((data: AiConfigResponse) => {
        if (data.config) {
          setForm(data.config);
          const matched = AI_MODEL_PRESETS.find(
            (p) => p.model === data.config.model && p.baseUrl === data.config.baseUrl
          );
          setPresetId(matched?.id ?? "custom");
        }
        setCanEdit(data.canEdit);
        setEffective(data.effective);
        setLoading(false);
      });
  }, []);

  function applyPreset(id: string) {
    setPresetId(id);
    const preset = AI_MODEL_PRESETS.find((p) => p.id === id);
    if (!preset || id === "custom") return;
    setForm((prev) => ({
      ...prev,
      provider: preset.provider,
      model: preset.model,
      baseUrl: preset.baseUrl,
    }));
  }

  async function save() {
    const res = await fetch("/api/admin/ai-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message ?? data.error ?? "保存完成");
    if (data.success) {
      const refreshed = await fetch("/api/admin/ai-config").then((r) => r.json());
      setEffective(refreshed.effective);
      if (refreshed.config) setForm(refreshed.config);
    }
  }

  async function testConnection() {
    setTesting(true);
    setMessage("");
    const res = await fetch("/api/admin/ai-config/test", { method: "POST" });
    const data = await res.json();
    setTesting(false);
    setMessage(data.message + (data.reply ? `：${data.reply}` : ""));
  }

  if (loading) return <p className="text-white/60">加载 AI 配置中...</p>;

  return (
    <div className="space-y-4">
      <GlassCard glow="cyan">
        <SectionTitle
          title="当前生效状态"
          subtitle="摘要、话术、纪要等 AI 能力将使用以下配置"
        />
        <div className="grid gap-2 text-sm text-white/75 md:grid-cols-2">
          <p>模型：{effective?.model ?? "—"}</p>
          <p>接口：{effective?.baseUrl ?? "—"}</p>
          <p>AI 开关：{effective?.enabled ? "已启用" : "已关闭"}</p>
          <p>
            API Key：{effective?.hasApiKey ? "已配置" : "未配置"}
            {effective?.source ? `（来源：${effective.source}）` : ""}
          </p>
        </div>
        {!effective?.hasApiKey ? (
          <p className="mt-3 text-sm text-amber-300">
            未配置 API Key 时将自动使用模板降级，不会调用大模型。
          </p>
        ) : null}
      </GlassCard>

      <GlassCard>
        <SectionTitle
          title="模型选择"
          subtitle={canEdit ? "管理员可修改全局 AI 配置" : "仅管理员可修改，当前为只读"}
        />

        {!canEdit ? (
          <p className="mb-4 text-sm text-white/60">
            如需更换模型，请使用管理员账号 <code>admin</code> 登录后配置。
          </p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="text-white/60">预设模型</span>
            <select
              value={presetId}
              disabled={!canEdit}
              onChange={(e) => applyPreset(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none disabled:opacity-60"
            >
              {AI_MODEL_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-white/60">模型名称</span>
            <input
              value={form.model}
              disabled={!canEdit || presetId !== "custom"}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none disabled:opacity-60"
            />
          </label>

          <label className="block text-sm">
            <span className="text-white/60">Temperature</span>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              disabled={!canEdit}
              value={form.temperature}
              onChange={(e) =>
                setForm({ ...form, temperature: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none disabled:opacity-60"
            />
          </label>

          <label className="block text-sm md:col-span-2">
            <span className="text-white/60">API Base URL</span>
            <input
              value={form.baseUrl}
              disabled={!canEdit || (presetId !== "custom" && !!selectedPreset?.baseUrl)}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none disabled:opacity-60"
            />
          </label>

          <label className="block text-sm md:col-span-2">
            <span className="text-white/60">API Key</span>
            <input
              type="password"
              value={form.apiKey}
              disabled={!canEdit}
              placeholder={canEdit ? "留空则保留原 Key" : ""}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none disabled:opacity-60"
            />
          </label>

          <div className="space-y-2 text-sm md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              />
              启用 AI 大模型能力
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={form.useTemplateFallback}
                onChange={(e) =>
                  setForm({ ...form, useTemplateFallback: e.target.checked })
                }
              />
              调用失败时使用模板降级（推荐开启）
            </label>
          </div>
        </div>

        {canEdit ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <GlassButton onClick={save}>保存配置</GlassButton>
            <GlassButton variant="ghost" onClick={testConnection} disabled={testing}>
              {testing ? "测试中..." : "测试连接"}
            </GlassButton>
          </div>
        ) : null}

        {message ? <p className="mt-3 text-sm text-accent-cyan">{message}</p> : null}
      </GlassCard>
    </div>
  );
}
