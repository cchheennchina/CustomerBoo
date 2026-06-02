import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAiConfig, getAiConfigRaw, saveAiConfig } from "@/lib/config/service";
import { maskApiKey, type AiConfig } from "@/lib/config/ai";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const stored = await getAiConfigRaw();
  const effective = await getAiConfig();

  return NextResponse.json({
    config: {
      ...stored,
      apiKey: user.role === "ADMIN" ? stored.apiKey : maskApiKey(stored.apiKey),
    },
    effective: {
      model: effective.model,
      baseUrl: effective.baseUrl,
      enabled: effective.enabled,
      hasApiKey: Boolean(effective.apiKey),
      source: stored.apiKey ? "database" : effective.apiKey ? "env" : "none",
    },
    canEdit: user.role === "ADMIN",
  });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "仅管理员可修改 AI 配置" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<AiConfig>;
  const current = await getAiConfigRaw();

  const next: AiConfig = {
    enabled: body.enabled ?? current.enabled,
    provider: body.provider ?? current.provider,
    model: body.model ?? current.model,
    baseUrl: body.baseUrl ?? current.baseUrl,
    apiKey: body.apiKey ?? current.apiKey,
    temperature: body.temperature ?? current.temperature,
    useTemplateFallback: body.useTemplateFallback ?? current.useTemplateFallback,
  };

  const saved = await saveAiConfig(next, {
    keepExistingKey: !body.apiKey,
  });

  return NextResponse.json({
    success: true,
    message: "AI 模型配置已保存",
    config: { ...saved, apiKey: maskApiKey(saved.apiKey) },
  });
}
