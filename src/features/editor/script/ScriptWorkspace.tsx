import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLatestScript, useCreateScriptVersion } from "@/hooks/useProjectQueries";
import { useSidebar } from "../hooks/use-sidebar";
import { ScriptLeftSidebar, ScriptRightSidebar } from "./components/ScriptSidebar";

import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  linkDialogPlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  CodeToggle,
  BlockTypeSelect,
  ListsToggle,
  Separator as ToolbarSeparator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

/** MDXEditor 中文翻译表 */
const zhCN: Record<string, string> = {
  "toolbar.bold": "加粗",
  "toolbar.removeBold": "取消加粗",
  "toolbar.italic": "斜体",
  "toolbar.removeItalic": "取消斜体",
  "toolbar.inlineCode": "行内代码",
  "toolbar.removeInlineCode": "取消行内代码",
  "toolbar.bulletedList": "无序列表",
  "toolbar.numberedList": "有序列表",
  "toolbar.checkList": "清单列表",
  "toolbar.blockTypeSelect.selectBlockTypeTooltip": "选择段落类型",
  "toolbar.blockTypeSelect.placeholder": "段落类型",
  "toolbar.blockTypes.paragraph": "正文",
  "toolbar.blockTypes.quote": "引用",
  "toolbar.blockTypes.heading": "标题 {{level}}",
  "toolbar.codeBlock": "插入代码块",
  "toolbar.link": "插入链接",
  "toolbar.thematicBreak": "插入分割线",
  "toolbar.undo": "撤销 {{shortcut}}",
  "toolbar.redo": "重做 {{shortcut}}",
  "codeBlock.language": "代码语言",
  "codeBlock.selectLanguage": "选择代码语言",
};

/**
 * MDXEditor translation 函数
 * 优先返回中文翻译，fallback 到默认英文
 */
function editorTranslation(key: string, defaultValue: string, interpolations?: Record<string, unknown>): string {
  let text = zhCN[key] ?? defaultValue;
  if (interpolations) {
    for (const [k, v] of Object.entries(interpolations)) {
      text = text.replace(`{{${k}}}`, String(v));
    }
  }
  return text;
}

/**
 * 剧本工作区 - Markdown 编辑器版
 *
 * 数据流:
 * - 从 script_versions 表读取最新版本 (markdown 格式)
 * - MDXEditor 提供所见即所得的 Markdown 编辑体验
 * - 自动保存至新版本（防抖 2s）
 * - AI 扩写 / 生成分镜 已迁移至右侧边栏 (ScriptRightSidebar)
 */
export function ScriptWorkspace() {
  const { projectId } = useParams();
  const { data: latestScript, isLoading } = useLatestScript(projectId ?? "");
  const createVersion = useCreateScriptVersion();

  // Slot 模式：注入剧本模式专用侧边栏
  useSidebar(<ScriptLeftSidebar />, <ScriptRightSidebar />);

  const editorRef = useRef<MDXEditorMethods>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);
  const contentRef = useRef("");

  // 初始 Markdown 内容 — 等数据库加载完毕后才渲染 MDXEditor
  const [initialMarkdown, setInitialMarkdown] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized.current) return;
    if (latestScript?.content) {
      setInitialMarkdown(latestScript.content);
      contentRef.current = latestScript.content;
      isInitialized.current = true;
    } else if (!isLoading && !latestScript) {
      setInitialMarkdown("");
      contentRef.current = "";
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

  const handleContentChange = (newMarkdown: string) => {
    contentRef.current = newMarkdown;
    scheduleSave(newMarkdown);
  };

  // 字数统计
  const charCount = contentRef.current.replace(/\s/g, "").length;

  if (isLoading || initialMarkdown === null) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-11 border-b border-black/5 shrink-0" />
        <div className="p-6 w-full space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-40 w-full rounded-[12px]" />
          <Skeleton className="h-32 w-full rounded-[12px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* MDXEditor 编辑区（内置工具栏） — 全宽布局 */}
      <div className="flex-1 overflow-auto script-editor-wrapper">
        <MDXEditor
            ref={editorRef}
            markdown={initialMarkdown}
            onChange={handleContentChange}
            translation={editorTranslation}
            placeholder="在这里编写你的视频剧本...

使用 Markdown 格式书写，支持标题、加粗、斜体、列表等。
可以按场景分段描述镜头内容、台词、画面要求等。"
            contentEditableClassName="prose prose-sm max-w-none min-h-[400px] focus:outline-none"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              thematicBreakPlugin(),
              codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
              codeMirrorPlugin({
                codeBlockLanguages: {
                  "": "Plain Text",
                  js: "JavaScript",
                  ts: "TypeScript",
                  jsx: "JSX",
                  tsx: "TSX",
                  css: "CSS",
                  html: "HTML",
                  json: "JSON",
                  python: "Python",
                  bash: "Bash",
                  sql: "SQL",
                  markdown: "Markdown",
                },
              }),
              // markdownShortcutPlugin 必须在 codeBlockPlugin/codeMirrorPlugin 之后
              // 否则初始化时检测不到 codeblock 已激活，代码块快捷键不会注册
              markdownShortcutPlugin(),
              toolbarPlugin({
                toolbarClassName: "script-toolbar",
                toolbarContents: () => (
                  <>
                    <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
                    <ToolbarSeparator />
                    <BlockTypeSelect />
                    <ToolbarSeparator />
                    <ListsToggle />
                    <ToolbarSeparator />
                    <CodeToggle />
                  </>
                ),
              }),
            ]}
          />
        </div>

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
