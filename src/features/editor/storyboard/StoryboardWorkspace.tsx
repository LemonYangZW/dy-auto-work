import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Badge,
  ScrollArea,
  Skeleton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { Plus, Image, RefreshCw, GripVertical, Wand2, LayoutGrid, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useScenes, useCreateScene, useDeleteScene } from "@/hooks/useProjectQueries";
import type { StoryboardScene } from "@/types/project";

/**
 * 分镜工作区 - Zen-iOS Hybrid 风格
 *
 * 数据流:
 * - 从 storyboard_scenes 表读取分镜列表
 * - 支持新增/删除分镜
 */
export function StoryboardWorkspace() {
  const { projectId } = useParams();
  const { data: scenes = [], isLoading } = useScenes(projectId ?? "");
  const createScene = useCreateScene();
  const deleteScene = useDeleteScene();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAddScene = async () => {
    if (!projectId) return;
    try {
      await createScene.mutateAsync({
        project_id: projectId,
        scene_text: "新建分镜场景",
        duration_ms: 3000,
      });
      toast.success("分镜已添加");
    } catch {
      toast.error("添加分镜失败");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !projectId) return;
    try {
      await deleteScene.mutateAsync({ sceneId: deleteTarget, projectId });
      setDeleteTarget(null);
      toast.success("分镜已删除");
    } catch {
      toast.error("删除分镜失败");
    }
  };

  const totalDuration = scenes.reduce((acc, s) => acc + s.duration_ms, 0);

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="h-12 border-b border-black/5 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={handleAddScene}
            disabled={createScene.isPending}
          >
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
            {scenes.length} 个分镜
          </span>
          <span>·</span>
          <span>
            总时长 {(totalDuration / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      {/* 分镜网格 */}
      <ScrollArea className="flex-1">
        <div className="p-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-[9/16] w-full rounded-[28px]" />
              ))}
            </div>
          ) : scenes.length === 0 ? (
            <Card variant="inset" className="py-16">
              <div className="text-center text-[var(--muted-foreground)]">
                <LayoutGrid className="w-16 h-16 mx-auto mb-6 opacity-30" strokeWidth={1.5} />
                <p className="text-lg font-medium">还没有分镜</p>
                <p className="text-sm mt-2">点击"添加分镜"或"批量生成"开始创作</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {scenes.map((scene) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  onDelete={(id) => setDeleteTarget(id)}
                />
              ))}

              {/* 添加新分镜卡片 */}
              <Card
                variant="ghost"
                className="cursor-pointer group hover:border-[var(--accent)] hover:border-solid transition-all"
                onClick={handleAddScene}
              >
                <CardContent className="aspect-[9/16] flex flex-col items-center justify-center text-[var(--muted-foreground)] group-hover:text-[var(--accent)] p-6">
                  <div className="w-14 h-14 rounded-full bg-black/5 group-hover:bg-[var(--accent)]/10 flex items-center justify-center mb-4 transition-colors">
                    <Plus className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium">添加分镜</span>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 删除确认弹窗 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除分镜？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，分镜及其关联素材将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SceneCard({
  scene,
  onDelete,
}: {
  scene: StoryboardScene;
  onDelete: (id: string) => void;
}) {
  return (
    <Card variant="interactive" className="group overflow-hidden">
      {/* 图片区域 */}
      <div className="relative aspect-[9/16] bg-gradient-to-br from-black/5 to-black/10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center">
            <Image className="w-8 h-8 text-[var(--muted-foreground)]/40" strokeWidth={1.5} />
          </div>
        </div>

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
            {scene.scene_index + 1}
          </div>
        </div>

        {/* 删除按钮 */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-sm"
            className="bg-white/90 shadow-sm hover:bg-red-50 hover:text-[var(--destructive)]"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(scene.id);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 信息区域 */}
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <Badge variant="outline">
            {scene.visual_prompt ? "已生成" : "待生成"}
          </Badge>
          <span className="text-xs text-[var(--muted-foreground)] font-medium">
            {(scene.duration_ms / 1000).toFixed(1)}s
          </span>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
          {scene.scene_text}
        </p>
      </CardContent>
    </Card>
  );
}
