import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  ScrollArea,
  LabelIndustrial,
  Separator,
  Textarea,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui";
import {
  FileText,
  History,
  Sparkles,
  Wand2,
  Loader2,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  useLatestScript,
  useScriptVersions,
  useScenes,
  useCreateScene,
} from "@/hooks/useProjectQueries";
import { PropertyRow } from "../../layout";

/**
 * 剧本模式 - 左侧边栏
 *
 * 内容:
 * - 剧本大纲（从 Markdown 标题提取章节目录树）
 * - 版本历史列表（script_versions）
 */
export function ScriptLeftSidebar() {
  const { projectId } = useParams();
  const { data: latestScript } = useLatestScript(projectId ?? "");
  const { data: versions = [] } = useScriptVersions(projectId ?? "");

  // 从 Markdown 内容提取标题目录
  // MDXEditor 序列化标题时可能输出多种格式：
  //   - 标准格式: "# 第一章"（# + 空格 + 文本，同一行）
  //   - 换行格式: "#\n第一章"（# + 换行 + 文本，跨两行）
  // 需要同时兼容这两种情况
  const outline = useMemo(() => {
    const content = latestScript?.content ?? "";
    const lines = content.split("\n");
    const headings: { level: number; text: string; line: number }[] = [];

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];

      // 情况 1: 标准格式 "# 标题文本"
      const inlineMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (inlineMatch) {
        headings.push({
          level: inlineMatch[1].length,
          text: inlineMatch[2].trim(),
          line: idx,
        });
        continue;
      }

      // 情况 2: MDXEditor 换行格式 — 当前行仅有 "#"，下一行是标题文本
      const hashOnlyMatch = line.match(/^(#{1,6})\s*$/);
      if (hashOnlyMatch && idx + 1 < lines.length) {
        const nextLine = lines[idx + 1].trim();
        if (nextLine.length > 0 && !nextLine.startsWith("#")) {
          headings.push({
            level: hashOnlyMatch[1].length,
            text: nextLine,
            line: idx,
          });
          idx++; // 跳过下一行（已消费）
        }
      }
    }

    return headings;
  }, [latestScript?.content]);

  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <Card variant="default" className="h-full flex flex-col overflow-hidden">
      {/* 标题 */}
      <div className="p-4 border-b border-black/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-bold">剧本导航</h2>
            <p className="text-[10px] text-[var(--muted-foreground)]">大纲与版本</p>
          </div>
        </div>
      </div>

      {/* 大纲区域 — 占据全部剩余空间，独立滚动 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-2 shrink-0">
          <LabelIndustrial className="px-2 block">
            大纲
            {outline.length > 0 && (
              <span className="ml-2 text-[var(--muted-foreground)] font-normal">
                {outline.length}
              </span>
            )}
          </LabelIndustrial>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-4 pb-4">
            {outline.length === 0 ? (
              <div className="py-6 text-center text-[var(--muted-foreground)]">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                <p className="text-xs">暂无大纲</p>
                <p className="text-xs mt-1">在剧本中使用 # 标题创建结构</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {outline.map((heading, idx) => (
                  <div
                    key={idx}
                    className="flex items-center p-2 rounded-[10px] hover:bg-black/5 cursor-pointer transition-colors text-sm"
                    style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                  >
                    <span className="text-[var(--muted-foreground)] text-xs mr-2 shrink-0">
                      {"#".repeat(heading.level)}
                    </span>
                    <span className="min-w-0 truncate">{heading.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 版本历史 — 底部折叠面板 */}
      <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className="shrink-0 border-t border-black/5">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] transition-colors text-sm">
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[var(--muted-foreground)]" strokeWidth={2} />
            <span className="font-medium text-xs">版本历史</span>
            {versions.length > 0 && (
              <span className="text-[10px] text-[var(--muted-foreground)] bg-black/5 px-1.5 py-0.5 rounded-full">
                {versions.length}
              </span>
            )}
          </div>
          <ChevronUp
            className={`w-3.5 h-3.5 text-[var(--muted-foreground)] transition-transform duration-200 ${
              historyOpen ? "" : "rotate-180"
            }`}
            strokeWidth={2}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="max-h-[200px] overflow-y-auto scrollbar-thin">
            <div className="px-4 pb-3 space-y-1">
              {versions.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)] text-center py-3">
                  暂无版本记录
                </p>
              ) : (
                <>
                  {versions.slice(0, 10).map((v, idx) => (
                    <div
                      key={v.id}
                      className={`p-2 rounded-[10px] text-xs transition-colors ${
                        idx === 0
                          ? "bg-white shadow-sm border border-white/60"
                          : "hover:bg-black/5 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          v{v.version_no}
                          {idx === 0 && (
                            <span className="ml-1.5 text-[var(--accent)]">当前</span>
                          )}
                        </span>
                        <span className="text-[var(--muted-foreground)]">
                          {v.source === "ai" ? "AI" : "手动"}
                        </span>
                      </div>
                      <p className="text-[var(--muted-foreground)] mt-0.5">
                        {new Date(v.created_at).toLocaleString("zh-CN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                  {versions.length > 10 && (
                    <p className="text-xs text-[var(--muted-foreground)] text-center pt-1">
                      还有 {versions.length - 10} 个更早版本
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

/**
 * 剧本模式 - 右侧边栏
 *
 * 内容:
 * - AI 写作助手（扩写 + 生成分镜快捷入口）
 * - 剧本统计信息
 */
export function ScriptRightSidebar() {
  const { projectId } = useParams();
  const { data: latestScript } = useLatestScript(projectId ?? "");
  const { data: scenes = [] } = useScenes(projectId ?? "");
  const createScene = useCreateScene();

  // 统计信息
  const content = latestScript?.content ?? "";
  const charCount = content.replace(/\s/g, "").length;
  const paragraphCount = content
    .split(/\n{2,}/)
    .filter((p) => p.trim().length > 0).length;

  // AI 扩写（Phase 4 接入）
  const handleAiExpand = () => {
    if (!content.trim()) {
      toast.warning("请先输入一些内容，AI 才能帮你扩写");
      return;
    }
    toast.info("AI 扩写功能将在后续版本接入，敬请期待");
  };

  // 生成分镜
  const handleGenerateScenes = async () => {
    if (!content.trim()) {
      toast.warning("请先编写剧本内容再生成分镜");
      return;
    }
    if (!projectId) return;

    const paragraphs = content
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !p.startsWith("#"));

    if (paragraphs.length === 0) {
      toast.warning("未找到有效的段落内容");
      return;
    }

    if (scenes.length > 0) {
      toast.info(`已有 ${scenes.length} 个分镜，新内容将追加到末尾`);
    }

    try {
      let created = 0;
      for (const text of paragraphs) {
        await createScene.mutateAsync({
          project_id: projectId,
          scene_text: text,
          duration_ms: 3000,
        });
        created++;
      }
      toast.success(`已生成 ${created} 个分镜场景`);
    } catch {
      toast.error("生成分镜失败");
    }
  };

  return (
    <Card variant="default" className="h-full flex flex-col overflow-hidden">
      {/* 标题 */}
      <div className="p-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[var(--accent)] to-[var(--success)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-bold">AI 写作助手</h2>
            <p className="text-[10px] text-[var(--muted-foreground)]">智能创作辅助</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* 快捷操作 */}
          <div className="space-y-3">
            <LabelIndustrial>快捷操作</LabelIndustrial>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full gap-2 justify-start"
                onClick={handleAiExpand}
              >
                <Wand2 className="w-4 h-4" strokeWidth={2} />
                AI 扩写
              </Button>
              <Button
                variant="secondary"
                className="w-full gap-2 justify-start"
                onClick={handleGenerateScenes}
                disabled={createScene.isPending}
              >
                {createScene.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                )}
                生成分镜
              </Button>
            </div>
          </div>

          <Separator className="bg-black/5" />

          {/* AI 提示词（占位） */}
          <div className="space-y-3">
            <LabelIndustrial>AI 提示词</LabelIndustrial>
            <Textarea
              placeholder="描述你想要生成的内容..."
              className="min-h-[100px]"
              disabled
            />
            <Button className="w-full gap-2" disabled>
              <Wand2 className="w-4 h-4" strokeWidth={2} />
              生成内容
            </Button>
            <p className="text-xs text-[var(--muted-foreground)] text-center">
              AI 功能将在后续版本开放
            </p>
          </div>

          <Separator className="bg-black/5" />

          {/* 剧本统计 */}
          <div className="space-y-3">
            <LabelIndustrial>剧本统计</LabelIndustrial>
            <Card variant="inset" className="p-4 space-y-3">
              <PropertyRow label="字数" value={`${charCount} 字`} />
              <PropertyRow label="段落数" value={`${paragraphCount} 段`} />
              <PropertyRow
                label="版本"
                value={latestScript ? `v${latestScript.version_no}` : "暂无"}
              />
              <PropertyRow label="已生成分镜" value={`${scenes.length} 个`} />
            </Card>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
