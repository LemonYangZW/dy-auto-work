import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  ScrollArea,
  LabelIndustrial,
  Separator,
} from "@/components/ui";
import {
  FolderOpen,
  Image,
  Music,
  Type,
  LayoutGrid,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useScenes } from "@/hooks/useProjectQueries";
import { useEditorStore } from "@/stores/useEditorStore";
import { PropertyRow, ResourceItem } from "../../layout";

type SidebarTab = "scenes" | "assets";

/**
 * 分镜模式 - 左侧边栏
 *
 * 内容:
 * - "场景" Tab: 场景大纲列表（紧凑导航）
 * - "素材" Tab: 素材库分类（Phase 4 接入）
 */
export function StoryboardLeftSidebar() {
  const { projectId } = useParams();
  const { data: scenes = [], isLoading } = useScenes(projectId ?? "");
  const [tab, setTab] = useState<SidebarTab>("scenes");
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const selectScene = useEditorStore((s) => s.selectScene);

  return (
    <Card variant="default" className="h-full flex flex-col overflow-hidden">
      {/* 标签页切换 */}
      <div className="p-4 border-b border-black/5">
        <div className="flex gap-2">
          <Button
            variant={tab === "scenes" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 justify-start gap-2"
            onClick={() => setTab("scenes")}
          >
            <FolderOpen className="w-4 h-4" strokeWidth={2} />
            场景
          </Button>
          <Button
            variant={tab === "assets" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 justify-start gap-2"
            onClick={() => setTab("assets")}
          >
            <Image className="w-4 h-4" strokeWidth={2} />
            素材
          </Button>
        </div>
      </div>

      {/* 内容区 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {tab === "scenes" ? (
            <div>
              <LabelIndustrial className="px-2 mb-3 block">
                场景大纲
                {scenes.length > 0 && (
                  <span className="ml-2 text-[var(--muted-foreground)] font-normal">
                    {scenes.length}
                  </span>
                )}
              </LabelIndustrial>

              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-[14px] bg-black/5 animate-pulse" />
                  ))}
                </div>
              ) : scenes.length === 0 ? (
                <div className="py-8 text-center text-[var(--muted-foreground)]">
                  <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                  <p className="text-xs">暂无分镜</p>
                  <p className="text-xs mt-1">点击"添加分镜"开始创作</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {scenes.map((scene) => {
                    const isSelected = selectedSceneId === scene.id;
                    return (
                      <div
                        key={scene.id}
                        className={`p-3 rounded-[14px] cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-white shadow-sm border border-white/60"
                            : "hover:bg-black/5"
                        }`}
                        onClick={() => selectScene(isSelected ? null : scene.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            场景 {scene.scene_index + 1}
                          </span>
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            {(scene.duration_ms / 1000).toFixed(1)}s
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-1">
                          {scene.scene_text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <LabelIndustrial className="px-2 mb-3 block">素材库</LabelIndustrial>
              <div className="space-y-1">
                <ResourceItem
                  icon={<Image className="w-4 h-4 text-[var(--accent)]" strokeWidth={2} />}
                  label="图片素材"
                  count={0}
                />
                <ResourceItem
                  icon={<Music className="w-4 h-4 text-[var(--success)]" strokeWidth={2} />}
                  label="音频素材"
                  count={0}
                />
                <ResourceItem
                  icon={<Type className="w-4 h-4 text-[var(--muted-foreground)]" strokeWidth={2} />}
                  label="字幕文件"
                  count={0}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] text-center mt-6">
                素材管理将在后续版本开放
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

/**
 * 分镜模式 - 右侧边栏
 *
 * 内容:
 * - 选中场景时: 展示场景属性 + AI 图像生成按钮
 * - 未选中时: 项目概览
 */
export function StoryboardRightSidebar() {
  const { projectId } = useParams();
  const { data: scenes = [] } = useScenes(projectId ?? "");
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const selectScene = useEditorStore((s) => s.selectScene);

  const selectedScene = selectedSceneId
    ? scenes.find((s) => s.id === selectedSceneId) ?? null
    : null;

  return (
    <Card variant="default" className="h-full flex flex-col overflow-hidden">
      {/* 标题 */}
      <div className="p-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[var(--accent)] to-[var(--success)] flex items-center justify-center">
            {selectedScene ? (
              <LayoutGrid className="w-4 h-4 text-white" strokeWidth={2} />
            ) : (
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold">
              {selectedScene ? `场景 ${selectedScene.scene_index + 1}` : "分镜概览"}
            </h2>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              {selectedScene ? "场景属性" : "分镜工作区"}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {selectedScene ? (
            <>
              {/* 场景描述 */}
              <div className="space-y-3">
                <LabelIndustrial>场景描述</LabelIndustrial>
                <Card variant="inset" className="p-4">
                  <p className="text-sm leading-relaxed text-[var(--foreground)]">
                    {selectedScene.scene_text}
                  </p>
                </Card>
              </div>

              <Separator className="bg-black/5" />

              {/* 场景属性 */}
              <div className="space-y-3">
                <LabelIndustrial>属性</LabelIndustrial>
                <Card variant="inset" className="p-4 space-y-3">
                  <PropertyRow
                    label="时长"
                    value={`${(selectedScene.duration_ms / 1000).toFixed(1)} 秒`}
                  />
                  <PropertyRow
                    label="序号"
                    value={`第 ${selectedScene.scene_index + 1} 场`}
                  />
                  <PropertyRow
                    label="画面提示"
                    value={selectedScene.visual_prompt ?? "未设置"}
                  />
                  <PropertyRow
                    label="镜头提示"
                    value={selectedScene.camera_hint ?? "未设置"}
                  />
                </Card>
              </div>

              <Separator className="bg-black/5" />

              {/* AI 生成（占位） */}
              <div className="space-y-3">
                <LabelIndustrial>AI 生成</LabelIndustrial>
                <Button variant="secondary" className="w-full gap-2" disabled>
                  <Wand2 className="w-4 h-4" strokeWidth={2} />
                  为此场景生成画面
                </Button>
                <p className="text-xs text-[var(--muted-foreground)] text-center">
                  AI 图像生成将在后续版本开放
                </p>
              </div>

              {/* 取消选中 */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[var(--muted-foreground)]"
                onClick={() => selectScene(null)}
              >
                取消选中
              </Button>
            </>
          ) : (
            <>
              {/* 分镜概览 */}
              <div className="space-y-3">
                <LabelIndustrial>分镜统计</LabelIndustrial>
                <Card variant="inset" className="p-4 space-y-3">
                  <PropertyRow label="分镜数" value={`${scenes.length} 个`} />
                  <PropertyRow
                    label="总时长"
                    value={`${(scenes.reduce((a, s) => a + s.duration_ms, 0) / 1000).toFixed(1)} 秒`}
                  />
                </Card>
              </div>

              <Separator className="bg-black/5" />

              <div className="py-8 text-center text-[var(--muted-foreground)]">
                <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                <p className="text-xs">点击分镜卡片查看详情</p>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
