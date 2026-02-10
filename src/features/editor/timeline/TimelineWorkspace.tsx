import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button, ScrollArea, Card } from "@/components/ui";
import {
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  ZoomIn,
  ZoomOut,
  Scissors,
  Type,
  Music,
  Image,
  Film,
} from "lucide-react";
import { useScenes } from "@/hooks/useProjectQueries";

/**
 * 时间轴/视频工作区 - Zen-iOS Hybrid 风格
 *
 * 数据流:
 * - 从 storyboard_scenes 表读取场景列表
 * - 视频轨道根据场景动态渲染
 * - 时间刻度根据总时长自动生成
 */
export function TimelineWorkspace() {
  const { projectId } = useParams();
  const { data: scenes = [] } = useScenes(projectId ?? "");

  const totalDurationMs = useMemo(
    () => scenes.reduce((acc, s) => acc + s.duration_ms, 0),
    [scenes],
  );
  const totalSeconds = Math.ceil(totalDurationMs / 1000);

  // 生成时间刻度数组
  const ticks = useMemo(
    () => Array.from({ length: Math.max(totalSeconds + 1, 2) }, (_, i) => i),
    [totalSeconds],
  );

  const formatTime = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* 预览区域 */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-black/5 to-black/10 relative p-8">
        {/* 视频预览 - 毛玻璃容器 */}
        <div className="aspect-[9/16] h-[85%] bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-[var(--shadow-float)] flex items-center justify-center overflow-hidden">
          <div className="text-center text-[var(--muted-foreground)]">
            <div className="w-20 h-20 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Play className="w-10 h-10 ml-1" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-medium text-[var(--foreground)]">视频预览</p>
            <p className="text-sm mt-2">
              {scenes.length > 0
                ? `${scenes.length} 个场景 · ${formatTime(totalDurationMs)}`
                : "暂无分镜数据"}
            </p>
          </div>
        </div>

        {/* 预览控制条 - 毛玻璃浮动 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass rounded-full px-2 py-2 flex items-center gap-1">
          <Button variant="ghost" size="icon-sm">
            <SkipBack className="w-4 h-4" strokeWidth={2} />
          </Button>
          <Button size="icon" className="rounded-full">
            <Play className="w-5 h-5 ml-0.5" strokeWidth={2} />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <SkipForward className="w-4 h-4" strokeWidth={2} />
          </Button>

          <div className="w-px h-6 bg-black/10 mx-2" />

          <div className="px-3 py-1 rounded-full bg-black/5">
            <span className="text-sm font-mono font-medium">00:00</span>
            <span className="text-sm font-mono text-[var(--muted-foreground)]"> / {formatTime(totalDurationMs)}</span>
          </div>

          <div className="w-px h-6 bg-black/10 mx-2" />

          <Button variant="ghost" size="icon-sm">
            <Volume2 className="w-4 h-4" strokeWidth={2} />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Maximize className="w-4 h-4" strokeWidth={2} />
          </Button>
        </div>
      </div>

      {/* 时间轴区域 */}
      <Card variant="solid" className="h-[220px] shrink-0 flex flex-col rounded-t-[28px] rounded-b-none border-b-0">
        {/* 时间轴工具栏 */}
        <div className="h-11 border-b border-black/5 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" title="剪切">
              <Scissors className="w-4 h-4" strokeWidth={2} />
            </Button>
            <Button variant="ghost" size="icon-sm" title="添加字幕">
              <Type className="w-4 h-4" strokeWidth={2} />
            </Button>
            <Button variant="ghost" size="icon-sm" title="添加音频">
              <Music className="w-4 h-4" strokeWidth={2} />
            </Button>
            <Button variant="ghost" size="icon-sm" title="添加图片">
              <Image className="w-4 h-4" strokeWidth={2} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm">
              <ZoomOut className="w-4 h-4" strokeWidth={2} />
            </Button>
            <div className="px-3 py-1 rounded-full bg-black/5 text-xs font-medium">
              100%
            </div>
            <Button variant="ghost" size="icon-sm">
              <ZoomIn className="w-4 h-4" strokeWidth={2} />
            </Button>
          </div>
        </div>

        {/* 时间刻度 */}
        <div className="h-7 border-b border-black/5 flex items-end px-24 shrink-0">
          <div className="flex-1 flex">
            {ticks.map((sec) => (
              <div key={sec} className="flex-1 border-l border-black/10 relative">
                <span className="absolute -top-4 left-1 text-[10px] font-medium text-[var(--muted-foreground)]">
                  {sec}s
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 轨道区域 */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {/* 视频轨道 - 根据真实场景渲染 */}
            <TrackRow
              icon={<Film className="w-4 h-4" strokeWidth={2} />}
              label="视频"
              color="accent"
            >
              {scenes.length > 0 ? (
                <div className="flex gap-1.5">
                  {scenes.map((scene) => (
                    <div
                      key={scene.id}
                      style={{ flex: scene.duration_ms }}
                      className="h-12 bg-[var(--accent)]/15 border border-[var(--accent)]/30 rounded-[12px] flex items-center justify-center text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/25 transition-colors cursor-pointer"
                    >
                      场景 {scene.scene_index + 1}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-12 border-2 border-dashed border-black/10 rounded-[12px] flex items-center justify-center text-xs text-[var(--muted-foreground)]">
                  暂无场景，请先在分镜中添加
                </div>
              )}
            </TrackRow>

            {/* 音频轨道 */}
            <TrackRow
              icon={<Music className="w-4 h-4" strokeWidth={2} />}
              label="音频"
              color="success"
            >
              <div className="h-12 border-2 border-dashed border-black/10 rounded-[12px] flex items-center justify-center text-xs text-[var(--muted-foreground)]">
                拖入音频文件
              </div>
            </TrackRow>

            {/* 字幕轨道 */}
            <TrackRow
              icon={<Type className="w-4 h-4" strokeWidth={2} />}
              label="字幕"
              color="muted"
            >
              <div className="h-10 border-2 border-dashed border-black/10 rounded-[10px] flex items-center justify-center text-xs text-[var(--muted-foreground)]">
                拖入字幕文件
              </div>
            </TrackRow>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

interface TrackRowProps {
  icon: React.ReactNode;
  label: string;
  color: "accent" | "success" | "muted";
  children: React.ReactNode;
}

function TrackRow({ icon, label, children }: TrackRowProps) {
  return (
    <div className="flex items-stretch">
      {/* 轨道标签 */}
      <div className="w-24 shrink-0 flex items-center gap-2 px-3 text-xs font-medium text-[var(--muted-foreground)]">
        {icon}
        {label}
      </div>
      {/* 轨道内容 */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
