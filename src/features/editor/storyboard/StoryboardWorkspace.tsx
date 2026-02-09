import { Button, Card, CardContent, Badge, ScrollArea } from "@/components/ui";
import { Plus, Image, RefreshCw, GripVertical, Wand2, LayoutGrid } from "lucide-react";

// Mock 分镜数据
const mockScenes = [
  {
    id: "scene-1",
    index: 1,
    text: "镜头从店面外观缓缓推进，展示热气腾腾的招牌。",
    imageUrl: null,
    duration: 3000,
    status: "completed",
  },
  {
    id: "scene-2",
    index: 2,
    text: "展示店内装修风格，突出特色元素。",
    imageUrl: null,
    duration: 4000,
    status: "generating",
  },
  {
    id: "scene-3",
    index: 3,
    text: "特写镜头展示招牌菜品，强调食材新鲜。",
    imageUrl: null,
    duration: 3500,
    status: "pending",
  },
  {
    id: "scene-4",
    index: 4,
    text: "加入沸腾的锅底画面，增强食欲感。",
    imageUrl: null,
    duration: 3000,
    status: "pending",
  },
];

const statusConfig = {
  pending: { label: "待生成", variant: "outline" as const },
  generating: { label: "生成中", variant: "warning" as const },
  completed: { label: "已完成", variant: "success" as const },
};

/**
 * 分镜工作区 - Zen-iOS Hybrid 风格
 *
 * 设计规范:
 * - 毛玻璃卡片网格
 * - 触觉反馈交互
 * - 大圆角和呼吸感间距
 */
export function StoryboardWorkspace() {
  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="h-12 border-b border-black/5 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-2">
            <Plus className="w-4 h-4" strokeWidth={2} />
            添加分镜
          </Button>
          <Button variant="default" size="sm" className="gap-2">
            <Wand2 className="w-4 h-4" strokeWidth={2} />
            批量生成
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <span className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" strokeWidth={2} />
            {mockScenes.length} 个分镜
          </span>
          <span>·</span>
          <span>
            总时长 {(mockScenes.reduce((acc, s) => acc + s.duration, 0) / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      {/* 分镜网格 */}
      <ScrollArea className="flex-1">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockScenes.map((scene) => (
              <SceneCard key={scene.id} scene={scene} />
            ))}

            {/* 添加新分镜卡片 */}
            <Card
              variant="ghost"
              className="cursor-pointer group hover:border-[var(--accent)] hover:border-solid transition-all"
            >
              <CardContent className="aspect-[9/16] flex flex-col items-center justify-center text-[var(--muted-foreground)] group-hover:text-[var(--accent)] p-6">
                <div className="w-14 h-14 rounded-full bg-black/5 group-hover:bg-[var(--accent)]/10 flex items-center justify-center mb-4 transition-colors">
                  <Plus className="w-7 h-7" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium">添加分镜</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

interface SceneCardProps {
  scene: (typeof mockScenes)[0];
}

function SceneCard({ scene }: SceneCardProps) {
  const status = statusConfig[scene.status as keyof typeof statusConfig];

  return (
    <Card variant="interactive" className="group overflow-hidden">
      {/* 图片区域 */}
      <div className="relative aspect-[9/16] bg-gradient-to-br from-black/5 to-black/10 overflow-hidden">
        {scene.imageUrl ? (
          <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {scene.status === "generating" ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--warning)]/10 flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-6 h-6 text-[var(--warning)] animate-spin" strokeWidth={2} />
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">AI 生成中...</span>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center">
                <Image className="w-8 h-8 text-[var(--muted-foreground)]/40" strokeWidth={1.5} />
              </div>
            )}
          </div>
        )}

        {/* 悬浮操作 */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
          <Button size="sm" variant="secondary" className="shadow-lg">
            <RefreshCw className="w-4 h-4 mr-2" strokeWidth={2} />
            重新生成
          </Button>
        </div>

        {/* 拖拽手柄 */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-[10px] bg-white/90 shadow-sm flex items-center justify-center cursor-grab">
            <GripVertical className="w-4 h-4 text-[var(--muted-foreground)]" strokeWidth={2} />
          </div>
        </div>

        {/* 序号 */}
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-sm font-bold text-[var(--foreground)]">
            {scene.index}
          </div>
        </div>
      </div>

      {/* 信息区域 */}
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <Badge variant={status.variant}>{status.label}</Badge>
          <span className="text-xs text-[var(--muted-foreground)] font-medium">
            {(scene.duration / 1000).toFixed(1)}s
          </span>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
          {scene.text}
        </p>
      </CardContent>
    </Card>
  );
}
