import { useState, useEffect, useCallback } from "react";
import type {
  ModelsDevModel,
  ModelsDevApiResponse,
  PanelCategory,
} from "@/services/models-dev";
import {
  fetchAllProviders,
  getModelsForProvider,
  getProviderLogoUrl,
} from "@/services/models-dev";

interface UseModelsDevModelsState {
  /** 模型列表 */
  models: ModelsDevModel[];
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 手动刷新 */
  refetch: () => void;
}

/**
 * 获取指定 Provider 在指定面板类型下的模型列表
 *
 * @param providerId provider 唯一标识 (e.g. "openai")
 * @param category   面板类型 (e.g. "llm")
 *
 * @example
 * ```tsx
 * const { models, isLoading } = useProviderModels("openai", "llm");
 * ```
 */
export function useProviderModels(
  providerId: string | null,
  category: PanelCategory,
): UseModelsDevModelsState {
  const [models, setModels] = useState<ModelsDevModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    if (!providerId) {
      setModels([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getModelsForProvider(providerId, category);
      setModels(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "获取模型列表失败";
      setError(message);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [providerId, category]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { models, isLoading, error, refetch: fetchModels };
}

/**
 * 获取 Provider Logo URL 的便捷 hook
 */
export function useProviderLogo(providerId: string): string {
  return getProviderLogoUrl(providerId);
}

interface UseAllProvidersState {
  /** 所有 Provider 数据 (key 为 provider id) */
  providers: ModelsDevApiResponse | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 手动刷新 */
  refetch: () => void;
}

/**
 * 获取所有 Provider 数据
 *
 * 用于模型仓库面板，展示所有可用的 AI 服务商和模型
 *
 * @example
 * ```tsx
 * const { providers, isLoading } = useAllProviders();
 * ```
 */
export function useAllProviders(): UseAllProvidersState {
  const [providers, setProviders] = useState<ModelsDevApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchAllProviders();
      setProviders(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "获取模型数据失败";
      setError(message);
      setProviders(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { providers, isLoading, error, refetch: fetchData };
}
