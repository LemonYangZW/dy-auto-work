import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 模型仓库 Store
 *
 * 管理用户启用的 AI 模型白名单
 * 通过 zustand/persist 持久化到 localStorage
 *
 * 数据结构: { "openai": ["gpt-4o", "gpt-4o-mini"], "anthropic": [...] }
 */

interface ModelStore {
  /** 各 Provider 下用户启用的模型 ID 列表 */
  enabledModels: Record<string, string[]>;

  /** 切换单个模型的启用状态 */
  toggleModel: (providerId: string, modelId: string) => void;

  /** 批量启用模型 */
  enableModels: (providerId: string, modelIds: string[]) => void;

  /** 禁用某 Provider 下所有模型 */
  disableAll: (providerId: string) => void;

  /** 检查模型是否已启用 */
  isEnabled: (providerId: string, modelId: string) => boolean;

  /** 获取某 Provider 下已启用的模型 ID 列表 */
  getEnabledIds: (providerId: string) => string[];

  /** 重置为默认推荐模型白名单 */
  resetToDefaults: () => void;
}

/**
 * 默认推荐模型白名单
 *
 * 首次启动时预设常用模型，避免空状态
 */
const DEFAULT_ENABLED_MODELS: Record<string, string[]> = {
  openai: ["gpt-5.2", "gpt-5.2-codex", "gpt-5.3-codex"],
  anthropic: ["claude-haiku-4-5-20251001", "claude-sonnet-4-5-20250929", "claude-opus-4-6"],
  google: ["gemini-3-pro-preview", "gemini-3-flash-preview"],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
};

export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      enabledModels: DEFAULT_ENABLED_MODELS,

      toggleModel: (providerId, modelId) =>
        set((state) => {
          const current = state.enabledModels[providerId] ?? [];
          const isCurrentlyEnabled = current.includes(modelId);

          const updated = isCurrentlyEnabled
            ? current.filter((id) => id !== modelId)
            : [...current, modelId];

          return {
            enabledModels: {
              ...state.enabledModels,
              [providerId]: updated,
            },
          };
        }),

      enableModels: (providerId, modelIds) =>
        set((state) => ({
          enabledModels: {
            ...state.enabledModels,
            [providerId]: Array.from(
              new Set([
                ...(state.enabledModels[providerId] ?? []),
                ...modelIds,
              ]),
            ),
          },
        })),

      disableAll: (providerId) =>
        set((state) => ({
          enabledModels: {
            ...state.enabledModels,
            [providerId]: [],
          },
        })),

      isEnabled: (providerId, modelId) =>
        (get().enabledModels[providerId] ?? []).includes(modelId),

      getEnabledIds: (providerId) =>
        get().enabledModels[providerId] ?? [],

      resetToDefaults: () =>
        set({ enabledModels: DEFAULT_ENABLED_MODELS }),
    }),
    {
      name: "dy-model-library",
    },
  ),
);
