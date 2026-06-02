import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAiConfig } from "@/lib/config/service";

export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "仅管理员可测试连接" }, { status: 403 });
  }

  const config = await getAiConfig();
  if (!config.apiKey) {
    return NextResponse.json(
      { success: false, message: "请先填写 API Key" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: "请回复：连接成功" }],
        temperature: 0,
        max_tokens: 20,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({
        success: false,
        message: `连接失败（HTTP ${res.status}）`,
        detail: errText.slice(0, 200),
      });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };

    return NextResponse.json({
      success: true,
      message: "模型连接成功",
      reply: data.choices?.[0]?.message?.content ?? "",
      model: data.model ?? config.model,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "连接异常",
      detail: error instanceof Error ? error.message : "unknown",
    });
  }
}
