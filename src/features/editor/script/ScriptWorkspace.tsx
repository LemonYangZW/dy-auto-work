import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button, ScrollArea, Textarea, Skeleton } from "@/components/ui";
import { Wand2, Bold, Italic, List, AlignLeft, Sparkles, Heading1, Heading2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProject, useLatestScript, useCreateScriptVersion } from "@/hooks/useProjectQueries";

/**
 * 剧本工作区 - Zen-iOS Hybrid 风格
 *
 * 数据流:
 * - 从 script_versions 表读取最新版本
 * - 自动保存至新版本（防抖 2s）
 * - 标题通过 project.name 获取
 */
export function ScriptWorkspace() {
  const { projectId } = useParams();
  const { data: project } = useProject(projectId ?? "");
  const { data: latestScript, isLoading } = useLatestScript(projectId ?? "");
  const createVersion = useCreateScriptVersion();

  const [content, setContent] = useState("");
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);

  // 从数据库加载最新内容
  useEffect(() => {
    if (latestScript?.content && !isInitialized.current) {
      setContent(latestScript.content);
      isInitialized.current = true;
    } else if (!isLoading && !latestScript && !isInitialized.current) {
      setContent("");
      isInitialized.current = true;
    }
  }, [latestScript, isLoading]);

  // 自动保存（防抖 2s）
  const scheduleSave = useCallback(
    (newContent: string) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      setHasUnsaved(true);
      autoSaveTimer.current = setTimeout(async () => {
        if (!projectId) return;
        try {
          await createVersion.mutateAsync({
            project_id: projectId,
            content: newContent,
            source: "manual",
          });
          setHasUnsaved(false);
        } catch {
          toast.error("自动保存失败");
        }
      }, 2000);
    },
    [projectId, createVersion],
  );

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    scheduleSave(newContent);
  };

  // 字数统计
  const charCount = content.replace(/\s/g, "").length;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-12 border-b border-black/5 shrink-0" />
        <div className="max-w-3xl mx-auto p-10 w-full space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full rounded-[20px]" />
          <Skeleton className="h-32 w-full rounded-[20px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 - 毛玻璃风格 */}
      <div className="h-12 border-b border-black/5 flex items-center px-6 gap-1 shrink-0">
        <ToolbarButton icon={<Bold />} />
        <ToolbarButton icon={<Italic />} />
        <div className="w-px h-5 bg-black/10 mx-2" />
        <ToolbarButton icon={<Heading1 />} />
        <ToolbarButton icon={<Heading2 />} />
        <div className="w-px h-5 bg-black/10 mx-2" />
        <ToolbarButton icon={<List />} />
        <ToolbarButton icon={<AlignLeft />} />
        <div className="w-px h-5 bg-black/10 mx-2" />

        <Button variant="default" size="sm" className="gap-2 ml-auto">
          <Wand2 className="w-4 h-4" strokeWidth={2} />
          AI 扩写
        </Button>
        <Button variant="secondary" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4" strokeWidth={2} />
          生成分镜
        </Button>
      </div>

      {/* 编辑区 */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-10">
          {/* 标题 (只读，来自项目名称) */}
          <h1 className="w-full text-3xl font-bold mb-8 tracking-tight text-[var(--foreground)]">
            {project?.name ?? "未命名项目"}
          </h1>

          {/* 剧本内容编辑区 */}
          <div className="p-6 rounded-[20px] bg-white/50 hover:bg-white/70 border border-transparent hover:border-white/60 hover:shadow-sm transition-all">
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="在这里编写你的视频剧本...&#10;&#10;可以按场景分段描述镜头内容、台词、画面要求等。"
              className="min-h-[400px] text-base text-[var(--foreground)] leading-relaxed resize-none bg-transparent border-none focus-visible:ring-0"
            />
          </div>
        </div>
      </ScrollArea>

      {/* 底部状态栏 */}
      <div className="h-10 border-t border-black/5 flex items-center justify-between px-6 text-xs text-[var(--muted-foreground)] shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            {createVersion.isPending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                保存中...
              </>
            ) : hasUnsaved ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />
                未保存
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                已自动保存
              </>
            )}
          </span>
          {latestScript && (
            <span>版本 {latestScript.version_no}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>约 {charCount} 字</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 工具栏按钮
 */
function ToolbarButton({ icon }: { icon: React.ReactNode }) {
  return (
    <Button variant="ghost" size="icon-sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
      <span className="[&>svg]:w-4 [&>svg]:h-4 [&>svg]:stroke-[2]">{icon}</span>
    </Button>
  );
}
