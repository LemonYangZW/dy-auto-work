import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Input,
  Textarea,
  Label,
  Separator,
} from "@/components/ui";
import { Plus, Image, RefreshCw, GripVertical, Wand2, LayoutGrid, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useScenes, useCreateScene, useDeleteScene, useUpdateScene } from "@/hooks/useProjectQueries";
import { useEditorStore } from "@/stores/useEditorStore";
import { useSidebar } from "../hooks/use-sidebar";
import { StoryboardLeftSidebar, StoryboardRightSidebar } from "./components/StoryboardSidebar";
import type { StoryboardScene, UpdateSceneInput } from "@/types/project";

/**
 * 分镜工作区 - Zen-iOS Hybrid 风格
 *
 * 数据流:
 * - 从 storyboard_scenes 表读取分镜列表
 * - 支持新增/删除分镜
 * - 左右侧边栏通过 useSidebar Slot 注入
 */
export function StoryboardWorkspace() {
  const { projectId } = useParams();
  const { data: scenes = [], isLoading } = useScenes(projectId ?? "");
  const createScene = useCreateScene();
  const deleteScene = useDeleteScene();
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const selectScene = useEditorStore((s) => s.selectScene);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<StoryboardScene | null>(null);

  // Slot 模式：注入分镜模式专用侧边栏
  useSidebar(<StoryboardLeftSidebar />, <StoryboardRightSidebar />);

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
                  isSelected={selectedSceneId === scene.id}
                  onSelect={(id) => selectScene(selectedSceneId === id ? null : id)}
                  onEdit={(scene) => setEditTarget(scene)}
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

      {/* 编辑弹窗 */}
      {editTarget && projectId && (
        <SceneEditDialog
          scene={editTarget}
          projectId={projectId}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            toast.success("分镜已更新");
          }}
        />
      )}
    </div>
  );
}

function SceneCard({
  scene,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  scene: StoryboardScene;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (scene: StoryboardScene) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card
      variant="interactive"
      className={`group overflow-hidden cursor-pointer transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-[var(--accent)] shadow-lg"
          : ""
      }`}
      onClick={() => onSelect(scene.id)}
    >
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

        {/* 操作按钮组 */}
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 编辑按钮 */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="bg-white/90 shadow-sm hover:bg-blue-50 hover:text-[var(--accent)]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(scene);
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          {/* 删除按钮 */}
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

/**
 * 分镜编辑弹窗
 *
 * 支持编辑: scene_text, duration_ms, visual_prompt, camera_hint
 * 使用 useUpdateScene hook 持久化到 SQLite
 */
function SceneEditDialog({
  scene,
  projectId,
  open,
  onOpenChange,
  onSaved,
}: {
  scene: StoryboardScene;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const updateScene = useUpdateScene();

  // 本地表单状态
  const [sceneText, setSceneText] = useState(scene.scene_text);
  const [durationMs, setDurationMs] = useState(String(scene.duration_ms));
  const [visualPrompt, setVisualPrompt] = useState(scene.visual_prompt ?? "");
  const [cameraHint, setCameraHint] = useState(scene.camera_hint ?? "");

  // 当 scene 变化时重置表单
  useEffect(() => {
    setSceneText(scene.scene_text);
    setDurationMs(String(scene.duration_ms));
    setVisualPrompt(scene.visual_prompt ?? "");
    setCameraHint(scene.camera_hint ?? "");
  }, [scene]);

  const handleSave = async () => {
    const duration = parseInt(durationMs, 10);
    if (isNaN(duration) || duration <= 0) {
      toast.error("时长必须为正整数（毫秒）");
      return;
    }
    if (!sceneText.trim()) {
      toast.error("场景描述不能为空");
      return;
    }

    const input: UpdateSceneInput = {
      scene_text: sceneText.trim(),
      duration_ms: duration,
      visual_prompt: visualPrompt.trim() || null,
      camera_hint: cameraHint.trim() || null,
    };

    try {
      await updateScene.mutateAsync({
        sceneId: scene.id,
        input,
        projectId,
      });
      onSaved();
    } catch {
      toast.error("更新分镜失败");
    }
  };

  // 快捷时长按钮
  const durationPresets = [
    { label: "1s", ms: 1000 },
    { label: "2s", ms: 2000 },
    { label: "3s", ms: 3000 },
    { label: "5s", ms: 5000 },
    { label: "10s", ms: 10000 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>编辑场景 {scene.scene_index + 1}</DialogTitle>
          <DialogDescription>
            修改分镜场景的描述、时长和画面提示信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 场景描述 */}
          <div className="space-y-2">
            <Label htmlFor="scene-text">场景描述 *</Label>
            <Textarea
              id="scene-text"
              value={sceneText}
              onChange={(e) => setSceneText(e.target.value)}
              placeholder="描述这个场景的画面内容..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* 时长 */}
          <div className="space-y-2">
            <Label htmlFor="duration">时长（毫秒）</Label>
            <div className="flex gap-2">
              <Input
                id="duration"
                type="number"
                min={100}
                step={100}
                value={durationMs}
                onChange={(e) => setDurationMs(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-1">
                {durationPresets.map((preset) => (
                  <Button
                    key={preset.ms}
                    type="button"
                    variant={parseInt(durationMs, 10) === preset.ms ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setDurationMs(String(preset.ms))}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              当前 {(parseInt(durationMs, 10) / 1000 || 0).toFixed(1)} 秒
            </p>
          </div>

          <Separator className="bg-black/5" />

          {/* 画面提示词 */}
          <div className="space-y-2">
            <Label htmlFor="visual-prompt">画面提示词</Label>
            <Textarea
              id="visual-prompt"
              value={visualPrompt}
              onChange={(e) => setVisualPrompt(e.target.value)}
              placeholder="描述 AI 生成图像/视频时使用的提示词..."
              className="min-h-[80px] resize-none"
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              用于 AI 图像/视频生成的 Prompt（可选）
            </p>
          </div>

          {/* 镜头提示 */}
          <div className="space-y-2">
            <Label htmlFor="camera-hint">镜头提示</Label>
            <Input
              id="camera-hint"
              value={cameraHint}
              onChange={(e) => setCameraHint(e.target.value)}
              placeholder="例如：特写、全景、推镜头、跟随..."
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              镜头运动和构图提示（可选）
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateScene.isPending}
            className="gap-2"
          >
            {updateScene.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            保存修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
