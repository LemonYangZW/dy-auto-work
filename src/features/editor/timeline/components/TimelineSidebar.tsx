import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  ScrollArea,
  LabelIndustrial,
  Separator,
} from "@/components/ui";
import {
  Image,
  Music,
  Type,
  Film,
  ChevronRight,
  Download,
} from "lucide-react";
import { useScenes } from "@/hooks/useProjectQueries";
import { useProject, useLatestScript } from "@/hooks/useProjectQueries";
import { PropertyRow, ResourceItem } from "../../layout";

/**
 * 视频模式 - 左侧边栏
 *
 * 内容:
 * - 素材库（图片/音频/字幕文件列表）
 * - Phase 4/5 接入真实素材管理
 */
export function TimelineLeftSidebar() {
  return (
    <Card variant="default" className="h-full flex flex-col overflow-hidden">
      {/* 标题 */}
      <div className="p-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Film className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-bold">素材库</h2>
            <p className="text-[10px] text-[var(--muted-foreground)]">项目素材管理</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* 素材分类 */}
          <div>
            <LabelIndustrial className="px-2 mb-3 block">素材分类</LabelIndustrial>
            <div className="space-y-1">
              <ResourceItem
                icon={<Image className="w-4 h-4 text-[var(--accent)]" strokeWidth={2} />}
                label="图片素材"
                count={0}
              />
              <ResourceItem
                icon={<Film className="w-4 h-4 text-[var(--warning)]" strokeWidth={2} />}
                label="视频片段"
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
          </div>

          <Separator className="bg-black/5" />

          {/* 导入素材 */}
          <div className="space-y-3">
            <Button variant="secondary" className="w-full gap-2" disabled>
              <Download className="w-4 h-4" strokeWidth={2} />
              导入素材
            </Button>
            <p className="text-xs text-[var(--muted-foreground)] text-center">
              素材管理将在后续版本开放
            </p>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}

/**
 * 视频模式 - 右侧边栏
 *
 * 内容:
 * - 导出设置（抖音预设、分辨率、帧率等）
 * - 项目概览
 */
export function TimelineRightSidebar() {
  const { projectId } = useParams();
  const { data: project } = useProject(projectId ?? "");
  const { data: scenes = [] } = useScenes(projectId ?? "");
  const { data: latestScript } = useLatestScript(projectId ?? "");

  return (
    <Card variant="default" className="h-full flex flex-col overflow-hidden">
      {/* 标题 */}
      <div className="p-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Download className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-bold">导出设置</h2>
            <p className="text-[10px] text-[var(--muted-foreground)]">视频输出配置</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* 导出预设 */}
          <div className="space-y-3">
            <LabelIndustrial>导出预设</LabelIndustrial>
            <Card variant="interactive" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">抖音竖屏</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    1080×1920 · 30fps · H.264
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" strokeWidth={2} />
              </div>
            </Card>
          </div>

          <Separator className="bg-black/5" />

          {/* 输出参数 */}
          <div className="space-y-3">
            <LabelIndustrial>输出参数</LabelIndustrial>
            <Card variant="inset" className="p-4 space-y-3">
              <PropertyRow label="分辨率" value="1080 × 1920" />
              <PropertyRow label="帧率" value="30 fps" />
              <PropertyRow label="视频编码" value="H.264" />
              <PropertyRow label="音频编码" value="AAC" />
              <PropertyRow label="视频码率" value="8 Mbps" />
              <PropertyRow label="音频码率" value="128 kbps" />
            </Card>
          </div>

          <Separator className="bg-black/5" />

          {/* 项目概览 */}
          <div className="space-y-3">
            <LabelIndustrial>项目概览</LabelIndustrial>
            <Card variant="inset" className="p-4 space-y-3">
              <PropertyRow label="项目名" value={project?.name ?? "—"} />
              <PropertyRow label="分镜数" value={`${scenes.length} 个`} />
              <PropertyRow
                label="总时长"
                value={`${(scenes.reduce((a, s) => a + s.duration_ms, 0) / 1000).toFixed(1)} 秒`}
              />
              <PropertyRow
                label="剧本版本"
                value={latestScript ? `v${latestScript.version_no}` : "暂无"}
              />
            </Card>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
