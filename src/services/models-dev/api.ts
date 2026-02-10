import type {
  ModelsDevApiResponse,
  ModelsDevProvider,
  ModelsDevModel,
  FilteredProvider,
  PanelCategory,
} from "./types";

const API_URL = "https://models.dev/api.json";
const LOGO_BASE_URL = "https://models.dev/logos";

/** 缓存实例 */
let cachedData: ModelsDevApiResponse | null = null;
let cacheTimestamp = 0;

/** 缓存过期时间: 1 小时 */
const CACHE_TTL = 60 * 60 * 1000;

/**
 * 获取所有 Provider 数据
 *
 * 内置内存缓存，避免频繁网络请求
 */
export async function fetchAllProviders(): Promise<ModelsDevApiResponse> {
  const now = Date.now();

  if (cachedData && now - cacheTimestamp < CACHE_TTL) {
    return cachedData;
  }

  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`models.dev API 请求失败: ${response.status}`);
  }

  cachedData = (await response.json()) as ModelsDevApiResponse;
  cacheTimestamp = now;

  return cachedData;
}

/** 清除缓存 */
export function clearCache(): void {
  cachedData = null;
  cacheTimestamp = 0;
}

/**
 * 获取 Provider Logo URL
 *
 * @example getProviderLogoUrl("openai") => "https://models.dev/logos/openai.svg"
 */
export function getProviderLogoUrl(providerId: string): string {
  return `${LOGO_BASE_URL}/${providerId}.svg`;
}

/**
 * 按 modality 过滤模型
 *
 * 根据面板类型返回匹配的模型子集:
 * - llm:   input=text, output=text
 * - image: output=image
 * - video: output=video
 * - tts:   output=audio
 */
function filterModelsByCategory(
  models: Record<string, ModelsDevModel>,
  category: PanelCategory,
): ModelsDevModel[] {
  return Object.values(models).filter((model) => {
    const input = model.modalities?.input ?? [];
    const output = model.modalities?.output ?? [];

    switch (category) {
      case "llm":
        return input.includes("text") && output.includes("text");
      case "image":
        return output.includes("image");
      case "video":
        return output.includes("video");
      case "tts":
        return output.includes("audio");
      default:
        return false;
    }
  });
}

/**
 * 获取某个面板类型对应的 Provider 列表
 *
 * 返回值仅包含 **至少有一个匹配模型** 的 Provider
 *
 * @param category 面板类型
 * @param priorityProviderIds 优先显示的 provider id 列表 (排在前面)
 */
export async function getProvidersByCategory(
  category: PanelCategory,
  priorityProviderIds?: string[],
): Promise<FilteredProvider[]> {
  const data = await fetchAllProviders();

  const results: FilteredProvider[] = [];

  for (const [, provider] of Object.entries(data)) {
    const filtered = filterModelsByCategory(provider.models, category);
    if (filtered.length > 0) {
      results.push({
        provider,
        filteredModels: filtered,
      });
    }
  }

  // 按优先级排序
  if (priorityProviderIds?.length) {
    results.sort((a, b) => {
      const aIdx = priorityProviderIds.indexOf(a.provider.id);
      const bIdx = priorityProviderIds.indexOf(b.provider.id);

      // 优先级列表中的排在前面
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;

      // 其余按模型数量降序
      return b.filteredModels.length - a.filteredModels.length;
    });
  }

  return results;
}

/**
 * 获取单个 Provider 的指定类型模型列表
 *
 * 常用于已知 provider 获取其模型下拉列表
 */
export async function getModelsForProvider(
  providerId: string,
  category: PanelCategory,
): Promise<ModelsDevModel[]> {
  const data = await fetchAllProviders();
  const provider = data[providerId];

  if (!provider) return [];

  return filterModelsByCategory(provider.models, category);
}

/**
 * 获取特定 Provider 信息
 */
export async function getProvider(
  providerId: string,
): Promise<ModelsDevProvider | null> {
  const data = await fetchAllProviders();
  return data[providerId] ?? null;
}

/**
 * 主要的 LLM Provider ID 列表 (优先显示)
 *
 * 这些是应用中最常用的 LLM 服务提供商
 */
export const LLM_PRIORITY_PROVIDERS = [
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "mistral",
  "xai",
  "groq",
];

/**
 * 主要的图像生成 Provider ID 列表
 */
export const IMAGE_PRIORITY_PROVIDERS = [
  "openai",
  "google",
];

/**
 * 格式化费用显示
 *
 * @example formatCost(0.5) => "$0.50"
 * @example formatCost(15) => "$15.00"
 */
export function formatCost(costPerMillion: number): string {
  return `$${costPerMillion.toFixed(2)}`;
}

/**
 * 格式化上下文长度
 *
 * @example formatContextLength(128000) => "128K"
 * @example formatContextLength(1047576) => "1M"
 */
export function formatContextLength(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(tokens % 1_000 === 0 ? 0 : 1)}K`;
  }
  return `${tokens}`;
}
