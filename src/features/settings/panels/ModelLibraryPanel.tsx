import { useState, useMemo, memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Input,
  Card,
  Badge,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  LabelIndustrial,
  Button,
  Separator,
} from "@/components/ui";
import { Search, Server, Loader2, RotateCcw } from "lucide-react";
import { useAllProviders } from "@/hooks/useModelsDevData";
import { useModelStore } from "@/stores/useModelStore";
import { formatContextLength, formatCost } from "@/services/models-dev";
import type { ModelsDevModel, ModelsDevProvider } from "@/services/models-dev";
import { SettingSection } from "../components/SettingSection";

/** 模型分类 tab 值 */
type CategoryTab = "all" | "llm" | "image" | "video" | "audio";

/**
 * 按优先级排列的 Provider ID 列表
 *
 * 排在前面的 Provider 优先展示
 */
const PROVIDER_PRIORITY = [
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "mistral",
  "xai",
  "groq",
];

/**
 * 判断模型属于哪些分类
 */
function matchesCategory(
  model: ModelsDevModel,
  category: CategoryTab,
): boolean {
  if (category === "all") return true;

  const input = model.modalities?.input ?? [];
  const output = model.modalities?.output ?? [];

  switch (category) {
    case "llm":
      return input.includes("text") && output.includes("text");
    case "image":
      return output.includes("image");
    case "video":
      return output.includes("video");
    case "audio":
      return output.includes("audio");
    default:
      return false;
  }
}

/**
 * 模型仓库面板
 *
 * 集中式管理所有 AI 模型的启用/禁用
 * 用户在此勾选的模型将显示在各 AI 服务配置面板的下拉框中
 *
 * 性能优化:
 * - ModelCard 使用 Zustand selector 精细订阅单个模型状态
 * - ProviderGroup 仅订阅当前 provider 的 enabledModels
 * - 子组件 memo 化，避免无关 re-render
 * - CSS transition 精确到具体属性
 */
export function ModelLibraryPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<CategoryTab>("all");
  const { providers, isLoading, error, refetch } = useAllProviders();

  /** 过滤并排序 Provider 列表 */
  const filteredProviders = useMemo(() => {
    if (!providers) return [];

    const entries = Object.entries(providers)
      .map(([, provider]) => {
        // 过滤模型: 按搜索词 + 分类
        const models = Object.values(provider.models).filter((m) => {
          const matchSearch =
            searchTerm === "" ||
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.id.toLowerCase().includes(searchTerm.toLowerCase());

          const matchCategory = matchesCategory(m, category);

          return matchSearch && matchCategory;
        });

        return { provider, models };
      })
      .filter((entry) => entry.models.length > 0);

    // 按优先级排序
    entries.sort((a, b) => {
      const aIdx = PROVIDER_PRIORITY.indexOf(a.provider.id);
      const bIdx = PROVIDER_PRIORITY.indexOf(b.provider.id);

      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;

      return b.models.length - a.models.length;
    });

    return entries;
  }, [providers, searchTerm, category]);

  /** 稳定的重置回调 */
  const handleReset = useCallback(() => {
    useModelStore.getState().resetToDefaults();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
        <p className="text-sm text-[var(--muted-foreground)]">
          正在加载模型数据...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-red-500">加载失败: {error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          重试
        </Button>
      </div>
    );
  }

  return (
    <>
      <SettingSection
        title="模型库"
        description="管理所有可用的 AI 模型，勾选的模型将显示在各功能的配置下拉框中"
      >
        {/* 工具栏: 搜索 + 重置 + 分类标签 */}
        <div className="space-y-4">
          {/* 搜索框 + 重置按钮 */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="搜索模型名称或 ID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              重置默认
            </Button>
          </div>

          {/* 分类标签 */}
          <Tabs
            value={category}
            onValueChange={(v) => setCategory(v as CategoryTab)}
          >
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="llm">LLM</TabsTrigger>
              <TabsTrigger value="image">图像</TabsTrigger>
              <TabsTrigger value="video">视频</TabsTrigger>
              <TabsTrigger value="audio">语音</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </SettingSection>

      <Separator />

      {/* Provider 分组列表 */}
      <div className="space-y-8">
        {filteredProviders.map(({ provider, models }) => (
          <ProviderGroup
            key={provider.id}
            provider={provider}
            models={models}
          />
        ))}

        {filteredProviders.length === 0 && (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            {searchTerm ? `未找到包含「${searchTerm}」的模型` : "暂无匹配的模型"}
          </div>
        )}
      </div>
    </>
  );
}

// ─── 子组件 ─────────────────────────────────────────────

interface ProviderGroupProps {
  provider: ModelsDevProvider;
  models: ModelsDevModel[];
}

/**
 * Provider 分组 (memo 优化)
 *
 * 使用 Zustand selector 仅订阅当前 provider 的 enabledModels
 * 避免其他 provider 的模型切换导致本组件 re-render
 */
const ProviderGroup = memo(function ProviderGroup({
  provider,
  models,
}: ProviderGroupProps) {
  // 精细订阅: 仅监听当前 provider 的已启用列表 (useShallow 浅比较避免无限循环)
  const enabledList = useModelStore(
    useShallow((s) => s.enabledModels[provider.id] ?? []),
  );

  const enabledCount = enabledList.filter((id) =>
    models.some((m) => m.id === id),
  ).length;

  return (
    <div className="space-y-3">
      {/* Provider 标题行 */}
      <div className="flex items-center gap-2">
        <Server className="w-4 h-4 text-[var(--muted-foreground)]" />
        <LabelIndustrial className="text-base">{provider.name}</LabelIndustrial>
        <Badge variant="secondary" className="text-xs font-normal">
          {enabledCount}/{models.length}
        </Badge>
      </div>

      {/* 模型卡片网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            providerId={provider.id}
          />
        ))}
      </div>
    </div>
  );
});

interface ModelCardProps {
  model: ModelsDevModel;
  providerId: string;
}

/**
 * 模型卡片 (memo + selector 优化)
 *
 * 性能关键优化:
 * - useModelStore selector 仅订阅 **单个模型** 的启用状态
 *   切换其他模型时本卡片不会 re-render
 * - toggleModel 通过 store 级稳定引用获取，不触发重渲染
 * - CSS transition 精确到 border-color / opacity / box-shadow
 */
const ModelCard = memo(function ModelCard({
  model,
  providerId,
}: ModelCardProps) {
  // 精细订阅: 仅监听当前模型的启用状态 (boolean)
  const active = useModelStore((s) =>
    (s.enabledModels[providerId] ?? []).includes(model.id),
  );

  // 稳定引用: 直接从 store 获取 toggleModel，不会因状态变化而改变
  const handleToggle = useCallback(() => {
    useModelStore.getState().toggleModel(providerId, model.id);
  }, [providerId, model.id]);

  return (
    <Card
      variant="solid"
      className={`p-4 transition-[border-color,opacity,box-shadow] duration-200 ${
        active
          ? "border-[var(--primary)] shadow-sm"
          : "opacity-75 hover:opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          {/* 模型名称 */}
          <div className="font-medium text-sm truncate" title={model.name}>
            {model.name}
          </div>

          {/* 模型 ID */}
          <div
            className="text-xs text-[var(--muted-foreground)] font-mono truncate"
            title={model.id}
          >
            {model.id}
          </div>

          {/* 指标标签 */}
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {model.limit?.context && (
              <Badge
                variant="secondary"
                className="text-[10px] font-normal px-1.5 py-0"
              >
                {formatContextLength(model.limit.context)}
              </Badge>
            )}
            {model.cost?.input != null && (
              <Badge
                variant="secondary"
                className="text-[10px] font-normal px-1.5 py-0"
              >
                {formatCost(model.cost.input)}/M
              </Badge>
            )}
            {model.reasoning && (
              <Badge
                variant="secondary"
                className="text-[10px] font-normal px-1.5 py-0"
              >
                推理
              </Badge>
            )}
            {model.tool_call && (
              <Badge
                variant="secondary"
                className="text-[10px] font-normal px-1.5 py-0"
              >
                工具
              </Badge>
            )}
          </div>
        </div>

        {/* 启用开关 */}
        <Switch
          checked={active}
          onCheckedChange={handleToggle}
          aria-label={`${active ? "禁用" : "启用"} ${model.name}`}
        />
      </div>
    </Card>
  );
});
