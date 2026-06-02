"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_DASHBOARD_CONFIG,
  type DashboardConfig,
  type DashboardWidgetConfig,
} from "@/lib/config/dashboard";
import { GlassButton, GlassCard, SectionTitle } from "@/components/glass/GlassCard";

export function AdminConfigPanel() {
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_DASHBOARD_CONFIG);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
        setLoading(false);
      });
  }, []);

  function updateWidget(index: number, patch: Partial<DashboardWidgetConfig>) {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w, i) => (i === index ? { ...w, ...patch } : w)),
    }));
  }

  async function save() {
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    });
    const data = await res.json();
    setMessage(data.success ? "配置已保存，刷新仪表盘生效" : data.error ?? "保存失败");
  }

  function resetDefault() {
    setConfig(DEFAULT_DASHBOARD_CONFIG);
  }

  if (loading) return <p className="text-white/60">加载配置中...</p>;

  return (
    <div className="space-y-4">
      <GlassCard glow="purple">
        <SectionTitle title="仪表盘全局设置" subtitle="控制页面标题与下钻行为" />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-white/60">页面标题</span>
            <input
              value={config.pageTitle}
              onChange={(e) => setConfig({ ...config, pageTitle: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
            />
          </label>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showAverageScore}
                onChange={(e) =>
                  setConfig({ ...config, showAverageScore: e.target.checked })
                }
              />
              显示平均健康分圆环
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.enableDrillDown}
                onChange={(e) =>
                  setConfig({ ...config, enableDrillDown: e.target.checked })
                }
              />
              启用健康度下钻链接
            </label>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle title="组件布局与展示" subtitle="启用/禁用、列宽、标题、列表条数" />
        <div className="space-y-3">
          {config.widgets.map((widget, index) => (
            <div
              key={widget.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{widget.id}</p>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={widget.enabled}
                    onChange={(e) =>
                      updateWidget(index, { enabled: e.target.checked })
                    }
                  />
                  启用
                </label>
              </div>
              <div className="grid gap-2 md:grid-cols-4">
                <input
                  value={widget.title}
                  onChange={(e) => updateWidget(index, { title: e.target.value })}
                  placeholder="标题"
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
                />
                <input
                  value={widget.subtitle ?? ""}
                  onChange={(e) =>
                    updateWidget(index, { subtitle: e.target.value })
                  }
                  placeholder="副标题"
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
                />
                <select
                  value={widget.colSpan}
                  onChange={(e) =>
                    updateWidget(index, { colSpan: Number(e.target.value) })
                  }
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
                >
                  {[3, 4, 5, 6, 7, 8, 9, 12].map((n) => (
                    <option key={n} value={n}>
                      列宽 {n}/12
                    </option>
                  ))}
                </select>
                {"maxItems" in widget || widget.maxItems !== undefined ? (
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={widget.maxItems ?? 3}
                    onChange={(e) =>
                      updateWidget(index, { maxItems: Number(e.target.value) })
                    }
                    placeholder="最大条数"
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
                  />
                ) : (
                  <div className="text-xs text-white/40 self-center">无列表条数配置</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-2">
        <GlassButton onClick={save}>保存配置</GlassButton>
        <GlassButton variant="ghost" onClick={resetDefault}>
          恢复默认
        </GlassButton>
      </div>
      {message ? <p className="text-accent-cyan">{message}</p> : null}
    </div>
  );
}
