import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useProviderModels } from "@/hooks/useModelsDevData";
import { useModelStore } from "@/stores/useModelStore";
import { formatContextLength, formatCost } from "@/services/models-dev";
import type { PanelCategory } from "@/services/models-dev";
import { Loader2 } from "lucide-react";

interface ModelSelectProps {
  /** Provider ID (e.g. "openai") */
  providerId: string;
  /** 面板类型 */
  category: PanelCategory;
  /** 受控值 */
  value?: string;
  /** 值变更回调 */
  onValueChange?: (value: string) => void;
  /** 默认值 (非受控模式) */
  defaultValue?: string;
  /** 占位文本 */
  placeholder?: string;
  /** 自定义 className */
  className?: string;
  /** 是否在模型名后显示上下文长度和价格 */
  showDetails?: boolean;
}

/**
 * 动态模型选择器
 *
 * 从 models.dev API 获取模型列表，并通过 ModelStore 过滤
 * 仅展示用户在「模型库」中已启用的模型
 *
 * 设计原则:
 * - KISS: 仅做一件事 — 选模型
 * - DRY: 所有面板复用同一个组件
 * - 联动: 从 useModelStore 读取已启用模型白名单
 */
export function ModelSelect({
  providerId,
  category,
  value,
  onValueChange,
  defaultValue,
  placeholder = "选择模型...",
  className = "w-full",
  showDetails = true,
}: ModelSelectProps) {
  const { models, isLoading, error } = useProviderModels(providerId, category);
  const enabledIds = useModelStore((s) => s.enabledModels[providerId] ?? []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-9 px-3 text-sm text-[var(--muted-foreground)]">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>加载模型列表...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center h-9 px-3 text-sm text-red-500">
        获取模型失败: {error}
      </div>
    );
  }

  // 仅展示用户在模型库中已启用的模型
  const displayModels = models.filter((m) => enabledIds.includes(m.id));

  if (displayModels.length === 0) {
    return (
      <div className="flex items-center h-9 px-3 text-sm text-[var(--muted-foreground)]">
        请先在「模型库」中启用模型
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {displayModels.map((model) => {
          const details: string[] = [];
          if (showDetails) {
            if (model.limit?.context) {
              details.push(formatContextLength(model.limit.context));
            }
            if (model.cost?.input != null) {
              details.push(formatCost(model.cost.input) + "/M in");
            }
          }
          const suffix = details.length > 0 ? ` (${details.join(", ")})` : "";

          return (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
              {suffix && (
                <span className="text-[var(--muted-foreground)] ml-1">
                  {suffix}
                </span>
              )}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
