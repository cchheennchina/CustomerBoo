import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { AiModelSettingsPanel } from "@/components/settings/AiModelSettingsPanel";
import { GlassCard } from "@/components/glass/GlassCard";

export const dynamic = "force-dynamic";

export default function AiSettingsPage() {
  return (
    <>
      <TopBar title="AI 大模型设置" />
      <div className="mb-4">
        <Link href="/settings" className="text-sm text-white/50 hover:text-white">
          ← 返回设置
        </Link>
      </div>
      <AiModelSettingsPanel />
      <GlassCard className="mt-4 text-sm text-white/60">
        <p className="font-medium text-white/80">说明</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>此处配置对全系统生效（摘要、话术、会议纪要等）。</li>
          <li>支持 OpenAI 兼容接口，可选 DeepSeek、通义千问等。</li>
          <li>仍可在 `.env` 中配置 `OPENAI_API_KEY` 作为兜底；页面配置优先。</li>
          <li>仅管理员账号可修改；市场账号可查看当前生效模型。</li>
        </ul>
      </GlassCard>
    </>
  );
}
