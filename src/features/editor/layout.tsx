import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { Group, Panel, Separator as PanelSeparator } from "react-resizable-panels";
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  Card,
  Skeleton,
} from "@/components/ui";
import {
  ArrowLeft,
  FileText,
  LayoutGrid,
  Film,
  Save,
  Undo,
  Redo,
  Play,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useProject, useUpdateProject } from "@/hooks/useProjectQueries";
import { useWorkerStatus, useTasks } from "@/hooks/useWorkerQueries";
import { SidebarProvider, useSidebarContext } from "./context/sidebar-context";
import { WorkerStatusBadge } from "./components/WorkerStatusBadge";
import { TaskQueuePanel } from "./components/TaskQueuePanel";

/**
 * 编辑器主布局 - Zen-iOS Hybrid 风格
 *
 * 设计规范:
 * - 毛玻璃侧边栏
 * - 层级堆叠效果
 * - 大圆角和呼吸感间距
 * - 触觉反馈按钮
 *
 * Slot 模式:
 * - 左右侧边栏内容由各 Workspace 通过 useSidebar Hook 注入
 * - EditorLayout 仅作为容器，读取 SidebarContext 渲染插槽
 */
export function EditorLayout() {
  return (
    <SidebarProvider>
      <EditorLayoutContent />
    </SidebarProvider>
  );
}

function EditorLayoutContent() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const { data: project } = useProject(projectId ?? "");
  const updateMutation = useUpdateProject();
  const { leftSidebar, rightSidebar } = useSidebarContext();

  // 拉取初始 Worker 状态和任务列表，确保首屏数据可用
  useWorkerStatus();
  useTasks();

  // 根据当前路径确定激活的 tab
  const getActiveTab = () => {
    if (location.pathname.includes("/script")) return "script";
    if (location.pathname.includes("/storyboard")) return "storyboard";
    if (location.pathname.includes("/video")) return "video";
    return "script";
  };

  const handleTabChange = (value: string) => {
    navigate(`/editor/${projectId}/${value}`);
  };

  const handlePreview = () => {
    navigate(`/editor/${projectId}/video`);
    toast.info("已切换到视频预览");
  };

  const handleSave = async () => {
    if (!projectId || !project) return;
    try {
      await updateMutation.mutateAsync({
        projectId,
        input: { name: project.name },
      });
      toast.success("项目已保存");
    } catch {
      toast.error("保存失败，请重试");
    }
  };

  const handleExport = () => {
    toast.info("导出功能开发中，敬请期待");
  };

  const statusLabel: Record<string, string> = {
    draft: "草稿",
    rendering: "渲染中",
    completed: "已完成",
    failed: "失败",
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] pt-[var(--titlebar-height)]">
      {/* macOS Overlay 标题栏拖拽区域 */}
      <div
        className="fixed top-0 left-0 right-0 z-[60]"
        data-tauri-drag-region
        style={{ height: "var(--titlebar-height)" }}
      />
      {/* 顶部工具栏 - 毛玻璃效果 + 可拖拽 */}
      <header
        className="h-14 flex items-center justify-between px-5 shrink-0 glass border-b-0"
        data-tauri-drag-region
      >
        {/* 左侧：返回 + 项目名 */}
        <div className="flex items-center gap-4" data-tauri-no-drag>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </Button>

          <div className="h-6 w-px bg-black/10" />

          <div>
            <span className="text-sm font-semibold text-[var(--foreground)]">{project?.name ?? "加载中..."}</span>
            <span className="ml-2 text-xs text-[var(--muted-foreground)]">{statusLabel[project?.status ?? ""] ?? "草稿"}</span>
          </div>
        </div>

        {/* 中间：模式切换 - 毛玻璃分段控制器 */}
        <div className="glass rounded-full p-1" data-tauri-no-drag>
          <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
            <TabsList className="bg-transparent gap-1">
              <TabsTrigger
                value="script"
                className="gap-2 rounded-full px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <FileText className="w-4 h-4" strokeWidth={2} />
                剧本
              </TabsTrigger>
              <TabsTrigger
                value="storyboard"
                className="gap-2 rounded-full px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <LayoutGrid className="w-4 h-4" strokeWidth={2} />
                分镜
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="gap-2 rounded-full px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Film className="w-4 h-4" strokeWidth={2} />
                视频
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2" data-tauri-no-drag>
          <Button variant="ghost" size="icon-sm" title="撤销">
            <Undo className="w-4 h-4" strokeWidth={2} />
          </Button>
          <Button variant="ghost" size="icon-sm" title="重做">
            <Redo className="w-4 h-4" strokeWidth={2} />
          </Button>

          <div className="h-6 w-px bg-black/10 mx-1" />

          <Button variant="ghost" size="icon-sm" title="预览" onClick={handlePreview}>
            <Play className="w-4 h-4" strokeWidth={2} />
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            title="保存"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
            ) : (
              <Save className="w-4 h-4" strokeWidth={2} />
            )}
          </Button>

          <Button size="sm" className="gap-2 ml-2" onClick={handleExport}>
            <Download className="w-4 h-4" strokeWidth={2} />
            导出
          </Button>

          <div className="h-6 w-px bg-black/10 mx-1" />

          <WorkerStatusBadge />
        </div>
      </header>

      {/* 主内容区 - 三栏布局 */}
      <main className="flex-1 overflow-hidden p-2">
        <Group
          orientation="horizontal"
          id="editor-layout-v2"
          className="h-full"
          defaultLayout={{ "editor-left": 18, "editor-main": 60, "editor-right": 22 }}
        >
          {/* 左侧面板 - 由 Workspace 通过 useSidebar 注入 */}
          <Panel id="editor-left" defaultSize={18} minSize={12}>
            {leftSidebar ?? <SidebarFallback />}
          </Panel>

          {/* 拖拽分隔条 */}
          <PanelSeparator className="w-1.5 rounded-full bg-black/[0.08] hover:bg-black/20 active:bg-black/30 transition-colors" />

          {/* 中间工作区 */}
          <Panel id="editor-main" defaultSize={60} minSize={30}>
            <Card variant="solid" className="h-full overflow-hidden">
              <Outlet />
            </Card>
          </Panel>

          {/* 拖拽分隔条 */}
          <PanelSeparator className="w-1.5 rounded-full bg-black/[0.08] hover:bg-black/20 active:bg-black/30 transition-colors" />

          {/* 右侧面板 - 由 Workspace 通过 useSidebar 注入 + 底部任务队列 */}
          <Panel id="editor-right" defaultSize={22} minSize={15}>
            <div className="flex flex-col h-full gap-2">
              <div className="flex-1 min-h-0">
                {rightSidebar ?? <SidebarFallback />}
              </div>
              <Card variant="default" className="shrink-0 max-h-[240px] overflow-hidden">
                <div className="px-3 pt-2 pb-1">
                  <h3 className="text-xs font-semibold text-[var(--muted-foreground)]">任务队列</h3>
                </div>
                <TaskQueuePanel className="max-h-[200px]" />
              </Card>
            </div>
          </Panel>
        </Group>
      </main>
    </div>
  );
}

/**
 * 侧边栏占位 — 在 Workspace 尚未注入内容时显示骨架屏
 */
function SidebarFallback() {
  return (
    <Card variant="default" className="h-full flex flex-col overflow-hidden">
      <div className="p-4 space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full rounded-[14px]" />
        <Skeleton className="h-10 w-full rounded-[14px]" />
        <Skeleton className="h-10 w-full rounded-[14px]" />
      </div>
    </Card>
  );
}

/**
 * 属性行组件 — 供各侧边栏复用
 */
export function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

/**
 * 资源项组件 — 供各侧边栏复用
 */
export function ResourceItem({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="p-3 rounded-[14px] hover:bg-black/5 cursor-pointer text-sm flex items-center gap-3 transition-colors">
      {icon}
      <span className="flex-1">{label}</span>
      <span className="text-xs text-[var(--muted-foreground)] bg-black/5 px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}
