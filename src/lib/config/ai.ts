export interface AiConfig {
  enabled: boolean;
  provider: string;
  model: string;
  baseUrl: string;
  apiKey: string;
  temperature: number;
  useTemplateFallback: boolean;
}

export interface AiModelPreset {
  id: string;
  label: string;
  provider: string;
  model: string;
  baseUrl: string;
}

export const AI_MODEL_PRESETS: AiModelPreset[] = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini（推荐，性价比高）",
    provider: "openai",
    model: "gpt-4o-mini",
    baseUrl: "https://api.openai.com/v1",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o（能力更强）",
    provider: "openai",
    model: "gpt-4o",
    baseUrl: "https://api.openai.com/v1",
  },
  {
    id: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    provider: "openai",
    model: "gpt-3.5-turbo",
    baseUrl: "https://api.openai.com/v1",
  },
  {
    id: "deepseek-chat",
    label: "DeepSeek Chat",
    provider: "deepseek",
    model: "deepseek-chat",
    baseUrl: "https://api.deepseek.com/v1",
  },
  {
    id: "qwen-plus",
    label: "通义千问 Plus",
    provider: "qwen",
    model: "qwen-plus",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  {
    id: "custom",
    label: "自定义（手动填写模型名与地址）",
    provider: "custom",
    model: "",
    baseUrl: "https://api.openai.com/v1",
  },
];

export const DEFAULT_AI_CONFIG: AiConfig = {
  enabled: true,
  provider: "openai",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  temperature: 0.4,
  useTemplateFallback: true,
};

export function parseAiConfig(raw: string | null | undefined): AiConfig {
  if (!raw) return { ...DEFAULT_AI_CONFIG };
  try {
    const parsed = JSON.parse(raw) as Partial<AiConfig>;
    return { ...DEFAULT_AI_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_AI_CONFIG };
  }
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "********";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function resolveAiConfig(stored: AiConfig): AiConfig {
  const envKey = process.env.OPENAI_API_KEY ?? "";
  const envModel = process.env.OPENAI_MODEL ?? "";
  const envBase = process.env.OPENAI_BASE_URL ?? "";

  return {
    ...stored,
    apiKey: stored.apiKey || envKey,
    model: stored.model || envModel || DEFAULT_AI_CONFIG.model,
    baseUrl: stored.baseUrl || envBase || DEFAULT_AI_CONFIG.baseUrl,
  };
}

export function getPresetById(id: string) {
  return AI_MODEL_PRESETS.find((p) => p.id === id);
}
